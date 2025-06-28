import { Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  totalQuestions?: number;
  duration: number; // Duration in minutes from session instruction (mandatory)
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ duration }) => {
  // Use duration directly from session instruction
  const totalDuration = duration * 60; // Convert minutes to seconds
  const [timeLeft, setTimeLeft] = useState(totalDuration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 60) return 'text-destructive'; // Last minute - red with bounce
    if (timeLeft <= 300) return 'text-muted-foreground'; // Last 5 minutes - warning
    return 'text-foreground';
  };

  const shouldBounce = timeLeft <= 60 && timeLeft > 0;

  return (
    <div
      className={cn(
        'flex items-center space-x-2 px-3 py-1 rounded-lg bg-muted border border-border',
        shouldBounce && 'animate-bounce'
      )}
    >
      <Clock size={16} className={getTimerColor()} />
      <span className={cn('font-mono text-sm font-medium', getTimerColor())}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default TimerDisplay;
