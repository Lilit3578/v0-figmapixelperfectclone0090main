import React, { useState } from 'react';
import { TimerMode } from '../../../hooks/useTimerWithSprints';
import { useTimerContext } from '@/contexts/TimerContext';
// Using simple modal instead of AlertDialog

interface TimerTabsProps {
  activeMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
}

const TimerTabs: React.FC<TimerTabsProps> = ({ activeMode, onModeChange }) => {
  const { isCountdownMode, toggleTimerType, state } = useTimerContext();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<TimerMode | null>(null);
  const [pendingToggle, setPendingToggle] = useState(false);

  const handleModeChange = (mode: TimerMode) => {
    if (state === 'running' || state === 'paused') {
      setPendingMode(mode);
      setShowConfirmDialog(true);
    } else {
      onModeChange(mode);
    }
  };

  const handleToggle = () => {
    if (state === 'running' || state === 'paused') {
      setPendingToggle(true);
      setShowConfirmDialog(true);
    } else {
      toggleTimerType();
    }
  };

  const handleConfirm = () => {
    if (pendingMode) {
      onModeChange(pendingMode);
      setPendingMode(null);
    }
    if (pendingToggle) {
      toggleTimerType();
      setPendingToggle(false);
    }
    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    setPendingMode(null);
    setPendingToggle(false);
    setShowConfirmDialog(false);
  };

  const handleCustomClick = () => {
    handleModeChange('custom');
  };
  
  const countdownTabs: { mode: TimerMode; label: string }[] = [
    { mode: 'custom', label: 'custom' },
    { mode: '15mins', label: '15mins' },
    { mode: '30mins', label: '30mins' },
    { mode: '1h', label: '1h' },
    { mode: '2h', label: '2h' }
  ];

  const tabs = isCountdownMode ? countdownTabs : [{ mode: 'stopwatch' as TimerMode, label: 'stopwatch' }];
  const toggleLabel = isCountdownMode ? 'stopwatch' : 'countdown';

  return (
    <>
      <div className="flex h-10 justify-center items-center gap-1 self-stretch" role="tablist">
        {/* Toggle button first (before custom) */}
        <button
          className="px-3 py-1 rounded-[100px] flex justify-start items-center gap-2 hover:bg-[rgba(31,31,31,0.04)] transition-colors"
          onClick={handleToggle}
        >
        <span className="text-sm font-normal leading-[23.8px] text-[rgba(31,31,31,0.64)]" style={{ fontFamily: 'Be Vietnam Pro' }}>
          {toggleLabel}
        </span>
      </button>
      
      {tabs.map(({ mode, label }) => {
        if (mode === 'custom') {
          return (
            <button
              key={mode}
              className={`px-3 py-1 rounded-[100px] flex justify-start items-center gap-2 transition-colors ${
                activeMode === mode 
                  ? 'bg-[rgba(31,31,31,0.08)]' 
                  : 'hover:bg-[rgba(31,31,31,0.04)]'
              }`}
              onClick={handleCustomClick}
              role="tab"
              aria-selected={activeMode === mode}
              aria-controls={`timer-panel-${mode}`}
            >
              <span className={`text-sm font-normal leading-[23.8px] ${
                activeMode === mode 
                  ? 'text-[#1F1F1F]' 
                  : 'text-[rgba(31,31,31,0.64)]'
              }`} style={{ fontFamily: 'Be Vietnam Pro' }}>
                {label}
              </span>
            </button>
          );
        }
        
        return (
          <button
            key={mode}
            className={`px-3 py-1 rounded-[100px] flex justify-start items-center gap-2 transition-colors ${
              activeMode === mode 
                ? 'bg-[rgba(31,31,31,0.08)]' 
                : 'hover:bg-[rgba(31,31,31,0.04)]'
            }`}
            onClick={() => handleModeChange(mode)}
            role="tab"
            aria-selected={activeMode === mode}
            aria-controls={`timer-panel-${mode}`}
          >
            <span className={`text-sm font-normal leading-[23.8px] ${
              activeMode === mode 
                ? 'text-[#1F1F1F]' 
                : 'text-[rgba(31,31,31,0.64)]'
            }`} style={{ fontFamily: 'Be Vietnam Pro' }}>
              {label}
            </span>
          </button>
        );
      })}
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={handleCancel}
          />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-2">Change Timer Mode?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Switching timer mode will reset the current sprint and lose all progress. 
              Are you sure you want to continue?
            </p>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={handleCancel}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TimerTabs;
