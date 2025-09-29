import { useState, useEffect, useCallback } from 'react';
import { useSprints } from './useSprints';
import { Project } from './useProjects';

export type TimerMode = 'stopwatch' | 'custom' | '15mins' | '30mins' | '1h' | '2h';
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export const useTimerWithSprints = (selectedProject: Project | null) => {
  const [time, setTime] = useState(0);
  const [state, setState] = useState<TimerState>('idle');
  const [mode, setMode] = useState<TimerMode>('15mins');
  const [isCountdownMode, setIsCountdownMode] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [customTime, setCustomTimeValue] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const { createSprint } = useSprints();

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
      case 'custom': return customTime;
      default: return 0;
    }
  }, [customTime]);

  const getProgress = useCallback(() => {
    if (!isCountdownMode || mode === 'stopwatch') return 0;
    const target = getTargetTime(mode);
    return target > 0 ? Math.min((time / target) * 100, 100) : 0;
  }, [time, mode, isCountdownMode, getTargetTime]);

  const getDisplayTime = useCallback(() => {
    if (isCountdownMode && state === 'idle' && mode !== 'stopwatch') {
      // Show target time when in idle countdown mode
      const target = getTargetTime(mode);
      return formatTime(target);
    }
    
    if (isCountdownMode && (state === 'running' || state === 'paused') && mode !== 'stopwatch') {
      // Show remaining time during countdown
      const target = getTargetTime(mode);
      const remaining = Math.max(0, target - time);
      return formatTime(remaining);
    }
    
    // Default to elapsed time (for stopwatch or when completed)
    return formatTime(time);
  }, [time, state, mode, isCountdownMode, getTargetTime, formatTime]);

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

  const saveSprint = async () => {
    if (!selectedProject || !startTime || time === 0) return;

    const completedAt = new Date();
    await createSprint({
      project_id: selectedProject.id,
      notes: notes.trim() || undefined,
      duration_seconds: time,
      mode: isCountdownMode ? 'countdown' : 'stopwatch',
      started_at: startTime,
      completed_at: completedAt,
    });
  };

  const startTimer = () => {
    setState('running');
    if (!startTime) {
      setStartTime(new Date());
    }
  };

  const pauseTimer = () => setState('paused');

  const completeTimer = async () => {
    setState('completed');
    // Save sprint first, then reset
    await saveSprint();
    resetTimer();
  };

  const resetTimer = () => {
    setTime(0);
    setState('idle');
    setStartTime(null);
    setNotes('');
    setCustomInput('');
    setShowCustomInput(false);
  };

  const setTimerMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTime(0);
    setState('idle');
    setStartTime(null);
    setIsCountdownMode(newMode !== 'stopwatch');
    
    if (newMode === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setCustomInput('');
    }
  };

  const toggleTimerType = () => {
    if (isCountdownMode) {
      setMode('stopwatch');
      setIsCountdownMode(false);
    } else {
      setMode('15mins');
      setIsCountdownMode(true);
    }
    setTime(0);
    setState('idle');
    setStartTime(null);
  };

  const setCustomTime = (seconds: number) => {
    setCustomTimeValue(seconds);
  };

  const parseTimeInput = (input: string): number => {
    const cleaned = input.toLowerCase().trim();
    let totalMinutes = 0;
    
    // Match patterns like "1h 30m", "2h", "30m", "1h30m", etc.
    const hourMatch = cleaned.match(/(\d+)\s*h(?:ours?)?/);
    const minuteMatch = cleaned.match(/(\d+)\s*m(?:in(?:utes?)?)?/);
    
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }
    
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1]);
    }
    
    // If no matches, try to parse as just minutes
    if (!hourMatch && !minuteMatch) {
      const numberMatch = cleaned.match(/(\d+)/);
      if (numberMatch) {
        totalMinutes = parseInt(numberMatch[1]);
      }
    }
    
    return totalMinutes * 60; // Convert to seconds
  };

  const handleCustomInputChange = (input: string) => {
    setCustomInput(input);
    const seconds = parseTimeInput(input);
    if (seconds > 0) {
      setCustomTimeValue(seconds);
    }
  };

  const handleCustomInputComplete = () => {
    const seconds = parseTimeInput(customInput);
    if (seconds > 0) {
      setCustomTimeValue(seconds);
      setShowCustomInput(false);
    }
  };

  // Auto-complete when countdown reaches target
  useEffect(() => {
    if (state === 'completed' && isCountdownMode) {
      // Only auto-save for countdown mode (when target is reached)
      // Manual completion via completeTimer handles its own saving
      saveSprint().then(() => {
        resetTimer();
      });
    }
  }, [state, isCountdownMode]);

  // Update browser tab title based on timer status
  useEffect(() => {
    const originalTitle = "Sprint Tracker";
    
    if (state === 'running' && selectedProject) {
      const displayTime = getDisplayTime();
      // Format for tab title: remove quotes and determine if it should show MM:SS or HH:MM
      const timeForTitle = displayTime.replace(/'/g, ':');
      const [hours, minutes, seconds] = timeForTitle.split(':').map(Number);
      
      let formattedTime;
      if (hours > 0) {
        formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else {
        formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      
      document.title = `⏱️ ${formattedTime} - ${selectedProject.name}`;
    } else {
      document.title = originalTitle;
    }

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
    };
  }, [state, selectedProject, getDisplayTime]);

  return {
    time,
    state,
    mode,
    isCountdownMode,
    progress: getProgress(),
    formatTime: getDisplayTime(),
    notes,
    setNotes,
    startTimer,
    pauseTimer,
    completeTimer,
    resetTimer,
    setTimerMode,
    toggleTimerType,
    setCustomTime,
    customInput,
    showCustomInput,
    handleCustomInputChange,
    handleCustomInputComplete,
  };
};
