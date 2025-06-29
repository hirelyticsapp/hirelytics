import { useCallback, useEffect, useState } from 'react';

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
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
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
 * Handles speech-to-text conversion and AI response simulation
 */
export const useSpeechRecognition = (isInterviewStarted: boolean, isMuted: boolean) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [transcriptMessages, setTranscriptMessages] = useState<TranscriptMessage[]>([
    {
      id: 1,
      type: 'ai',
      text: "Hello! Welcome to your interview. I'm excited to learn more about you and your experience. To get started, could you please introduce yourself and tell me a bit about your background?",
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: 2,
      type: 'user',
      text: 'Hello, nice to meet you! Thank you for this opportunity.',
      timestamp: new Date(Date.now() - 30000),
    },
    {
      id: 3,
      type: 'ai',
      text: "Great to meet you too! I can see you're ready to begin. Let's start with some questions about your experience and skills.",
      timestamp: new Date(Date.now() - 10000),
    },
  ]);

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

      // Handle speech recognition results
      recognitionInstance.onresult = (event) => {
        const latest = event.results[event.results.length - 1];
        if (latest.isFinal) {
          const transcript = latest[0].transcript;

          // Add user message to transcript
          setTranscriptMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'user',
              text: transcript,
              timestamp: new Date(),
            },
          ]);

          // Simulate AI response after a delay
          setIsAITyping(true);
          setTimeout(
            () => {
              const aiResponses = [
                "That's interesting! Can you tell me more about that experience?",
                'Great point! How do you think that skill would apply to this role?',
                'Thank you for sharing that. What challenges did you face in that situation?',
                'Excellent! Can you walk me through your thought process on that?',
                'I see. What would you say was the most valuable lesson you learned from that?',
                'That sounds like a valuable experience. How did you measure your success?',
                'Interesting approach! What alternative solutions did you consider?',
                'Good example! How do you stay updated with the latest developments in that area?',
                'Thank you for that insight. Can you give me another example?',
                'That demonstrates good problem-solving. What tools or resources did you use?',
              ];

              const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

              setTranscriptMessages((prev) => [
                ...prev,
                {
                  id: Date.now() + 1,
                  type: 'ai',
                  text: randomResponse,
                  timestamp: new Date(),
                },
              ]);
              setIsAITyping(false);
            },
            1500 + Math.random() * 1000
          ); // Vary the delay between 1.5-2.5 seconds
        }
      };

      // Handle speech recognition events
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }

    // Cleanup: stop recognition when component unmounts
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInterviewStarted]);

  // Control speech recognition based on mute state
  useEffect(() => {
    if (recognition) {
      if (isMuted) {
        // Stop listening when muted
        recognition.stop();
      } else {
        // Start listening when unmuted
        try {
          recognition.start();
        } catch (error) {
          console.log('Speech recognition already running or error:', error);
        }
      }
    }
  }, [isMuted, recognition]);

  // Stop speech recognition (cleanup)
  const stopRecognition = useCallback(() => {
    if (recognition) {
      recognition.stop();
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
    recognition,
    stopRecognition,
    addMessage,
    isAITyping,
  };
};
