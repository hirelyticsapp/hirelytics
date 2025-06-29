'use client';

import { useState, useTransition } from 'react';

import {
  completeInterviewSession,
  getInterviewState,
  initializeInterviewSession,
  type InterviewState,
  processInterviewResponse,
} from '@/actions/interview-session';

interface InterviewSystemDemoProps {
  applicationUuid: string;
}

export function InterviewSystemDemo({ applicationUuid }: InterviewSystemDemoProps) {
  const [isPending, startTransition] = useTransition();
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
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
    }>
  >([]);
  const [userInput, setUserInput] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');

  const handleInitialize = () => {
    startTransition(async () => {
      try {
        const result = await initializeInterviewSession(applicationUuid, false);
        if (result.success) {
          setInterviewState(result.interviewState || null);
          setCurrentResponse(result.response || '');
          // Refresh state
          const stateResult = await getInterviewState(applicationUuid);
          if (stateResult.success) {
            setConversationHistory(stateResult.conversationHistory || []);
          }
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  const handleSendResponse = () => {
    if (!userInput.trim()) return;

    startTransition(async () => {
      try {
        const result = await processInterviewResponse(applicationUuid, userInput);
        if (result.success) {
          setInterviewState(result.interviewState || null);
          setCurrentResponse(result.response || '');
          setUserInput('');
          // Refresh conversation history
          const stateResult = await getInterviewState(applicationUuid);
          if (stateResult.success) {
            setConversationHistory(stateResult.conversationHistory || []);
          }
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  const handleComplete = () => {
    startTransition(async () => {
      try {
        const result = await completeInterviewSession(applicationUuid);
        if (result.success) {
          setInterviewState(result.interviewState || null);
          setCurrentResponse(result.response || '');
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  const handleLoadExisting = () => {
    startTransition(async () => {
      try {
        const result = await getInterviewState(applicationUuid);
        if (result.success) {
          setInterviewState(result.interviewState || null);
          setConversationHistory(result.conversationHistory || []);
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">AI Interview System Demo</h1>
        <p className="text-gray-600 mb-4">Application UUID: {applicationUuid}</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleInitialize}
            disabled={isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending ? 'Loading...' : 'Initialize Interview'}
          </button>
          <button
            onClick={handleLoadExisting}
            disabled={isPending}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isPending ? 'Loading...' : 'Load Existing'}
          </button>
          <button
            onClick={handleComplete}
            disabled={isPending || !interviewState}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isPending ? 'Loading...' : 'Complete Interview'}
          </button>
        </div>

        {/* Interview State Display */}
        {interviewState && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Interview State</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Phase:</strong> {interviewState.currentPhase}
              </div>
              <div>
                <strong>Progress:</strong> {interviewState.actualQuestionsAsked}/
                {interviewState.totalQuestions}
              </div>
              <div>
                <strong>Current Category:</strong> {interviewState.currentCategory || 'N/A'}
              </div>
              <div>
                <strong>Clarifications:</strong> {interviewState.clarificationRequests}
              </div>
              <div>
                <strong>Completed Categories:</strong>{' '}
                {interviewState.completedCategories.join(', ') || 'None'}
              </div>
              <div>
                <strong>Waiting for Final Questions:</strong>{' '}
                {interviewState.isWaitingForFinalQuestions ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}

        {/* Current AI Response */}
        {currentResponse && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-semibold mb-2">AI Response</h3>
            <p className="text-gray-700">{currentResponse}</p>
          </div>
        )}

        {/* User Input */}
        {interviewState && interviewState.currentPhase !== 'completed' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="userInput" className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                id="userInput"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response here..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSendResponse}
              disabled={isPending || !userInput.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isPending ? 'Sending...' : 'Send Response'}
            </button>
          </div>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold mb-4">Conversation History</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.map((message, index) => (
                <div
                  key={`${message.messageId || index}`}
                  className={`p-3 rounded-lg ${
                    message.type === 'ai'
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {message.type === 'ai' ? '🤖 AI' : '👤 User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{message.content}</p>
                  {message.phase && (
                    <div className="mt-2 text-xs text-gray-500">
                      Phase: {message.phase} | Question: {message.questionIndex || 0}
                      {message.isClarification && (
                        <span className="ml-2 bg-yellow-100 px-1 rounded">Clarification</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Key Features Implemented</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Question Counting:</strong> Excludes clarification requests from question
                count
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Category Tracking:</strong> Groups questions by categories with progress
                tracking
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Phase Management:</strong> Structured flow from introduction to completion
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Clarification Detection:</strong> Automatically detects and handles
                clarification requests
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Final Questions:</strong> Allows candidates to ask questions before closing
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Database Persistence:</strong> All state and conversation stored in MongoDB
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>
                <strong>Server Actions:</strong> No API routes needed - direct server function calls
              </span>
            </li>
          </ul>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">How to Test</h3>
          <ol className="space-y-2 text-sm">
            <li>
              <strong>1.</strong> Click &ldquo;Initialize Interview&rdquo; to start a new interview
              session
            </li>
            <li>
              <strong>2.</strong> The AI will provide an introduction - respond with your
              self-introduction
            </li>
            <li>
              <strong>3.</strong> Answer the structured questions (will track progress by category)
            </li>
            <li>
              <strong>4.</strong> Try saying &ldquo;repeat&rdquo; or &ldquo;clarify&rdquo; to test
              clarification handling
            </li>
            <li>
              <strong>5.</strong> After all questions, you&apos;ll be asked if you have any
              questions
            </li>
            <li>
              <strong>6.</strong> The interview completes with a closing message
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
