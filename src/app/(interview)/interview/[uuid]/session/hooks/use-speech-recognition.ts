import { useCallback, useEffect, useState } from 'react';

import {
  getInterviewState,
  initializeInterviewSession,
  type InterviewState,
  processInterviewResponse,
} from '@/actions/interview-session';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface TranscriptMessage {
  id: number;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  phase?: string;
  questionIndex?: number;
  categoryType?: string;
  isRepeat?: boolean;
  isClarification?: boolean;
}

export interface ConversationHistoryItem {
  messageId: string;
  type: string;
  content: string;
  timestamp: string;
  phase?: string;
  questionIndex?: number;
  questionId?: string;
  categoryType?: string;
  isRepeat?: boolean;
  isClarification?: boolean;
}

/**
 * Custom hook to manage speech recognition and transcript messages
 * Handles speech-to-text conversion and AI response integration with proper interview state management
 */
export const useSpeechRecognition = (
  isInterviewStarted: boolean,
  isMuted: boolean,
  applicationUuid: string
) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);
  const [transcriptMessages, setTranscriptMessages] = useState<TranscriptMessage[]>([]);
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load or initialize interview state when component mounts
  const initializeOrLoadInterview = useCallback(async () => {
    try {
      // First try to load existing state
      const existingState = await getInterviewState(applicationUuid);

      if (existingState.success && existingState.interviewState) {
        // Interview already exists, load it
        setInterviewState(existingState.interviewState);

        // Convert conversation history to transcript messages
        const messages: TranscriptMessage[] = (existingState.conversationHistory || []).map(
          (msg, index) => ({
            id: index + 1,
            type: msg.type as 'user' | 'ai',
            text: msg.content,
            timestamp: new Date(msg.timestamp),
            phase: msg.phase,
            questionIndex: msg.questionIndex,
            categoryType: msg.categoryType,
            isRepeat: msg.isRepeat,
            isClarification: msg.isClarification,
          })
        );

        setTranscriptMessages(messages);
        setConversationHistory(existingState.conversationHistory || []);
        setIsInitialized(true);
      } else {
        // No existing interview, initialize new one
        const initResult = await initializeInterviewSession(applicationUuid, false);

        if (initResult.success) {
          setInterviewState(initResult.interviewState || null);

          // Add initial AI message to transcript
          if (initResult.response) {
            const aiMessage: TranscriptMessage = {
              id: 1,
              type: 'ai',
              text: initResult.response,
              timestamp: new Date(),
              phase: initResult.interviewState?.currentPhase,
              questionIndex: 0,
            };
            setTranscriptMessages([aiMessage]);
          }
          setIsInitialized(true);
        }
      }
    } catch (error) {
      console.error('Failed to initialize or load interview:', error);
      // Fallback with generic introduction
      const fallbackMessage: TranscriptMessage = {
        id: 1,
        type: 'ai',
        text: `Hello! I'm your AI interviewer and I'm excited to learn about you today. Could you please start by introducing yourself?`,
        timestamp: new Date(),
        phase: 'introduction',
        questionIndex: 0,
      };
      setTranscriptMessages([fallbackMessage]);
      setIsInitialized(true);
    }
  }, [applicationUuid]);

  useEffect(() => {
    if (isInterviewStarted && applicationUuid && !isInitialized) {
      initializeOrLoadInterview();
    }
  }, [isInterviewStarted, applicationUuid, isInitialized, initializeOrLoadInterview]);

  // Initialize speech recognition when interview starts
  useEffect(() => {
    if (!isInterviewStarted || !isInitialized) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('SpeechRecognition is not available in this browser');
        return;
      }
      const recognitionInstance = new SpeechRecognition();

      // Configure speech recognition settings
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-IN';

      if ('maxAlternatives' in recognitionInstance) {
        recognitionInstance.maxAlternatives = 1;
      }

      // Handle speech recognition results
      recognitionInstance.onresult = async (event) => {
        const latest = event.results[event.results.length - 1];
        if (latest.isFinal) {
          const transcript = latest[0].transcript.trim();

          if (transcript.length === 0) return;

          // Add user message to transcript
          const userMessage: TranscriptMessage = {
            id: Date.now(),
            type: 'user',
            text: transcript,
            timestamp: new Date(),
          };

          setTranscriptMessages((prev) => [...prev, userMessage]);

          // Process the user response through the interview system
          setIsAITyping(true);

          try {
            const response = await processInterviewResponse(applicationUuid, transcript);

            if (response.success) {
              // Update interview state
              if (response.interviewState) {
                setInterviewState(response.interviewState);
              }

              // Add AI response to transcript
              if (response.response) {
                const aiMessage: TranscriptMessage = {
                  id: Date.now() + 1,
                  type: 'ai',
                  text: response.response,
                  timestamp: new Date(),
                  phase: response.interviewState?.currentPhase,
                  questionIndex: response.interviewState?.currentQuestionIndex,
                  categoryType: response.interviewState?.currentCategory,
                };

                setTranscriptMessages((prev) => [...prev, aiMessage]);
              }

              // Refresh conversation history
              const stateResult = await getInterviewState(applicationUuid);
              if (stateResult.success) {
                setConversationHistory(stateResult.conversationHistory || []);
              }
            } else {
              // Handle error with fallback response
              const errorMessage: TranscriptMessage = {
                id: Date.now() + 1,
                type: 'ai',
                text: "I apologize, but I'm having trouble processing your response. Could you please try again?",
                timestamp: new Date(),
              };
              setTranscriptMessages((prev) => [...prev, errorMessage]);
            }
          } catch (error) {
            console.error('Error processing interview response:', error);
            // Generic fallback response
            const fallbackMessage: TranscriptMessage = {
              id: Date.now() + 1,
              type: 'ai',
              text: 'Thank you for sharing that. Could you tell me more about your experience with similar challenges?',
              timestamp: new Date(),
            };
            setTranscriptMessages((prev) => [...prev, fallbackMessage]);
          } finally {
            setIsAITyping(false);
          }
        }
      };

      // Handle speech recognition events
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setIsRecognitionActive(true);
      };

      recognitionInstance.onerror = (event) => {
        if (event.error === 'no-speech') {
          console.log('No speech detected, keeping recognition in standby mode');
        } else if (event.error === 'audio-capture') {
          console.error('Audio capture error - please check microphone permissions');
          setIsRecognitionActive(false);
        } else if (event.error === 'network') {
          console.error('Network error during speech recognition');
          setIsRecognitionActive(false);
        } else if (event.error === 'not-allowed') {
          console.error('Speech recognition not allowed - please enable microphone permissions');
          setIsRecognitionActive(false);
        } else {
          console.error('Speech recognition error:', event.error);
          setIsRecognitionActive(false);
        }
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsRecognitionActive(false);

        // Auto-restart recognition when it ends (if not muted)
        if (!isMuted && isInterviewStarted) {
          setTimeout(() => {
            try {
              recognitionInstance.start();
            } catch (error) {
              console.log('Recognition restart error:', error);
            }
          }, 500);
        }
      };

      setRecognition(recognitionInstance);

      // Start recognition initially if not muted
      if (!isMuted) {
        setTimeout(() => {
          try {
            recognitionInstance.start();
          } catch (error) {
            console.log('Initial recognition start error:', error);
          }
        }, 100);
      }
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, [isInterviewStarted, isInitialized, applicationUuid, isMuted]);

  // Cleanup effect for recognition
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
        setIsRecognitionActive(false);
      }
    };
  }, [recognition]);

  // Handle mute/unmute
  useEffect(() => {
    if (recognition) {
      if (isMuted) {
        recognition.stop();
      } else if (isInterviewStarted && !isRecognitionActive) {
        try {
          recognition.start();
        } catch (error) {
          console.log('Mute toggle recognition start error:', error);
        }
      }
    }
  }, [isMuted, recognition, isInterviewStarted, isRecognitionActive]);

  // Stop speech recognition
  const stopRecognition = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsRecognitionActive(false);
    }
  }, [recognition]);

  // Add message manually to transcript
  const addMessage = useCallback((message: Omit<TranscriptMessage, 'id' | 'timestamp'>) => {
    setTranscriptMessages((prev) => [
      ...prev,
      {
        ...message,
        id: Date.now(),
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    transcriptMessages,
    conversationHistory,
    interviewState,
    recognition,
    stopRecognition,
    addMessage,
    isAITyping,
  };
};
