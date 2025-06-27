import { Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

const TimerDisplay = () => {
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

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
    if (timeLeft <= 60) return 'text-red-500 dark:text-red-400'; // Last minute - red with bounce
    if (timeLeft <= 300) return 'text-yellow-500 dark:text-yellow-400'; // Last 5 minutes - warning yellow
    return 'text-gray-800 dark:text-white';
  };

  const shouldBounce = timeLeft <= 60 && timeLeft > 0;

  return (
    <div
      className={cn(
        'flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
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
