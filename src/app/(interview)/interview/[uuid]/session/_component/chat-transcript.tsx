import { Bot, Clock, User } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered'; // Add message status
}

interface ChatTranscriptProps {
  messages: Message[];
  isAITyping?: boolean; // Add typing indicator prop
}

const ChatTranscript: React.FC<ChatTranscriptProps> = ({ messages, isAITyping = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-l border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-full bg-primary/10">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Live Transcript</h3>
        </div>
        <p className="text-sm text-muted-foreground">Real-time conversation transcription</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4 pb-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <div className="p-3 rounded-full bg-muted/50 mb-3">
                  <Bot className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Conversation will appear here as you speak
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isUser = message.type === 'user';
                const showAvatar = index === 0 || messages[index - 1].type !== message.type;

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3 group animate-in slide-in-from-bottom-2 duration-300',
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn('flex-shrink-0', !showAvatar && 'invisible')}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          className={cn(
                            isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          )}
                        >
                          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Message Content */}
                    <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
                      {/* Sender Name and Time */}
                      {showAvatar && (
                        <div
                          className={cn(
                            'flex items-center gap-2 mb-1 px-1',
                            isUser ? 'flex-row-reverse' : 'flex-row'
                          )}
                        >
                          <span className="text-xs font-medium text-foreground">
                            {isUser ? 'You' : 'AI Interviewer'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          'relative max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md',
                          isUser
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md border border-border/50'
                        )}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.text}
                        </p>

                        {/* Timestamp for non-avatar messages */}
                        {!showAvatar && (
                          <div
                            className={cn(
                              'flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-70 transition-opacity',
                              isUser ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <span className="text-xs">{formatTime(message.timestamp)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {isAITyping && (
              <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex-shrink-0">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-foreground">AI Interviewer</span>
                    <span className="text-xs text-muted-foreground">typing...</span>
                  </div>
                  <div className="bg-muted text-foreground rounded-2xl rounded-bl-md border border-border/50 px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={scrollRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      {/* Footer with status */}
      <div className="p-3 border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live transcription active</span>
        </div>
      </div>
    </div>
  );
};

export default ChatTranscript;
