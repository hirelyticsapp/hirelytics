# AI Interview Integration with Job Application Context

## Overview

The AI interview system now uses complete job application context from the database to provide more personalized and relevant interview experiences.

## Key Features

### 1. **Comprehensive Context Integration**

- **Candidate Information**: Name, email for personalization
- **Job Details**: Title, description, required skills, requirements, benefits
- **AI Instructions**: Custom instructions, difficulty level, question categories
- **Session Settings**: Duration, monitoring preferences
- **Language Preferences**: Localized interview experience

### 2. **Enhanced AI Responses**

- **Natural, Complete Responses**: No placeholders, brackets, or template language
- **Professional Conversation Flow**: Sounds like a real interviewer, not scripted
- **Contextual Personalization**: Uses actual candidate name and job title naturally
- **Specific Feedback**: References details from candidate responses
- **Relevant Follow-ups**: Questions build logically on previous answers
- Questions tailored to specific job requirements
- Difficulty adjustment based on configured level
- Industry-agnostic yet role-specific questioning
- Personalized feedback and follow-ups

### 3. **Response Quality Standards**

- **Complete Sentences**: Full, flowing conversation without gaps
- **No Template Language**: Eliminates [Name], [Role], [Company] placeholders
- **Contextual Integration**: Seamlessly incorporates available job data
- **Professional Tone**: Maintains interview formality while being conversational
- **Specific Details**: References actual job requirements and candidate information

## Usage Example

```typescript
import { useSpeechRecognition } from './hooks/use-speech-recognition';
import { transformJobApplicationToAIContext } from '@/lib/utils/job-utils';

// Job application data from database (example from Nurse Practitioner role)
const jobApplicationData = {
  candidate: {
    name: 'Sumanta Kabiraj',
    email: 'user@hirelytics.app',
  },
  jobDetails: {
    title: 'Nurse Practitioner',
    skills: ['Medical Terminology'],
    requirements: "Bachelor's degree in relevant field or equivalent experience...",
    description: 'We are seeking a qualified professional to join our team...',
  },
  instructionsForAi: {
    instruction: 'Focus on healthcare experience and patient care',
    difficultyLevel: 'normal',
    questionMode: 'manual',
    totalQuestions: 3,
  },
  sessionInstruction: {
    duration: '30',
  },
  preferredLanguage: 'en-IN',
};

// Transform to AI context
const aiContext = transformJobApplicationToAIContext(jobApplicationData);

// Use in interview hook
const { transcriptMessages, conversationHistory, isAITyping } = useSpeechRecognition(
  isInterviewStarted,
  isMuted,
  aiContext // Full job application context
);
```

## AI Behavior

### Introduction Generation

The AI generates personalized introductions like:

> "Hello Sumanta! Welcome to your interview for the Nurse Practitioner position. I'm excited to learn about your healthcare background and experience with medical terminology. This will be a 30-minute conversation where we'll discuss your qualifications and experience. To get started, could you please tell me about your journey in healthcare?"

### Dynamic Questioning

Based on the job context, the AI asks relevant questions such as:

- **For Healthcare Roles**: "Tell me about a challenging patient care situation you've handled."
- **For Any Role**: "Describe a time when you had to learn new skills quickly."
- **Technical Roles**: "How do you stay updated with industry developments?"

### Contextual Feedback

The AI provides feedback that references:

- Specific job requirements mentioned in the job description
- Required skills from the job posting
- Difficulty level appropriate responses
- Industry-relevant scenarios

## Benefits

1. **Personalized Experience**: Each interview feels tailored to the specific role and candidate
2. **Relevant Questioning**: Questions align with actual job requirements
3. **Scalable**: Works across any industry or profession
4. **Contextual**: AI maintains awareness of the entire application context
5. **Flexible**: Adapts to different difficulty levels and instruction types

## Error Handling

The system includes robust fallback mechanisms:

- Default professional questions if AI service fails
- Generic responses if job context is missing
- Graceful degradation to ensure interview continuity

## Future Enhancements

- Integration with specific industry question banks
- Real-time performance scoring based on job requirements
- Multi-language support based on preferred language
- Integration with assessment frameworks
