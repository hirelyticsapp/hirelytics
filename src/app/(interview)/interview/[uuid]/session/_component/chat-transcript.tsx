import React, { useEffect, useRef } from 'react';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface ChatTranscriptProps {
  messages: Message[];
}

const ChatTranscript: React.FC<ChatTranscriptProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      <div className="p-2 lg:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h3 className="text-sm lg:text-lg font-semibold text-gray-800 dark:text-white">
          Live Transcript
        </h3>
        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
          Voice transcription results
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2 lg:p-4 space-y-2 lg:space-y-3">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={cn(
                  'p-2 lg:p-3 max-w-[85%] lg:max-w-[80%] border-none shadow-sm',
                  message.type === 'user'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white ml-auto'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white mr-auto'
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      message.type === 'user'
                        ? 'text-blue-100 dark:text-blue-100'
                        : 'text-gray-600 dark:text-gray-300'
                    )}
                  >
                    {message.type === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      message.type === 'user'
                        ? 'text-blue-100 dark:text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-xs lg:text-sm leading-relaxed">{message.text}</p>
              </Card>
            ))}
            {/* Auto-scroll anchor */}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatTranscript;
