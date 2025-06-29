'use server';

import { getJobApplicationByUuid } from '@/actions/job-application';
import { callAI } from '@/ai';

export interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export interface InterviewPhase {
  current: 'introduction' | 'candidate_intro' | 'questions' | 'closing';
  questionIndex: number;
  totalQuestions: number;
}

export interface JobApplicationContext {
  candidate?: {
    name?: string;
    email?: string;
  };
  jobDetails?: {
    title?: string;
    description?: string;
    skills?: string[];
    requirements?: string;
    benefits?: string;
  };
  instructionsForAi?: {
    instruction?: string;
    difficultyLevel?: 'easy' | 'normal' | 'hard';
    questionMode?: 'manual' | 'ai-generated';
    totalQuestions?: number;
    categoryConfigs?: Array<{
      type: string;
      numberOfQuestions: number;
    }>;
    questions?: Array<{
      id: string;
      type: string;
      question: string;
      isAIGenerated: boolean;
    }>;
  };
  sessionInstruction?: {
    duration?: string;
  };
  preferredLanguage?: string;
}

export interface AIInterviewResponse {
  success: boolean;
  response?: string;
  feedback?: string;
  nextQuestion?: string;
  error?: string;
  phase?: InterviewPhase;
}

/**
 * Generate AI interview response based on conversation history
 * @param conversationHistory - Array of previous messages in the conversation
 * @param userResponse - Latest user response to process
 * @param jobApplicationContext - Complete job application context from database
 * @param currentPhase - Current interview phase information
 * @returns AI response with feedback and next question
 */
export async function generateAIInterviewResponse(
  conversationHistory: ConversationMessage[],
  userResponse: string,
  jobApplicationContext?: JobApplicationContext,
  currentPhase?: InterviewPhase
): Promise<AIInterviewResponse> {
  try {
    // Build context from conversation history
    const conversationContext = conversationHistory
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Determine current interview phase and next action
    const totalQuestions = jobApplicationContext?.instructionsForAi?.totalQuestions || 5;
    const currentQuestionIndex = currentPhase?.questionIndex || 0;
    const phase = currentPhase?.current || 'candidate_intro';

    let phaseInstructions = '';
    let nextPhase: InterviewPhase = {
      current: phase,
      questionIndex: currentQuestionIndex,
      totalQuestions,
    };

    if (phase === 'candidate_intro') {
      phaseInstructions = `You are in the CANDIDATE INTRODUCTION phase. The candidate just provided their background introduction. 

RESPONSE FORMAT:
1. Give a warm, specific acknowledgment of their background (2-3 sentences)
2. Highlight relevant experience that connects to the ${jobApplicationContext?.jobDetails?.title || 'role'}
3. Smoothly transition to the first structured interview question

Be conversational, encouraging, and professional. Make them feel comfortable before moving to questions.`;
      nextPhase = {
        current: 'questions',
        questionIndex: 1,
        totalQuestions,
      };
    } else if (phase === 'questions') {
      if (currentQuestionIndex >= totalQuestions) {
        phaseInstructions = `You have completed all ${totalQuestions} interview questions. CLOSING PHASE: 
1. Thank the candidate warmly for their time and thoughtful responses
2. Acknowledge their qualifications for the ${jobApplicationContext?.jobDetails?.title || 'position'}
3. Mention that the interview is now complete
4. Explain next steps professionally (HR will be in touch, etc.)
5. End with encouraging words about their candidacy

Be warm, appreciative, and professional in your closing.`;
        nextPhase = {
          current: 'closing',
          questionIndex: totalQuestions,
          totalQuestions,
        };
      } else {
        phaseInstructions = `You are in the QUESTIONS phase. This is question ${currentQuestionIndex} of ${totalQuestions}.

RESPONSE FORMAT:
1. Give thoughtful acknowledgment/feedback on their previous answer (1-2 sentences)
2. Ask the next structured interview question

QUESTION PRIORITIZATION:
${
  jobApplicationContext?.instructionsForAi?.questions?.length
    ? `- Use the predefined questions from the job application setup: ${jobApplicationContext.instructionsForAi.questions.map((q) => q.question).join('; ')}
   - Ask these questions in order, adapting them naturally to the conversation flow`
    : `- Generate relevant questions based on the job requirements and skills: ${jobApplicationContext?.jobDetails?.skills?.join(', ') || 'professional skills'}
   - Focus on practical scenarios and experience related to this specific role`
}

HANDLE USER REQUESTS:
- If user asks to "repeat" or "skip" a question, acknowledge politely: "Of course, let me rephrase that" or "Certainly, let's move to the next question"
- If user asks to "come back later", respond: "Absolutely, we can revisit that topic later in our conversation"
- Always be accommodating and professional

Make the question specific to the ${jobApplicationContext?.jobDetails?.title || 'role'} and industry context.`;
        nextPhase = {
          current: 'questions',
          questionIndex: currentQuestionIndex + 1,
          totalQuestions,
        };
      }
    } else if (phase === 'closing') {
      phaseInstructions = `CLOSING PHASE: The interview is complete. 
1. Thank the candidate sincerely for their time and excellent responses
2. Highlight their strengths relevant to the ${jobApplicationContext?.jobDetails?.title || 'position'}
3. Confirm the interview has concluded successfully
4. Mention next steps (HR team will review and be in touch)
5. Wish them well and express appreciation for their interest

Make this a memorable, positive ending that leaves them feeling confident.`;
    }

    // Create concise system prompt for AI interviewer
    const systemPrompt = `You are Hirelytics AI conducting a professional interview for the ${jobApplicationContext?.jobDetails?.title || 'position'}.

${phaseInstructions}

Job Context:
- Role: ${jobApplicationContext?.jobDetails?.title || 'Position'}
- Skills: ${jobApplicationContext?.jobDetails?.skills?.join(', ') || 'Professional skills'}
- Candidate: ${jobApplicationContext?.candidate?.name || 'Candidate'}
- Questions: ${currentPhase?.questionIndex || 1} of ${totalQuestions}

Conversation History:
${conversationContext}

Latest Response: "${userResponse}"

Instructions:
1. Acknowledge their response with specific feedback (1-2 sentences)
2. ${currentPhase?.current === 'closing' ? 'Provide a warm, complete closing message with thanks and next steps' : `Ask one relevant question for the ${jobApplicationContext?.jobDetails?.title || 'role'}`}
3. Be warm, professional, and conversational
4. Handle requests gracefully: "repeat" → rephrase, "skip" → move on, "later" → acknowledge
5. Use job-specific skills: ${jobApplicationContext?.jobDetails?.skills?.slice(0, 3).join(', ') || 'relevant skills'}

${
  currentPhase?.current === 'closing'
    ? 'Provide a complete closing message, not just feedback and question.'
    : 'Respond in JSON:\n{\n  "feedback": "Brief constructive feedback",\n  "nextQuestion": "Your job-specific question"\n}'
}`;

    const result = await callAI({
      provider: 'google',
      model: 'gemini-2.0-flash-lite',
      options: {
        prompt: systemPrompt,
        temperature: 0.7,
        maxTokens: 600,
      },
    });

    // Parse the AI response
    let parsedResponse;
    try {
      // For closing phase, use the entire response as feedback
      if (currentPhase?.current === 'closing') {
        parsedResponse = {
          feedback: result.text.trim(),
          nextQuestion: '', // No next question in closing phase
        };
      } else {
        // Try to extract JSON from the response
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: split the response into feedback and question
          const lines = result.text.split('\n').filter((line) => line.trim());
          const jobTitle = jobApplicationContext?.jobDetails?.title || 'this role';
          const skills =
            jobApplicationContext?.jobDetails?.skills?.join(', ') || 'the required skills';

          parsedResponse = {
            feedback: lines[0] || 'Thank you for sharing that with me.',
            nextQuestion:
              lines[lines.length - 1] ||
              `Could you tell me more about your experience with ${skills} and how it relates to the ${jobTitle} position?`,
          };
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON, using fallback:', parseError);
      // Fallback response
      const jobTitle = jobApplicationContext?.jobDetails?.title || 'this role';
      const skills = jobApplicationContext?.jobDetails?.skills?.[0] || 'professional skills';

      if (currentPhase?.current === 'closing') {
        parsedResponse = {
          feedback: `Thank you so much for taking the time to discuss the ${jobTitle} position with me today. Your experience and insights have been truly valuable, and I appreciate your thoughtful responses throughout our conversation. This concludes our interview, and our HR team will be reviewing your candidacy. We'll be in touch soon with next steps. Best of luck, and thank you again for your interest in joining our team!`,
          nextQuestion: '',
        };
      } else {
        parsedResponse = {
          feedback: 'I appreciate you sharing that insight with me.',
          nextQuestion: `Can you describe a challenging situation you faced in your career related to ${skills} and how you approached solving it for a ${jobTitle} position?`,
        };
      }
    }

    return {
      success: true,
      response: result.text,
      feedback: parsedResponse.feedback,
      nextQuestion: parsedResponse.nextQuestion,
      phase: nextPhase,
    };
  } catch (error) {
    console.error('Error generating AI interview response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate AI response',
    };
  }
}

/**
 * Generate initial AI interview introduction
 * @param jobApplicationContext - Complete job application context from database
 * @returns AI introduction message
 */
export async function generateInterviewIntroduction(
  jobApplicationContext?: JobApplicationContext
): Promise<AIInterviewResponse> {
  try {
    const systemPrompt = `You are Hirelytics AI conducting a professional interview. Create a warm, welcoming introduction.

Job Data:
- Role: ${jobApplicationContext?.jobDetails?.title || 'the position'}
- Candidate: ${jobApplicationContext?.candidate?.name || 'Candidate'}
- Skills Focus: ${jobApplicationContext?.jobDetails?.skills?.slice(0, 3).join(', ') || 'professional skills'}
- Total Questions: ${jobApplicationContext?.instructionsForAi?.totalQuestions || 5}
- Duration: ${jobApplicationContext?.sessionInstruction?.duration || '30'} minutes

Create an introduction that:
1. Introduces yourself as Hirelytics AI
2. Welcomes the candidate by name if available
3. States the specific job title
4. Mentions the number of questions and skill focus areas
5. Asks for their brief introduction

Be warm, professional, and encouraging. Use actual job data, never placeholders.`;

    const result = await callAI({
      provider: 'google',
      model: 'gemini-2.0-flash-lite',
      options: {
        prompt: systemPrompt,
        temperature: 0.8,
        maxTokens: 400,
      },
    });

    return {
      success: true,
      response: result.text.trim(),
      nextQuestion: result.text.trim(),
      phase: {
        current: 'introduction',
        questionIndex: 0,
        totalQuestions: jobApplicationContext?.instructionsForAi?.totalQuestions || 5,
      },
    };
  } catch (error) {
    console.error('Error generating interview introduction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate introduction',
      nextQuestion: jobApplicationContext?.jobDetails?.title
        ? `Hello${jobApplicationContext?.candidate?.name ? ` ${jobApplicationContext.candidate.name}` : ''}! I'm Hirelytics AI and it's truly a pleasure to meet you. I'll be conducting your interview today for the ${jobApplicationContext.jobDetails.title} position, and I'm genuinely excited to learn about your background. We have ${jobApplicationContext?.instructionsForAi?.totalQuestions || 5} thoughtfully structured questions covering ${jobApplicationContext.jobDetails.skills?.slice(0, 3).join(', ') || 'key competencies'} to explore your qualifications for this role. I'll provide encouraging feedback throughout our conversation and guide you through each section. To begin this journey together, could you please share a warm introduction about yourself and what draws you to the ${jobApplicationContext.jobDetails.title} field? I'd love to hear your story.`
        : "Hello! I'm Hirelytics AI and it's wonderful to connect with you today. I'll be conducting your interview and I'm genuinely excited to learn about your professional journey. We have several thoughtfully structured questions to explore your qualifications, and I'll provide encouragement and feedback throughout our conversation. To start, could you please introduce yourself and share what motivates you in your professional life? I'd love to hear about your background and aspirations.",
    };
  }
}

/**
 * Generate AI interview response with UUID - fetches job application data automatically
 * @param conversationHistory - Array of previous messages in the conversation
 * @param userResponse - Latest user response to process
 * @param applicationUuid - UUID of the job application to fetch context
 * @param currentPhase - Current interview phase information
 * @returns AI response with feedback and next question
 */
export async function generateAIInterviewResponseWithUuid(
  conversationHistory: ConversationMessage[],
  userResponse: string,
  applicationUuid: string,
  currentPhase?: InterviewPhase
): Promise<AIInterviewResponse> {
  try {
    // Fetch job application data using UUID
    const jobApplicationData = await getJobApplicationByUuid(applicationUuid);

    // Transform the data to JobApplicationContext format
    const jobApplicationContext: JobApplicationContext = {
      candidate: {
        name: jobApplicationData.candidate?.name,
        email: jobApplicationData.candidate?.email,
      },
      jobDetails: {
        title: jobApplicationData.jobDetails?.title,
        description: jobApplicationData.jobDetails?.description,
        skills: jobApplicationData.jobDetails?.skills,
        requirements: jobApplicationData.jobDetails?.requirements,
        benefits: jobApplicationData.jobDetails?.benefits,
      },
      instructionsForAi: jobApplicationData.instructionsForAi
        ? {
            instruction: jobApplicationData.instructionsForAi.instruction,
            difficultyLevel:
              jobApplicationData.instructionsForAi.difficultyLevel === 'expert' ||
              jobApplicationData.instructionsForAi.difficultyLevel === 'advanced'
                ? 'hard'
                : (jobApplicationData.instructionsForAi.difficultyLevel as
                    | 'easy'
                    | 'normal'
                    | 'hard'),
            questionMode:
              jobApplicationData.instructionsForAi.questionMode === 'ai-mode'
                ? 'ai-generated'
                : (jobApplicationData.instructionsForAi.questionMode as 'manual' | 'ai-generated'),
            totalQuestions: jobApplicationData.instructionsForAi.totalQuestions,
            categoryConfigs: jobApplicationData.instructionsForAi.categoryConfigs,
            questions: jobApplicationData.instructionsForAi.questions,
          }
        : undefined,
      sessionInstruction: {
        duration: jobApplicationData.sessionInstruction?.duration?.toString() || '30',
      },
      preferredLanguage: jobApplicationData.preferredLanguage,
    };

    // Call the original function with the fetched context
    return await generateAIInterviewResponse(
      conversationHistory,
      userResponse,
      jobApplicationContext,
      currentPhase
    );
  } catch (error) {
    console.error('Error fetching job application data:', error);
    // Fallback to original function without context
    return await generateAIInterviewResponse(
      conversationHistory,
      userResponse,
      undefined,
      currentPhase
    );
  }
}

/**
 * Generate initial AI interview introduction with UUID - fetches job application data automatically
 * @param applicationUuid - UUID of the job application to fetch context
 * @returns AI introduction message
 */
export async function generateInterviewIntroductionWithUuid(
  applicationUuid: string
): Promise<AIInterviewResponse> {
  try {
    // Fetch job application data using UUID
    const jobApplicationData = await getJobApplicationByUuid(applicationUuid);

    // Transform the data to JobApplicationContext format
    const jobApplicationContext: JobApplicationContext = {
      candidate: {
        name: jobApplicationData.candidate?.name,
        email: jobApplicationData.candidate?.email,
      },
      jobDetails: {
        title: jobApplicationData.jobDetails?.title,
        description: jobApplicationData.jobDetails?.description,
        skills: jobApplicationData.jobDetails?.skills,
        requirements: jobApplicationData.jobDetails?.requirements,
        benefits: jobApplicationData.jobDetails?.benefits,
      },
      instructionsForAi: jobApplicationData.instructionsForAi
        ? {
            instruction: jobApplicationData.instructionsForAi.instruction,
            difficultyLevel:
              jobApplicationData.instructionsForAi.difficultyLevel === 'expert' ||
              jobApplicationData.instructionsForAi.difficultyLevel === 'advanced'
                ? 'hard'
                : (jobApplicationData.instructionsForAi.difficultyLevel as
                    | 'easy'
                    | 'normal'
                    | 'hard'),
            questionMode:
              jobApplicationData.instructionsForAi.questionMode === 'ai-mode'
                ? 'ai-generated'
                : (jobApplicationData.instructionsForAi.questionMode as 'manual' | 'ai-generated'),
            totalQuestions: jobApplicationData.instructionsForAi.totalQuestions,
            categoryConfigs: jobApplicationData.instructionsForAi.categoryConfigs,
            questions: jobApplicationData.instructionsForAi.questions,
          }
        : undefined,
      sessionInstruction: {
        duration: jobApplicationData.sessionInstruction?.duration?.toString() || '30',
      },
      preferredLanguage: jobApplicationData.preferredLanguage,
    };

    // Call the original function with the fetched context
    return await generateInterviewIntroduction(jobApplicationContext);
  } catch (error) {
    console.error('Error fetching job application data:', error);
    // Fallback to original function without context
    return await generateInterviewIntroduction(undefined);
  }
}
