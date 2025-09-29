import React from 'react';
import { useTimerContext } from '@/contexts/TimerContext';

const ProgressBar: React.FC = () => {
  const { isCountdownMode, progress, state } = useTimerContext();

  // Only show progress bar in countdown mode and when timer is active
  if (!isCountdownMode || state === 'idle') {
    return null;
  }

  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex-1 h-1 bg-[rgba(31,31,31,0.08)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#007AFF] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[rgba(31,31,31,0.64)] text-sm font-normal min-w-[32px]">
        {Math.round(progress)}%
      </span>
    </div>
  );
};

export default ProgressBar;
