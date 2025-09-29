import React, { useState } from 'react';
import Sidebar from '../../shared/Sidebar';
import TimerMain from './TimerMain';
import { TimerProvider } from '@/contexts/TimerContext';
import { useProjects, Project } from '@/hooks/useProjects';
import { TimePeriod } from '@/hooks/useTimeFilter';

const SprintTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timer' | 'insights'>('timer');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');
  const { projects } = useProjects();

  // Handle project change consistently across tabs
  const handleProjectChange = (project: Project | null) => {
    setSelectedProject(project);
  };

  return (
    <TimerProvider selectedProject={selectedProject} onProjectChange={handleProjectChange}>
      <div 
        className="w-screen h-screen overflow-hidden flex items-center justify-center gap-2"
        style={{
          padding: '8px',
          background: 'linear-gradient(0deg, rgba(31, 31, 31, 0.04) 0%, rgba(31, 31, 31, 0.04) 100%), white'
        }}
      >
        {/* Sidebar */}
        <div 
          className="flex-col justify-start items-start gap-4 inline-flex self-stretch"
          style={{
            width: '360px',
            padding: '16px'
          }}
        >
          <Sidebar 
            activeTab={activeTab}
            selectedProject={selectedProject}
            onProjectChange={handleProjectChange}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>

        {/* Main Content */}
        <div 
          className="flex-1 self-stretch bg-white rounded border border-solid flex-col justify-center items-start gap-4 inline-flex"
          style={{
            padding: '16px',
            borderColor: 'rgba(31, 31, 31, 0.12)',
            borderWidth: '1px'
          }}
        >
          <TimerMain 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            selectedProject={selectedProject}
            selectedPeriod={selectedPeriod}
          />
        </div>
      </div>
    </TimerProvider>
  );
};

export default SprintTracker;
