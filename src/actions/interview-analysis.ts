'use server';

import { getJobApplicationByUuid } from '@/actions/job-application';
import { callAI } from '@/ai';
import { connectToDatabase } from '@/db';
import JobApplication, { type IInterviewAnalysis } from '@/db/schema/job-application';

export interface AnalysisResponse {
  success: boolean;
  analysis?: IInterviewAnalysis;
  error?: string;
}

/**
 * Analyze interview conversation and generate comprehensive analysis
 */
export async function analyzeInterview(applicationUuid: string): Promise<AnalysisResponse> {
  try {
    await connectToDatabase();

    // Get job application data
    const jobApplication = await getJobApplicationByUuid(applicationUuid);

    if (
      !jobApplication.interviewConversation ||
      jobApplication.interviewConversation.length === 0
    ) {
      return {
        success: false,
        error: 'No interview conversation found to analyze',
      };
    }

    // Extract user responses and AI questions
    const conversation = jobApplication.interviewConversation;

    // Build analysis context
    const jobContext = {
      title: jobApplication.jobDetails.title,
      description: jobApplication.jobDetails.description,
      skills: jobApplication.jobDetails.skills,
      requirements: jobApplication.jobDetails.requirements,
      instruction: jobApplication?.instructionsForAi?.instruction,
      difficultyLevel: jobApplication?.instructionsForAi?.difficultyLevel,
      candidateName: jobApplication.candidate.name,
    };

    // Create comprehensive analysis prompt
    const analysisPrompt = `Analyze this interview conversation and provide a comprehensive assessment.

JOB CONTEXT:
- Position: ${jobContext.title}
- Description: ${jobContext.description}
- Required Skills: ${jobContext.skills.join(', ')}
- Requirements: ${jobContext.requirements || 'Standard requirements'}
- Difficulty Level: ${jobContext.difficultyLevel}
- Special Instructions: ${jobContext.instruction}
- Candidate: ${jobContext.candidateName}

INTERVIEW CONVERSATION:
${conversation.map((msg) => `${msg.type.toUpperCase()}: ${msg.content}`).join('\n\n')}

ANALYSIS REQUIREMENTS:
Please provide a comprehensive analysis in the following JSON format:

{
  "overallScore": <number 0-100>,
  "skillsAssessment": [
    {
      "skill": "<skill name>",
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "evidence": ["<quote from responses>"]
    }
  ],
  "questionAnalysis": [
    {
      "questionId": "<question-1>",
      "question": "<AI question>",
      "userResponse": "<user response>",
      "categoryType": "<category>",
      "score": <number 0-100>,
      "feedback": "<detailed feedback>",
      "strengths": ["<strength 1>", "<strength 2>"],
      "areasForImprovement": ["<area 1>", "<area 2>"]
    }
  ],
  "strengths": ["<overall strength 1>", "<overall strength 2>"],
  "areasForImprovement": ["<area 1>", "<area 2>"],
  "recommendation": "<strong_hire|hire|borderline|no_hire>",
  "recommendationReason": "<detailed reason>",
  "detailedFeedback": "<comprehensive feedback>",
  "communicationSkills": {
    "clarity": <number 0-100>,
    "confidence": <number 0-100>,
    "articulation": <number 0-100>,
    "feedback": "<communication feedback>"
  },
  "technicalCompetency": {
    "score": <number 0-100>,
    "feedback": "<technical feedback>",
    "keyInsights": ["<insight 1>", "<insight 2>"]
  },
  "culturalFit": {
    "score": <number 0-100>,
    "feedback": "<cultural fit feedback>",
    "alignmentAreas": ["<alignment area 1>", "<alignment area 2>"]
  }
}

SCORING GUIDELINES:
- 90-100: Exceptional - Exceeds expectations significantly
- 80-89: Strong - Meets expectations with notable strengths
- 70-79: Good - Meets basic expectations
- 60-69: Fair - Some concerns but potentially viable
- Below 60: Poor - Significant concerns

RECOMMENDATION GUIDELINES:
- strong_hire: Exceptional candidate, definitely hire
- hire: Good candidate, recommend hiring
- borderline: Mixed signals, requires further evaluation
- no_hire: Does not meet requirements

Focus on:
1. Technical competency relevant to the ${jobContext.title} role
2. Communication skills and clarity of responses
3. Problem-solving approach and critical thinking
4. Cultural fit and alignment with role requirements
5. Depth of experience and knowledge demonstrated
6. Specific evidence from their responses to support scores

Provide specific quotes from user responses as evidence for your assessments.`;

    // Call AI for analysis
    const result = await callAI({
      provider: 'google',
      model: 'gemini-1.5-pro',
      options: {
        prompt: analysisPrompt,
        temperature: 0.3,
        maxTokens: 4000,
      },
    });

    // Parse AI response
    let analysisData: IInterviewAnalysis;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      // Add timestamp
      analysisData = {
        ...parsedData,
        analyzedAt: new Date(),
      };
    } catch (parseError) {
      console.error('Failed to parse AI analysis response:', parseError);
      return {
        success: false,
        error: 'Failed to parse analysis results',
      };
    }

    // Save analysis to database
    const updatedApplication = await JobApplication.findOneAndUpdate(
      { uuid: applicationUuid },
      {
        $set: {
          interviewAnalysis: analysisData,
          status: 'completed',
        },
      },
      { new: true }
    );

    if (!updatedApplication) {
      return {
        success: false,
        error: 'Failed to save analysis to database',
      };
    }

    return {
      success: true,
      analysis: analysisData,
    };
  } catch (error) {
    console.error('Error analyzing interview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze interview',
    };
  }
}

/**
 * Get existing interview analysis
 */
export async function getInterviewAnalysis(applicationUuid: string): Promise<AnalysisResponse> {
  try {
    await connectToDatabase();

    const jobApplication = await JobApplication.findOne({ uuid: applicationUuid });

    if (!jobApplication) {
      return {
        success: false,
        error: 'Job application not found',
      };
    }

    if (!jobApplication.interviewAnalysis) {
      return {
        success: false,
        error: 'No analysis found - please run analysis first',
      };
    }

    return {
      success: true,
      analysis: jobApplication.interviewAnalysis,
    };
  } catch (error) {
    console.error('Error getting interview analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get analysis',
    };
  }
}
