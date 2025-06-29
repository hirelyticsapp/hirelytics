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
export const useSpeechRecognition = (isMuted: boolean, applicationUuid: string) => {
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

      if (
        existingState.success &&
        existingState.interviewState &&
        existingState.conversationHistory &&
        existingState.conversationHistory.length > 0
      ) {
        // Interview already exists with conversation history, load it
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
        // No existing interview or empty conversation, initialize new one with AI introduction
        const initResult = await initializeInterviewSession(applicationUuid, true);

        if (initResult.success && initResult.response) {
          setInterviewState(initResult.interviewState || null);

          // Add AI introduction message to start the conversation automatically
          const aiIntroMessage: TranscriptMessage = {
            id: 1,
            type: 'ai',
            text: initResult.response,
            timestamp: new Date(),
            phase: initResult.interviewState?.currentPhase || 'introduction',
            questionIndex: initResult.interviewState?.currentQuestionIndex || 0,
            categoryType: initResult.interviewState?.currentCategory,
          };

          setTranscriptMessages([aiIntroMessage]);

          // Update conversation history immediately
          const stateResult = await getInterviewState(applicationUuid);
          if (stateResult.success) {
            setConversationHistory(stateResult.conversationHistory || []);
          }
        } else {
          // Fallback AI introduction if initialization fails
          const fallbackIntroMessage: TranscriptMessage = {
            id: 1,
            type: 'ai',
            text: `🎙️ TEST MODE: AI Interviewer Ready! Speech recognition is active and listening. Please speak to test the transcription. Say something like "Hello, I am testing the speech recognition system" to verify it's working properly. Once confirmed, I'll begin the actual interview.`,
            timestamp: new Date(),
            phase: 'introduction',
            questionIndex: 0,
          };
          setTranscriptMessages([fallbackIntroMessage]);
        }
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize or load interview:', error);
      // Fallback with AI introduction message
      const fallbackIntroMessage: TranscriptMessage = {
        id: 1,
        type: 'ai',
        text: `🎙️ TEST MODE: AI Interviewer Ready! Speech recognition is active and listening. Please speak to test the transcription. Say something like "Hello, I am testing the speech recognition system" to verify it's working properly. Once confirmed, I'll begin the actual interview.`,
        timestamp: new Date(),
        phase: 'introduction',
        questionIndex: 0,
      };
      setTranscriptMessages([fallbackIntroMessage]);
      setIsInitialized(true);
    }
  }, [applicationUuid]);

  useEffect(() => {
    if (applicationUuid && !isInitialized) {
      console.log('Initializing interview for UUID:', applicationUuid);
      initializeOrLoadInterview();
    }
  }, [applicationUuid, isInitialized, initializeOrLoadInterview]);

  // Initialize speech recognition when interview loads
  useEffect(() => {
    if (!isInitialized) return;

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
        console.log('🎙️ Speech recognition result:', {
          isFinal: latest.isFinal,
          transcript: latest[0].transcript,
          confidence: latest[0].confidence,
        });

        if (latest.isFinal) {
          const transcript = latest[0].transcript.trim();
          console.log('✅ Final transcript received:', transcript);

          if (transcript.length === 0) {
            console.log('❌ Empty transcript, skipping...');
            return;
          }

          // Add candidate message to transcript
          const candidateMessage: TranscriptMessage = {
            id: Date.now(),
            type: 'user',
            text: transcript,
            timestamp: new Date(),
            phase: interviewState?.currentPhase,
            questionIndex: interviewState?.currentQuestionIndex,
            categoryType: interviewState?.currentCategory,
          };

          console.log('📝 Adding candidate message to transcript:', candidateMessage);
          setTranscriptMessages((prev) => [...prev, candidateMessage]);

          // Check if this is a test message
          const isTestMessage =
            transcript.toLowerCase().includes('test') ||
            transcript.toLowerCase().includes('hello') ||
            transcript.toLowerCase().includes('speech recognition');

          if (isTestMessage) {
            // Add a test response immediately
            setTimeout(() => {
              const testResponse: TranscriptMessage = {
                id: Date.now() + 1,
                type: 'ai',
                text: `✅ Excellent! I heard you say: "${transcript}". Speech recognition is working perfectly! Now let's begin the actual interview. Please tell me about yourself, your background, and what brings you to this opportunity?`,
                timestamp: new Date(),
                phase: 'introduction',
                questionIndex: 0,
              };
              console.log('🤖 Adding test AI response:', testResponse);
              setTranscriptMessages((prev) => [...prev, testResponse]);
            }, 1000);
            return;
          }

          // Process the candidate response through the interview system
          setIsAITyping(true);

          try {
            // Send the whole response to AI for analysis and next question
            const response = await processInterviewResponse(applicationUuid, transcript);

            if (response.success) {
              // Update interview state
              if (response.interviewState) {
                setInterviewState(response.interviewState);
              }

              // Add AI response (combined analysis + next question) to transcript
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
              // Handle error with fallback AI response
              const errorMessage: TranscriptMessage = {
                id: Date.now() + 1,
                type: 'ai',
                text: "I apologize, but I'm having trouble processing your response. Could you please try again?",
                timestamp: new Date(),
                phase: interviewState?.currentPhase,
              };
              setTranscriptMessages((prev) => [...prev, errorMessage]);
            }
          } catch (error) {
            console.error('Error processing interview response:', error);
            // Generic fallback AI response
            const fallbackMessage: TranscriptMessage = {
              id: Date.now() + 1,
              type: 'ai',
              text: 'Thank you for sharing that. Could you tell me more about your experience with similar challenges?',
              timestamp: new Date(),
              phase: interviewState?.currentPhase,
            };
            setTranscriptMessages((prev) => [...prev, fallbackMessage]);
          } finally {
            setIsAITyping(false);
          }
        }
      };

      // Handle speech recognition events
      recognitionInstance.onstart = () => {
        console.log('🎙️ Speech recognition started - listening for audio...');
        setIsRecognitionActive(true);
      };

      recognitionInstance.onerror = (event) => {
        console.error('🚨 Speech recognition error:', event.error, event.message);
        if (event.error === 'no-speech') {
          console.log('ℹ️ No speech detected, keeping recognition in standby mode');
        } else if (event.error === 'audio-capture') {
          console.error('🎤 Audio capture error - please check microphone permissions');
          setIsRecognitionActive(false);
        } else if (event.error === 'network') {
          console.error('🌐 Network error during speech recognition');
          setIsRecognitionActive(false);
        } else if (event.error === 'not-allowed') {
          console.error('🚫 Speech recognition not allowed - please enable microphone permissions');
          setIsRecognitionActive(false);
        } else {
          console.error('❌ Speech recognition error:', event.error);
          setIsRecognitionActive(false);
        }
      };

      recognitionInstance.onend = () => {
        console.log('🔇 Speech recognition ended');
        setIsRecognitionActive(false);

        // Auto-restart recognition when it ends (if not muted)
        if (!isMuted) {
          console.log('🔄 Auto-restarting speech recognition...');
          setTimeout(() => {
            try {
              recognitionInstance.start();
            } catch (error) {
              console.log('⚠️ Recognition restart error:', error);
            }
          }, 500);
        }
      };

      setRecognition(recognitionInstance);

      // Start recognition initially if not muted
      if (!isMuted) {
        console.log('🎯 Starting initial speech recognition...');
        setTimeout(() => {
          try {
            recognitionInstance.start();
            console.log('✅ Speech recognition started successfully');
          } catch (error) {
            console.error('❌ Initial recognition start error:', error);
          }
        }, 100);
      } else {
        console.log('🔇 Speech recognition muted - not starting automatically');
      }
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, [
    isInitialized,
    applicationUuid,
    isMuted,
    interviewState?.currentCategory,
    interviewState?.currentPhase,
    interviewState?.currentQuestionIndex,
  ]);

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
      } else if (!isRecognitionActive) {
        try {
          recognition.start();
        } catch (error) {
          console.log('Mute toggle recognition start error:', error);
        }
      }
    }
  }, [isMuted, recognition, isRecognitionActive]);

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
    isRecognitionActive,
    isInitialized,
  };
};
