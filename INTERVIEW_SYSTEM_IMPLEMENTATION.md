# AI Interview System - Server Actions Implementation

## Overview

This document describes the enhanced AI interview system that uses server actions instead of API routes. The system implements comprehensive question tracking, category management, and phase-based interview flow with proper handling of clarification requests.

## Key Features

### 1. **Strict Question Counting**

- ✅ Questions are only counted when they're actual interview questions
- ✅ Clarification requests ("repeat", "clarify", "I don't understand") don't count toward the question limit
- ✅ Database flag `actualQuestionsAsked` tracks real questions vs `clarificationRequests`

### 2. **Category-Based Question Management**

- ✅ Questions are grouped by categories (technical, behavioral, etc.)
- ✅ Track progress per category: `questionsAskedByCategory`
- ✅ Automatic category completion and transition
- ✅ Database tracking of `completedCategories`

### 3. **Structured Interview Flow**

```
Introduction → Candidate Intro → Questions → Final Questions → Closing → Completed
```

### 4. **Intelligent Request Handling**

- ✅ Detects clarification requests: "repeat", "say again", "clarify", "I don't understand"
- ✅ Handles candidate questions at the end: "Do you have any questions?"
- ✅ Maintains conversation context while managing flow

### 5. **Comprehensive Database State**

```typescript
interface InterviewState {
  currentPhase:
    | 'introduction'
    | 'candidate_intro'
    | 'questions'
    | 'final_questions'
    | 'closing'
    | 'completed';
  currentQuestionIndex: number;
  totalQuestions: number;
  questionsAskedByCategory: Record<string, number>;
  maxQuestionsPerCategory: Record<string, number>;
  completedCategories: string[];
  currentCategory?: string;
  questionHistory: Array<QuestionHistoryItem>;
  clarificationRequests: number;
  actualQuestionsAsked: number; // Key: Only counts real questions
  startedAt?: Date;
  lastActivityAt?: Date;
  estimatedCompletion?: Date;
  isWaitingForFinalQuestions?: boolean;
}
```

## Server Actions

### 1. `initializeInterviewSession(applicationUuid, forceRestart?)`

- Starts or resumes an interview session
- Generates AI introduction
- Sets up category tracking based on job configuration
- Returns interview state and initial greeting

### 2. `processInterviewResponse(applicationUuid, userResponse)`

- Processes user responses intelligently
- Detects clarification requests vs actual answers
- Manages question counting and category progression
- Updates database state and conversation history
- Returns AI response and updated state

### 3. `getInterviewState(applicationUuid)`

- Retrieves current interview state and conversation history
- Useful for resuming sessions or checking progress

### 4. `completeInterviewSession(applicationUuid)`

- Marks interview as completed
- Generates final closing message
- Updates application status

## Usage Example

```typescript
import {
  initializeInterviewSession,
  processInterviewResponse,
  getInterviewState,
  completeInterviewSession,
} from '@/actions/interview-session';

// Start interview
const result = await initializeInterviewSession('uuid-123');
if (result.success) {
  console.log('AI Introduction:', result.response);
  console.log('Questions to ask:', result.interviewState?.totalQuestions);
}

// Process user responses
const response = await processInterviewResponse('uuid-123', 'Hello, I am John Doe...');
if (response.success) {
  console.log('AI Reply:', response.response);
  console.log('Progress:', response.progressInfo);
}

// Handle clarification (doesn't count as question)
const clarification = await processInterviewResponse('uuid-123', 'Can you repeat that?');
// clarification.interviewState.clarificationRequests will increment
// clarification.interviewState.actualQuestionsAsked stays the same

// Get current state
const state = await getInterviewState('uuid-123');
console.log('Current phase:', state.interviewState?.currentPhase);
console.log('Questions asked:', state.interviewState?.actualQuestionsAsked);
```

## Flow Control Logic

### Question Counting Rules

1. **Real Questions**: Increment `actualQuestionsAsked`
2. **Clarifications**: Increment `clarificationRequests`, repeat previous question
3. **Final Questions**: Special phase, no counting

### Phase Transitions

```typescript
// Automatic phase progression based on state
if (currentPhase === 'introduction') {
  nextPhase = 'candidate_intro';
} else if (currentPhase === 'candidate_intro' && !isClarification) {
  nextPhase = 'questions';
} else if (actualQuestionsAsked >= totalQuestions) {
  nextPhase = 'final_questions';
} else if (userSaysNoQuestions) {
  nextPhase = 'closing';
}
```

### Category Management

```typescript
// Track progress per category
questionsAskedByCategory[currentCategory]++;

// Check if category is complete
if (questionsAsked >= maxQuestionsForCategory) {
  completedCategories.push(currentCategory);
  currentCategory = getNextIncompleteCategory();
}
```

## Database Schema Updates

Added to `JobApplication` schema:

```typescript
{
  interviewState: {
    currentPhase: String,
    currentQuestionIndex: Number,
    totalQuestions: Number,
    questionsAskedByCategory: Map,
    maxQuestionsPerCategory: Map,
    completedCategories: [String],
    currentCategory: String,
    questionHistory: [QuestionHistorySchema],
    clarificationRequests: Number,
    actualQuestionsAsked: Number,
    startedAt: Date,
    lastActivityAt: Date,
    estimatedCompletion: Date,
    isWaitingForFinalQuestions: Boolean
  },
  interviewConversation: [ConversationSchema], // Enhanced with metadata
  status: ['pending', 'in_progress', 'completed', 'reviewed', 'accepted', 'rejected']
}
```

## Testing the System

Use the `InterviewSystemDemo` component:

```tsx
import { InterviewSystemDemo } from '@/components/interview-system-demo';

function TestPage() {
  return <InterviewSystemDemo applicationUuid="your-application-uuid" />;
}
```

### Test Scenarios

1. **Normal Flow**: Answer questions sequentially
2. **Clarification Requests**: Say "repeat" or "clarify" - should not count as questions
3. **Category Progression**: Watch categories complete and transition
4. **Final Questions**: Test the "Do you have questions?" phase
5. **Resume Session**: Refresh page and load existing session

## Benefits of This Implementation

1. **Accurate Question Counting**: Only real answers count toward limits
2. **Better User Experience**: Handles clarifications naturally
3. **Structured Progress**: Clear category-based progression
4. **Database Integrity**: Comprehensive state tracking
5. **Server Actions**: Direct function calls, no API overhead
6. **Type Safety**: Full TypeScript support
7. **Resumable Sessions**: Can continue from any point
8. **Analytics Ready**: Rich data for interview analysis

## Migration from API Routes

Previous API route calls can be replaced:

```typescript
// Old API route approach
const response = await fetch('/api/interview/init', {
  method: 'POST',
  body: JSON.stringify({ applicationUuid }),
});

// New server action approach
const result = await initializeInterviewSession(applicationUuid);
```

## Configuration

Set up job application with proper category configs:

```typescript
{
  instructionsForAi: {
    totalQuestions: 8,
    categoryConfigs: [
      { type: 'technical', numberOfQuestions: 3 },
      { type: 'behavioral', numberOfQuestions: 3 },
      { type: 'situational', numberOfQuestions: 2 }
    ]
  }
}
```

The system will automatically track progress through each category and ensure exactly the specified number of questions are asked.
