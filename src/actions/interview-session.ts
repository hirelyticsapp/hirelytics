'use server';

import { getJobApplicationByUuid } from '@/actions/job-application';
import { callAI } from '@/ai';
import { connectToDatabase } from '@/db';
import JobApplication from '@/db/schema/job-application';

export interface InterviewState {
  currentPhase:
    | 'introduction'
    | 'candidate_intro'
    | 'questions'
    | 'final_questions'
    | 'closing'
    | 'completed';
  currentQuestionIndex: number;
  totalQuestions: number;
  questionsAskedByCategory: Record<string, number>; // Track questions asked per category
  maxQuestionsPerCategory: Record<string, number>; // Max questions allowed per category
  completedCategories: string[];
  currentCategory?: string;
  questionHistory: Array<{
    questionId: string;
    categoryType: string;
    question: string;
    asked: boolean;
    answered: boolean;
    isRepeat: boolean; // Track if this was a repeat/clarification
    isClarification: boolean; // Track clarification requests
    timestamp: string; // Changed from Date to string (ISO string)
    userResponse?: string;
    feedback?: string;
  }>;
  clarificationRequests: number; // Track total clarification requests
  actualQuestionsAsked: number; // Track actual questions (excluding clarifications)
  startedAt?: string; // Changed from Date to string (ISO string)
  lastActivityAt?: string; // Changed from Date to string (ISO string)
  estimatedCompletion?: string; // Changed from Date to string (ISO string)
  isWaitingForFinalQuestions?: boolean; // Flag to track if we're waiting for user questions
}

export interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  questionId?: string;
  categoryType?: string;
  isRepeat?: boolean;
  isClarification?: boolean;
}

export interface InterviewResponse {
  success: boolean;
  response?: string;
  feedback?: string;
  nextQuestion?: string;
  error?: string;
  interviewState?: InterviewState;
  isCompleted?: boolean;
  currentPhase?: string;
  progressInfo?: {
    currentQuestion: number;
    totalQuestions: number;
    currentCategory?: string;
    completedCategories: string[];
    remainingCategories: string[];
  };
}

/**
 * Helper function to detect if message is a clarification request
 */
function isClarificationRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();

  const clarificationPhrases = [
    'repeat',
    'say again',
    'explain again',
    'clarify',
    "don't understand",
    "didn't understand",
    'not clear',
    'unclear',
    'what do you mean',
    'can you repeat',
    'please repeat',
    'once more',
    'one more time',
    'could you repeat',
    'repeat the question',
    "didn't hear",
    "didn't catch",
    'come again',
    'pardon me',
    "sorry i didn't catch that",
    "sorry i didn't hear",
    'could you clarify',
    'could you explain',
    "i'm confused",
    'i am confused',
    'not sure i understand',
    'can you rephrase',
    'rephrase that',
    'what was the question',
    'what did you ask',
    'ask again',
  ];

  return clarificationPhrases.some((phrase) => lowerMessage.includes(phrase));
}

/**
 * Helper function to detect if message is asking for final questions
 */
function isAskingForFinalQuestions(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();

  const finalQuestionPhrases = [
    'any questions',
    'do you have questions',
    'questions for me',
    'questions about',
    'want to ask',
    'i have questions',
    'can i ask',
    'final questions',
    'my questions',
    'questions for you',
    'ask you something',
    'few questions',
  ];

  return finalQuestionPhrases.some((phrase) => lowerMessage.includes(phrase));
}

/**
 * Initialize interview session with proper state tracking
 */
export async function initializeInterviewSession(
  applicationUuid: string,
  forceRestart: boolean = false
): Promise<InterviewResponse> {
  try {
    await connectToDatabase();

    // Get application details
    const applicationData = await getJobApplicationByUuid(applicationUuid);
    if (!applicationData) {
      return {
        success: false,
        error: 'Application not found',
      };
    }

    // Check if there's existing interview state
    const existingConversation = applicationData.interviewConversation || [];
    const existingState = applicationData.interviewState;

    if (existingConversation.length > 0 && !forceRestart && existingState) {
      return {
        success: true,
        response: 'Interview session already exists',
        interviewState: existingState,
        currentPhase: existingState.currentPhase,
        progressInfo: {
          currentQuestion: existingState.actualQuestionsAsked,
          totalQuestions: existingState.totalQuestions,
          currentCategory: existingState.currentCategory,
          completedCategories: existingState.completedCategories,
          remainingCategories: Object.keys(existingState.maxQuestionsPerCategory).filter(
            (cat) => !existingState.completedCategories.includes(cat)
          ),
        },
      };
    }

    // Initialize category configuration
    const categoryConfigs = applicationData.instructionsForAi?.categoryConfigs || [];
    const totalQuestions = applicationData.instructionsForAi?.totalQuestions || 5;

    // Setup category tracking
    const questionsAskedByCategory: Record<string, number> = {};
    const maxQuestionsPerCategory: Record<string, number> = {};

    categoryConfigs.forEach((config) => {
      questionsAskedByCategory[config.type] = 0;
      maxQuestionsPerCategory[config.type] = config.numberOfQuestions;
    });

    // Create initial interview state
    const initialInterviewState: InterviewState = {
      currentPhase: 'introduction',
      currentQuestionIndex: 0,
      totalQuestions,
      questionsAskedByCategory,
      maxQuestionsPerCategory,
      completedCategories: [],
      currentCategory: categoryConfigs[0]?.type,
      questionHistory: [],
      clarificationRequests: 0,
      actualQuestionsAsked: 0,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      estimatedCompletion: new Date(
        Date.now() + (applicationData.sessionInstruction?.duration || 30) * 60 * 1000
      ).toISOString(),
      isWaitingForFinalQuestions: false,
    };

    // Generate initial AI introduction
    const introResponse = await generateInterviewIntroduction(applicationData);

    if (!introResponse.success) {
      return {
        success: false,
        error: 'Failed to generate interview introduction',
      };
    }

    // Create initial conversation
    const initialConversation: ConversationMessage[] = [
      {
        role: 'assistant',
        content: introResponse.response || '',
        timestamp: new Date(),
      },
    ];

    // Update application with initial state
    await JobApplication.findOneAndUpdate(
      { uuid: applicationUuid },
      {
        $set: {
          interviewConversation: initialConversation.map((msg) => ({
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: msg.role === 'assistant' ? 'ai' : 'user',
            content: msg.content,
            timestamp: msg.timestamp,
            phase: 'introduction',
            questionIndex: 0,
            questionId: msg.questionId,
            categoryType: msg.categoryType,
            isRepeat: msg.isRepeat || false,
            isClarification: msg.isClarification || false,
          })),
          interviewState: initialInterviewState,
          status: 'in_progress',
        },
      },
      { new: true }
    );

    return {
      success: true,
      response: introResponse.response,
      interviewState: initialInterviewState,
      currentPhase: 'introduction',
      progressInfo: {
        currentQuestion: 0,
        totalQuestions,
        currentCategory: categoryConfigs[0]?.type,
        completedCategories: [],
        remainingCategories: categoryConfigs.map((c) => c.type),
      },
    };
  } catch (error) {
    console.error('Error initializing interview session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize interview session',
    };
  }
}

/**
 * Process user response and generate AI reply with proper question tracking
 */
export async function processInterviewResponse(
  applicationUuid: string,
  userResponse: string
): Promise<InterviewResponse> {
  try {
    await connectToDatabase();

    // Get current application state
    const applicationData = await getJobApplicationByUuid(applicationUuid);
    if (!applicationData || !applicationData.interviewState) {
      return {
        success: false,
        error: 'Interview session not found',
      };
    }

    const currentState = applicationData.interviewState as InterviewState;
    const conversationHistory = applicationData.interviewConversation || [];

    // Check if this is a clarification request
    const isClarification = isClarificationRequest(userResponse);
    const isAsking = isAskingForFinalQuestions(userResponse);

    // Update state based on request type
    const updatedState = { ...currentState };

    if (isClarification) {
      updatedState.clarificationRequests += 1;
      // Don't advance question count for clarification requests
    } else if (currentState.currentPhase === 'questions' && !isAsking) {
      // Only advance for actual question responses
      updatedState.actualQuestionsAsked += 1;

      // Update category tracking
      if (currentState.currentCategory) {
        updatedState.questionsAskedByCategory[currentState.currentCategory] += 1;

        // Check if category is complete
        const maxForCategory = updatedState.maxQuestionsPerCategory[currentState.currentCategory];
        if (updatedState.questionsAskedByCategory[currentState.currentCategory] >= maxForCategory) {
          if (!updatedState.completedCategories.includes(currentState.currentCategory)) {
            updatedState.completedCategories.push(currentState.currentCategory);
          }

          // Move to next category
          const remainingCategories = Object.keys(updatedState.maxQuestionsPerCategory).filter(
            (cat) => !updatedState.completedCategories.includes(cat)
          );

          if (remainingCategories.length > 0) {
            updatedState.currentCategory = remainingCategories[0];
          }
        }
      }
    }

    // Determine next phase based on progress
    let nextPhase = currentState.currentPhase;

    if (currentState.currentPhase === 'introduction') {
      nextPhase = 'candidate_intro';
    } else if (currentState.currentPhase === 'candidate_intro' && !isClarification) {
      nextPhase = 'questions';
    } else if (currentState.currentPhase === 'questions') {
      // Check if all questions are asked
      if (updatedState.actualQuestionsAsked >= updatedState.totalQuestions) {
        nextPhase = 'final_questions';
        updatedState.isWaitingForFinalQuestions = true;
      }
    } else if (currentState.currentPhase === 'final_questions') {
      // If user says they have no questions or we've handled their questions
      if (
        userResponse.toLowerCase().includes('no') ||
        userResponse.toLowerCase().includes("don't have") ||
        userResponse.toLowerCase().includes('no questions')
      ) {
        nextPhase = 'closing';
      }
    } else if (currentState.currentPhase === 'closing') {
      nextPhase = 'completed';
    }

    updatedState.currentPhase = nextPhase as InterviewState['currentPhase'];
    updatedState.lastActivityAt = new Date().toISOString();

    // Generate AI response based on current context
    const aiResponse = await generateContextualAIResponse(
      applicationData,
      userResponse,
      conversationHistory,
      updatedState,
      isClarification,
      isAsking
    );

    if (!aiResponse.success) {
      return {
        success: false,
        error: 'Failed to generate AI response',
      };
    }

    // Add question to history
    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    updatedState.questionHistory.push({
      questionId,
      categoryType: updatedState.currentCategory || 'general',
      question: aiResponse.nextQuestion || '',
      asked: true,
      answered: !isClarification,
      isRepeat: isClarification,
      isClarification,
      timestamp: new Date().toISOString(),
      userResponse: userResponse,
      feedback: aiResponse.feedback,
    });

    // Create new conversation messages
    const newMessages = [
      {
        messageId: `msg_user_${Date.now()}`,
        type: 'user',
        content: userResponse,
        timestamp: new Date(),
        phase: currentState.currentPhase,
        questionIndex: updatedState.actualQuestionsAsked,
        questionId,
        categoryType: updatedState.currentCategory,
        isRepeat: false,
        isClarification,
      },
      {
        messageId: `msg_ai_${Date.now()}`,
        type: 'ai',
        content: aiResponse.nextQuestion || aiResponse.response || '',
        timestamp: new Date(),
        phase: nextPhase,
        questionIndex: updatedState.actualQuestionsAsked,
        questionId,
        categoryType: updatedState.currentCategory,
        isRepeat: isClarification,
        isClarification: false,
      },
    ];

    // Update database
    await JobApplication.findOneAndUpdate(
      { uuid: applicationUuid },
      {
        $push: {
          interviewConversation: { $each: newMessages },
        },
        $set: {
          interviewState: updatedState,
          status: nextPhase === 'completed' ? 'completed' : 'in_progress',
        },
      },
      { new: true }
    );

    return {
      success: true,
      response: aiResponse.nextQuestion || aiResponse.response,
      feedback: aiResponse.feedback,
      nextQuestion: aiResponse.nextQuestion,
      interviewState: updatedState,
      isCompleted: nextPhase === 'completed',
      currentPhase: nextPhase,
      progressInfo: {
        currentQuestion: updatedState.actualQuestionsAsked,
        totalQuestions: updatedState.totalQuestions,
        currentCategory: updatedState.currentCategory,
        completedCategories: updatedState.completedCategories,
        remainingCategories: Object.keys(updatedState.maxQuestionsPerCategory).filter(
          (cat) => !updatedState.completedCategories.includes(cat)
        ),
      },
    };
  } catch (error) {
    console.error('Error processing interview response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process interview response',
    };
  }
}

/**
 * Generate contextual AI response based on interview state and user input
 */
async function generateContextualAIResponse(
  applicationData: Awaited<ReturnType<typeof getJobApplicationByUuid>>,
  userResponse: string,
  conversationHistory: Array<{ type: string; content: string }>,
  interviewState: InterviewState,
  isClarification: boolean,
  isAskingFinalQuestions: boolean
): Promise<{
  success: boolean;
  response?: string;
  feedback?: string;
  nextQuestion?: string;
  error?: string;
}> {
  try {
    const conversationContext = conversationHistory
      .slice(-10) // Last 10 messages for context
      .map((msg) => `${msg.type}: ${msg.content}`)
      .join('\n');

    let systemPrompt = '';
    let phaseInstructions = '';

    // Build phase-specific instructions
    switch (interviewState.currentPhase) {
      case 'introduction':
        phaseInstructions = `INTRODUCTION PHASE: Welcome the candidate warmly and transition to asking for their introduction.`;
        break;

      case 'candidate_intro':
        if (isClarification) {
          phaseInstructions = `CLARIFICATION: The candidate asked for clarification. Politely rephrase your previous request for their introduction.`;
        } else {
          phaseInstructions = `CANDIDATE INTRODUCTION COMPLETE: Acknowledge their background warmly and transition to the structured interview questions. Current category: ${interviewState.currentCategory}`;
        }
        break;

      case 'questions':
        if (isClarification) {
          phaseInstructions = `CLARIFICATION REQUEST: The candidate needs clarification. Politely rephrase the last question without advancing the question count.`;
        } else {
          const currentCat = interviewState.currentCategory || 'general';
          const questionsAsked = interviewState.questionsAskedByCategory[currentCat] || 0;
          const maxQuestions = interviewState.maxQuestionsPerCategory[currentCat] || 1;
          const totalProgress = `${interviewState.actualQuestionsAsked}/${interviewState.totalQuestions}`;

          phaseInstructions = `STRUCTURED QUESTIONS PHASE:
- Progress: ${totalProgress} questions completed
- Current Category: ${currentCat}
- Category Progress: ${questionsAsked}/${maxQuestions} questions in this category
- Provide brief feedback on their answer (1-2 sentences)
- Ask the next question for category: ${currentCat}
- Make questions specific to the job requirements`;
        }
        break;

      case 'final_questions':
        if (isAskingFinalQuestions) {
          phaseInstructions = `FINAL QUESTIONS PHASE: The candidate wants to ask questions. Encourage them and be ready to answer their questions about the role, company, or process.`;
        } else {
          phaseInstructions = `FINAL QUESTIONS OFFER: All structured questions complete. Ask the candidate if they have any questions for you about the role, company, or process. Be encouraging and supportive.`;
        }
        break;

      case 'closing':
        phaseInstructions = `CLOSING PHASE: Provide a warm, professional closing. Thank them for their time, highlight their strengths, and explain next steps.`;
        break;
    }

    // Get job context
    const jobTitle = applicationData.jobDetails?.title || 'position';
    const jobSkills = applicationData.jobDetails?.skills?.join(', ') || 'relevant skills';
    const candidateName = applicationData.candidate?.name || 'candidate';

    systemPrompt = `You are Hirelytics AI conducting a professional interview for the ${jobTitle} position.

CONTEXT:
- Candidate: ${candidateName}
- Role: ${jobTitle}
- Key Skills: ${jobSkills}
- Interview Progress: ${interviewState.actualQuestionsAsked}/${interviewState.totalQuestions} questions
- Current Phase: ${interviewState.currentPhase}
- Clarification Requests: ${interviewState.clarificationRequests}

${phaseInstructions}

CONVERSATION HISTORY:
${conversationContext}

LATEST USER RESPONSE: "${userResponse}"

${
  isClarification
    ? 'RESPOND WITH CLARIFICATION: Politely rephrase or clarify your previous message.'
    : 'RESPOND WITH: Brief feedback (if applicable) + Next question or closing message'
}

Be professional, encouraging, and conversational. Keep responses concise and relevant.`;

    const result = await callAI({
      provider: 'google',
      model: 'gemini-2.0-flash-lite',
      options: {
        prompt: systemPrompt,
        temperature: 0.7,
        maxTokens: 500,
      },
    });

    // Parse response
    const responseText = result.text.trim();

    // For closing phase, return entire response as closing message
    if (interviewState.currentPhase === 'closing') {
      return {
        success: true,
        response: responseText,
        feedback: responseText,
        nextQuestion: '',
      };
    }

    // Try to separate feedback and question
    const sentences = responseText.split(/[.!?]+/).filter((s) => s.trim());
    let feedback = '';
    let nextQuestion = '';

    if (sentences.length >= 2) {
      feedback = sentences
        .slice(0, Math.ceil(sentences.length / 2))
        .join('. ')
        .trim();
      nextQuestion = sentences
        .slice(Math.ceil(sentences.length / 2))
        .join('. ')
        .trim();
    } else {
      if (isClarification || interviewState.currentPhase === 'final_questions') {
        nextQuestion = responseText;
      } else {
        feedback = responseText;
      }
    }

    return {
      success: true,
      response: responseText,
      feedback: feedback || 'Thank you for sharing that.',
      nextQuestion: nextQuestion || responseText,
    };
  } catch (error) {
    console.error('Error generating contextual AI response:', error);
    return {
      success: false,
      error: 'Failed to generate AI response',
    };
  }
}

/**
 * Generate interview introduction
 */
async function generateInterviewIntroduction(
  applicationData: Awaited<ReturnType<typeof getJobApplicationByUuid>>
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const jobTitle = applicationData.jobDetails?.title || 'position';
    const candidateName = applicationData.candidate?.name || '';
    const totalQuestions = applicationData.instructionsForAi?.totalQuestions || 5;
    const duration = applicationData.sessionInstruction?.duration || 30;
    const categories =
      applicationData.instructionsForAi?.categoryConfigs
        ?.map((c: { type: string; numberOfQuestions: number }) => c.type)
        .join(', ') || 'various areas';

    const systemPrompt = `Create a warm, professional interview introduction for Hirelytics AI.

CONTEXT:
- Candidate: ${candidateName}
- Role: ${jobTitle}
- Questions: ${totalQuestions}
- Duration: ${duration} minutes
- Categories: ${categories}

Create an introduction that:
1. Introduces yourself as Hirelytics AI
2. Welcomes the candidate by name
3. States the specific job title
4. Mentions the structure (${totalQuestions} questions across ${categories})
5. Asks for their brief introduction

Be warm, professional, and encouraging. Keep it concise (3-4 sentences).`;

    const result = await callAI({
      provider: 'google',
      model: 'gemini-2.0-flash-lite',
      options: {
        prompt: systemPrompt,
        temperature: 0.8,
        maxTokens: 300,
      },
    });

    return {
      success: true,
      response: result.text.trim(),
    };
  } catch (error) {
    console.error('Error generating interview introduction:', error);
    return {
      success: false,
      error: 'Failed to generate introduction',
    };
  }
}

/**
 * Get current interview state
 */
export async function getInterviewState(applicationUuid: string): Promise<{
  success: boolean;
  interviewState?: InterviewState;
  conversationHistory?: Array<{
    messageId: string;
    type: string;
    content: string;
    timestamp: string; // Changed from Date to string (ISO string)
    phase?: string;
    questionIndex?: number;
    questionId?: string;
    categoryType?: string;
    isRepeat?: boolean;
    isClarification?: boolean;
  }>;
  error?: string;
}> {
  try {
    await connectToDatabase();

    const applicationData = await getJobApplicationByUuid(applicationUuid);
    if (!applicationData) {
      return {
        success: false,
        error: 'Application not found',
      };
    }

    return {
      success: true,
      interviewState: applicationData.interviewState,
      conversationHistory: applicationData.interviewConversation || [],
    };
  } catch (error) {
    console.error('Error getting interview state:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get interview state',
    };
  }
}

/**
 * Complete interview session
 */
export async function completeInterviewSession(
  applicationUuid: string
): Promise<InterviewResponse> {
  try {
    await connectToDatabase();

    const applicationData = await getJobApplicationByUuid(applicationUuid);
    if (!applicationData) {
      return {
        success: false,
        error: 'Application not found',
      };
    }

    const currentState = applicationData.interviewState as InterviewState;

    // Update state to completed
    const completedState: InterviewState = {
      ...currentState,
      currentPhase: 'completed',
      lastActivityAt: new Date().toISOString(),
    };

    // Generate final closing message
    const closingResponse = await generateInterviewIntroduction(applicationData);

    // Update database
    await JobApplication.findOneAndUpdate(
      { uuid: applicationUuid },
      {
        $set: {
          interviewState: completedState,
          status: 'completed',
        },
      },
      { new: true }
    );

    return {
      success: true,
      response: closingResponse.response || 'Thank you for completing the interview!',
      interviewState: completedState,
      isCompleted: true,
      currentPhase: 'completed',
    };
  } catch (error) {
    console.error('Error completing interview session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete interview session',
    };
  }
}
