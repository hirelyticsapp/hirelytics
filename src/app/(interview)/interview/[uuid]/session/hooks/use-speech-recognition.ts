import { useCallback, useEffect, useState } from 'react';

import {
  type ConversationMessage,
  generateAIInterviewResponseWithUuid,
  generateInterviewIntroductionWithUuid,
  type InterviewPhase,
} from '@/actions/ai-interview';

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
}

/**
 * Custom hook to manage speech recognition and transcript messages
 * Handles speech-to-text conversion and AI response integration
 */
export const useSpeechRecognition = (
  isInterviewStarted: boolean,
  isMuted: boolean,
  applicationUuid: string
) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [transcriptMessages, setTranscriptMessages] = useState<TranscriptMessage[]>([]);
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>({
    current: 'introduction',
    questionIndex: 0,
    totalQuestions: 0, // Will be updated from fetched data
  });

  // Helper function to safely start recognition
  const startRecognition = useCallback(
    (recognitionInstance: SpeechRecognition) => {
      if (!isMuted && isInterviewStarted && !isRecognitionActive) {
        try {
          recognitionInstance.start();
        } catch (error) {
          console.log('Recognition start error (likely already running):', error);
        }
      }
    },
    [isMuted, isInterviewStarted, isRecognitionActive]
  );

  // Generate initial AI introduction when interview starts
  useEffect(() => {
    if (!isInterviewStarted || transcriptMessages.length > 0) return;

    const initializeInterview = async () => {
      try {
        const response = await generateInterviewIntroductionWithUuid(applicationUuid);

        if (response.success && response.nextQuestion) {
          const aiMessage: TranscriptMessage = {
            id: Date.now(),
            type: 'ai',
            text: response.nextQuestion,
            timestamp: new Date(),
          };

          setTranscriptMessages([aiMessage]);
          setConversationHistory([
            {
              role: 'assistant',
              content: response.nextQuestion,
              timestamp: new Date(),
            },
          ]);

          if (response.phase) {
            setCurrentPhase(response.phase);
          }
        }
      } catch (error) {
        console.error('Failed to generate interview introduction:', error);
        // Generic fallback message when UUID fails
        const fallbackText = `Hello! I'm Hirelytics AI and it's wonderful to meet you. I'll be conducting your interview today and I'm genuinely excited to learn about your background and experience. We have a structured conversation planned with thoughtful questions to assess your qualifications for this role. I'll provide feedback and encouragement throughout our discussion to help guide our conversation. To get us started, could you please share a brief introduction about yourself and what brings you to this opportunity? I'd love to hear your story.`;

        const fallbackMessage: TranscriptMessage = {
          id: Date.now(),
          type: 'ai',
          text: fallbackText,
          timestamp: new Date(),
        };
        setTranscriptMessages([fallbackMessage]);
        setConversationHistory([
          {
            role: 'assistant',
            content: fallbackText,
            timestamp: new Date(),
          },
        ]);
      }
    };

    initializeInterview();
  }, [isInterviewStarted, applicationUuid, transcriptMessages.length]);

  // Initialize speech recognition when interview starts
  useEffect(() => {
    if (!isInterviewStarted) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('SpeechRecognition is not available in this browser');
        return;
      }
      const recognitionInstance = new SpeechRecognition();

      // Configure speech recognition settings
      recognitionInstance.continuous = true; // Keep listening continuously
      recognitionInstance.interimResults = true; // Get partial results while speaking
      recognitionInstance.lang = 'en-IN'; // Set language to English (India)

      // Some browsers may have additional properties for timeout handling
      if ('maxAlternatives' in recognitionInstance) {
        recognitionInstance.maxAlternatives = 1;
      }

      // Handle speech recognition results
      recognitionInstance.onresult = async (event) => {
        const latest = event.results[event.results.length - 1];
        if (latest.isFinal) {
          const transcript = latest[0].transcript;

          // Add user message to transcript and conversation history
          const userMessage: TranscriptMessage = {
            id: Date.now(),
            type: 'user',
            text: transcript,
            timestamp: new Date(),
          };

          setTranscriptMessages((prev) => [...prev, userMessage]);

          const userConversationMessage: ConversationMessage = {
            role: 'user',
            content: transcript,
            timestamp: new Date(),
          };

          setConversationHistory((prev) => [...prev, userConversationMessage]);

          // Generate AI response using server action
          setIsAITyping(true);

          // Move to candidate introduction phase after the AI introduction
          const nextPhase: InterviewPhase = {
            current: 'candidate_intro',
            questionIndex: 0,
            totalQuestions: currentPhase.totalQuestions, // Use dynamic value from state
          };

          generateAIInterviewResponseWithUuid(
            [...conversationHistory, userConversationMessage],
            transcript,
            applicationUuid,
            nextPhase
          )
            .then(async (response) => {
              if (response.success && response.nextQuestion) {
                const aiMessage: TranscriptMessage = {
                  id: Date.now() + 1,
                  type: 'ai',
                  text: response.nextQuestion,
                  timestamp: new Date(),
                };

                setTranscriptMessages((prev) => [...prev, aiMessage]);

                const aiConversationMessage: ConversationMessage = {
                  role: 'assistant',
                  content: response.nextQuestion,
                  timestamp: new Date(),
                };

                setConversationHistory((prev) => [...prev, aiConversationMessage]);

                // Update phase
                if (response.phase) {
                  setCurrentPhase(response.phase);
                }
              } else {
                // Generic fallback response on error
                const fallbackResponse = `Thank you so much for sharing that with me - I really appreciate your openness. Could you tell me more about your experience and what aspects of this role excite you the most? I'd love to hear more about what draws you to this opportunity.`;

                const aiMessage: TranscriptMessage = {
                  id: Date.now() + 1,
                  type: 'ai',
                  text: fallbackResponse,
                  timestamp: new Date(),
                };

                setTranscriptMessages((prev) => [...prev, aiMessage]);

                const aiConversationMessage: ConversationMessage = {
                  role: 'assistant',
                  content: fallbackResponse,
                  timestamp: new Date(),
                };

                setConversationHistory((prev) => [...prev, aiConversationMessage]);
              }
              setIsAITyping(false);
            })
            .catch(async (error) => {
              console.error('Error generating AI response:', error);
              // Generic fallback response on error
              const fallbackResponse = `That's really interesting, and I appreciate you taking the time to share that with me. I'd love to hear about a challenging situation you've encountered in your career and how you approached solving it. Could you walk me through a specific example that showcases your problem-solving skills?`;

              const aiMessage: TranscriptMessage = {
                id: Date.now() + 1,
                type: 'ai',
                text: fallbackResponse,
                timestamp: new Date(),
              };

              setTranscriptMessages((prev) => [...prev, aiMessage]);

              const aiConversationMessage: ConversationMessage = {
                role: 'assistant',
                content: fallbackResponse,
                timestamp: new Date(),
              };

              setConversationHistory((prev) => [...prev, aiConversationMessage]);

              setIsAITyping(false);
            });
        }
      };

      // Handle speech recognition events
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setIsRecognitionActive(true);
      };

      recognitionInstance.onerror = (event) => {
        // Handle different types of speech recognition errors
        if (event.error === 'no-speech') {
          // Silently handle no-speech errors - this is expected when user is quiet
          // This prevents console errors from showing when user isn't speaking
          console.log('No speech detected, keeping recognition in standby mode');

          // Don't restart immediately, let onend handle the restart to prevent conflicts
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
          // Only log other errors that aren't related to normal silence
          console.error('Speech recognition error:', event.error);
          setIsRecognitionActive(false);
        }
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsRecognitionActive(false);

        // Auto-restart recognition when it ends (unless muted or interview stopped)
        if (!isMuted && isInterviewStarted) {
          setTimeout(() => {
            startRecognition(recognitionInstance);
          }, 500); // Quick restart
        }
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }

    // Cleanup: stop recognition when component unmounts
    return () => {
      if (recognition) {
        recognition.stop();
        setIsRecognitionActive(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInterviewStarted]);

  // Control speech recognition based on mute state
  useEffect(() => {
    if (recognition && isInterviewStarted) {
      if (isMuted) {
        // Stop listening when muted
        if (isRecognitionActive) {
          recognition.stop();
        }
      } else {
        // Start listening when unmuted (only if not already active)
        startRecognition(recognition);
      }
    }
  }, [isMuted, recognition, isRecognitionActive, isInterviewStarted, startRecognition]);

  // Heartbeat mechanism to ensure recognition stays active
  useEffect(() => {
    if (!isInterviewStarted || isMuted || !recognition) return;

    const heartbeatInterval = setInterval(() => {
      // Check if recognition should be active but isn't
      if (!isRecognitionActive && !isMuted && isInterviewStarted) {
        console.log('Heartbeat: Restarting inactive recognition');
        startRecognition(recognition);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(heartbeatInterval);
  }, [isInterviewStarted, isMuted, recognition, isRecognitionActive, startRecognition]);

  // Stop speech recognition (cleanup)
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
    currentPhase,
    recognition,
    stopRecognition,
    addMessage,
    isAITyping,
  };
};
