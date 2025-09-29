import React from 'react';
import { Sprint } from '@/hooks/useSprints';
import { TimePeriod } from '@/hooks/useTimeFilter';
import { Project } from '@/hooks/useProjects';
import { AnalyticsTab } from './AnalyticsTab';
import { SprintsTab } from './SprintsTab';

interface InsightsTabsProps {
  activeTab: 'analytics' | 'sprints';
  onTabChange: (tab: 'analytics' | 'sprints') => void;
  sprints: Sprint[];
  period: TimePeriod;
  selectedProject: Project | null;
  projects: Project[];
}

export const InsightsTabs: React.FC<InsightsTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  sprints, 
  period,
  selectedProject,
  projects 
}) => {
  return (
    <div 
      className="self-stretch flex-1 p-4 overflow-hidden rounded border border-solid flex-col justify-start items-start gap-4 flex"
      style={{ borderColor: 'rgba(31, 31, 31, 0.08)' }}
    >
      {/* Tab navigation */}
      <div className="self-stretch justify-start items-start gap-1 inline-flex">
        <div
          className={`px-3 py-1 rounded-[100px] justify-start items-center gap-2 flex cursor-pointer ${
            activeTab === 'analytics' 
              ? 'bg-[rgba(31,31,31,0.08)]' 
              : 'hover:bg-[rgba(31,31,31,0.04)]'
          }`}
          onClick={() => onTabChange('analytics')}
        >
          <div 
            className={`text-sm font-normal ${
              activeTab === 'analytics' ? 'text-[#1F1F1F]' : 'text-[rgba(31,31,31,0.64)]'
            }`}
            style={{ 
              fontFamily: 'Be Vietnam Pro', 
              lineHeight: '23.80px' 
            }}
          >
            analytics
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-[100px] justify-start items-center gap-2 flex cursor-pointer ${
            activeTab === 'sprints' 
              ? 'bg-[rgba(31,31,31,0.08)]' 
              : 'hover:bg-[rgba(31,31,31,0.04)]'
          }`}
          onClick={() => onTabChange('sprints')}
        >
          <div 
            className={`text-sm font-normal ${
              activeTab === 'sprints' ? 'text-[#1F1F1F]' : 'text-[rgba(31,31,31,0.64)]'
            }`}
            style={{ 
              fontFamily: 'Be Vietnam Pro', 
              lineHeight: '23.80px' 
            }}
          >
            sprints
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'analytics' ? (
        <AnalyticsTab 
          sprints={sprints} 
          period={period} 
          selectedProject={selectedProject}
          projects={projects}
        />
      ) : (
        <SprintsTab sprints={sprints} />
      )}
    </div>
  );
};
