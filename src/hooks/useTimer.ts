import { useState, useEffect, useCallback } from 'react';

export type TimerMode = 'stopwatch' | 'custom' | '15mins' | '30mins' | '1h' | '2h';
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export const useTimer = () => {
  const [time, setTime] = useState(0);
  const [state, setState] = useState<TimerState>('idle');
  const [mode, setMode] = useState<TimerMode>('15mins'); // Default to countdown mode
  const [isCountdownMode, setIsCountdownMode] = useState(true);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}'${minutes.toString().padStart(2, '0')}'${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTargetTime = useCallback((mode: TimerMode) => {
    switch (mode) {
      case '15mins': return 15 * 60;
      case '30mins': return 30 * 60;
      case '1h': return 60 * 60;
      case '2h': return 120 * 60;
      default: return 0;
    }
  }, []);

  const getProgress = useCallback(() => {
    if (!isCountdownMode || mode === 'stopwatch' || mode === 'custom') return 0;
    const target = getTargetTime(mode);
    return target > 0 ? Math.min((time / target) * 100, 100) : 0;
  }, [time, mode, isCountdownMode, getTargetTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state === 'running') {
      interval = setInterval(() => {
        setTime(prevTime => {
          if (!isCountdownMode) {
            // Stopwatch mode - count up
            return prevTime + 1;
          } else {
            // Countdown mode - count up to target
            const targetTime = getTargetTime(mode);
            if (prevTime >= targetTime) {
              setState('completed');
              return targetTime;
            }
            return prevTime + 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state, mode, isCountdownMode, getTargetTime]);

  const startTimer = () => setState('running');
  const pauseTimer = () => setState('paused');
  const completeTimer = () => setState('completed');
  const resetTimer = () => {
    setTime(0);
    setState('idle');
  };

  const setTimerMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTime(0);
    setState('idle');
    // Auto-detect if this should be countdown or stopwatch
    setIsCountdownMode(newMode !== 'stopwatch');
  };

  const toggleTimerType = () => {
    if (isCountdownMode) {
      // Switch to stopwatch
      setMode('stopwatch');
      setIsCountdownMode(false);
    } else {
      // Switch to countdown (default to 15mins)
      setMode('15mins');
      setIsCountdownMode(true);
    }
    setTime(0);
    setState('idle');
  };

  return {
    time,
    state,
    mode,
    isCountdownMode,
    progress: getProgress(),
    formatTime: formatTime(time),
    startTimer,
    pauseTimer,
    completeTimer,
    resetTimer,
    setTimerMode,
    toggleTimerType
  };
};
