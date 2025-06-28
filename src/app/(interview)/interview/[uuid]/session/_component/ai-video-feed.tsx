import React from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AIVideoFeedProps {
  isAISpeaking: boolean;
}

const AIVideoFeed: React.FC<AIVideoFeedProps> = ({ isAISpeaking }) => {
  return (
    <Card
      className={cn(
        'relative w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-lg overflow-hidden border-border',
        isAISpeaking && 'ring-4 ring-green-500 ring-opacity-75 animate-pulse'
      )}
    >
      <div className="w-full h-full flex items-center justify-center">
        {/* AI Avatar */}
        <div
          className={cn(
            'w-16 h-16 lg:w-24 lg:h-24 bg-background rounded-full flex items-center justify-center transition-transform duration-300',
            isAISpeaking ? 'scale-110 animate-pulse' : 'scale-100'
          )}
        >
          <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg lg:text-xl">AI</span>
          </div>
        </div>
      </div>

      {/* AI label */}
      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border">
        <span className="text-foreground text-xs font-medium">AI Assistant</span>
      </div>

      {/* Speaking indicator */}
      {isAISpeaking && (
        <div className="absolute top-2 right-2">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AIVideoFeed;
