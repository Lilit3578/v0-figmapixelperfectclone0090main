import React from 'react';
import { Project } from '@/hooks/useProjects';

interface InsightsHeaderProps {
  metrics: {
    totalTimeSpent: string;
    averageSprint: string;
    sprintCount: number;
  };
  selectedProject: Project | null;
}

export const InsightsHeader: React.FC<InsightsHeaderProps> = ({ metrics, selectedProject }) => {
  return (
    <div className="self-stretch justify-start items-start gap-4 inline-flex" style={{ height: '200px' }}>
      <div 
        className="flex-1 self-stretch p-10 overflow-hidden rounded border border-solid flex-col justify-center items-center gap-2 inline-flex"
        style={{ borderColor: 'rgba(31, 31, 31, 0.08)' }}
      >
        <div 
          className="text-center italic font-normal"
          style={{ 
            color: '#141414', 
            fontSize: '56px', 
            fontFamily: 'Instrument Serif', 
            lineHeight: '56px' 
          }}
        >
          {metrics.totalTimeSpent}
        </div>
        <div 
          className="text-center text-[#1F1F1F] text-sm font-normal"
          style={{ 
            fontFamily: 'Be Vietnam Pro', 
            lineHeight: '23.80px' 
          }}
        >
          time spent
        </div>
      </div>
      
      <div 
        className="flex-1 self-stretch p-10 overflow-hidden rounded border border-solid flex-col justify-center items-center gap-2 inline-flex"
        style={{ borderColor: 'rgba(31, 31, 31, 0.08)' }}
      >
        <div 
          className="text-center italic font-normal"
          style={{ 
            color: '#141414', 
            fontSize: '56px', 
            fontFamily: 'Instrument Serif', 
            lineHeight: '56px' 
          }}
        >
          {metrics.averageSprint}
        </div>
        <div 
          className="text-center text-[#1F1F1F] text-sm font-normal"
          style={{ 
            fontFamily: 'Be Vietnam Pro', 
            lineHeight: '23.80px' 
          }}
        >
          avg sprint
        </div>
      </div>
      
      <div 
        className="flex-1 self-stretch p-10 overflow-hidden rounded border border-solid flex-col justify-center items-center gap-2 inline-flex"
        style={{ borderColor: 'rgba(31, 31, 31, 0.08)' }}
      >
        <div 
          className="text-center italic font-normal"
          style={{ 
            color: '#141414', 
            fontSize: '56px', 
            fontFamily: 'Instrument Serif', 
            lineHeight: '56px' 
          }}
        >
          {metrics.sprintCount}
        </div>
        <div 
          className="text-center text-[#1F1F1F] text-sm font-normal"
          style={{ 
            fontFamily: 'Be Vietnam Pro', 
            lineHeight: '23.80px' 
          }}
        >
          sprints
        </div>
      </div>
    </div>
  );
};
