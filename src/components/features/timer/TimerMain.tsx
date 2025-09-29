import React from 'react';
import TimerDisplay from './TimerDisplay';
import TimerTabs from './TimerTabs';
import TimerControls from './TimerControls';
import ProgressBar from './ProgressBar';
import InsightsPanel from '../insights/InsightsPanel';
import { useTimerContext } from '@/contexts/TimerContext';
import { Project } from '@/hooks/useProjects';
import { TimePeriod } from '@/hooks/useTimeFilter';

interface TimerMainProps {
  activeTab: 'timer' | 'insights';
  onTabChange: (tab: 'timer' | 'insights') => void;
  selectedProject: Project | null;
  selectedPeriod: TimePeriod;
}

const TimerMain: React.FC<TimerMainProps> = ({ 
  activeTab, 
  onTabChange, 
  selectedProject,
  selectedPeriod 
}) => {
  const { formatTime, mode, setTimerMode, state, progress, isCountdownMode, selectedProject: contextProject } = useTimerContext();

  return (
    <main className="flex flex-col justify-center items-start gap-4 h-full w-full rounded border box-border bg-white p-4 border-solid border-[rgba(31,31,31,0.12)] max-sm:gap-3 max-sm:p-3 overflow-hidden">
      <nav className="flex justify-center items-start gap-1 self-stretch" role="tablist">
        <button
          className={`flex items-center gap-2 px-3 py-1 rounded-[100px] transition-colors ${
            activeTab === 'timer' 
              ? 'bg-[rgba(31,31,31,0.08)]' 
              : 'hover:bg-[rgba(31,31,31,0.04)]'
          }`}
          onClick={() => onTabChange('timer')}
          role="tab"
          aria-selected={activeTab === 'timer'}
          aria-controls="timer-panel"
        >
          <span className="text-sm font-normal leading-[23.8px] text-[#1F1F1F] max-sm:text-xs">
            timer
          </span>
        </button>
        <button
          className={`flex items-center gap-2 px-3 py-1 rounded-[100px] transition-colors ${
            activeTab === 'insights' 
              ? 'bg-[rgba(31,31,31,0.08)]' 
              : 'hover:bg-[rgba(31,31,31,0.04)]'
          }`}
          onClick={() => onTabChange('insights')}
          role="tab"
          aria-selected={activeTab === 'insights'}
          aria-controls="insights-panel"
        >
          <span className="text-sm font-normal leading-[23.8px] text-[#1F1F1F] max-sm:text-xs">
            insights
          </span>
        </button>
      </nav>
      
      <div 
        id="timer-panel"
        role="tabpanel"
        aria-labelledby="timer-tab"
        className={activeTab === 'timer' ? 'flex flex-col flex-1 self-stretch justify-center items-center gap-4 min-h-0 overflow-auto' : 'hidden'}
      >
        <div className="flex-1 flex items-center justify-center">
          <TimerDisplay formattedTime={formatTime} />
        </div>
        
        {/* Show ProgressBar when countdown timer is running, otherwise show TimerTabs */}
        {state === 'running' && isCountdownMode ? (
          <div className="w-full flex-shrink-0">
            <ProgressBar />
          </div>
        ) : (
          <>
            <div className="w-full h-px bg-[rgba(31,31,31,0.04)] flex-shrink-0" />
            <div className="flex-shrink-0">
              <TimerTabs activeMode={mode} onModeChange={setTimerMode} />
            </div>
          </>
        )}
      </div>
      
      <div 
        id="insights-panel"
        role="tabpanel"
        aria-labelledby="insights-tab"
        className={activeTab === 'insights' ? 'flex flex-col flex-1 self-stretch gap-4' : 'hidden'}
      >
        <InsightsPanel 
          selectedPeriod={selectedPeriod}
          selectedProject={selectedProject}
        />
      </div>
    </main>
  );
};

export default TimerMain;
