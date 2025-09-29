import React from 'react';
import { InsightsPage } from './InsightsPage';
import { TimePeriod } from '@/hooks/useTimeFilter';
import { Project, useProjects } from '@/hooks/useProjects';

interface InsightsPanelProps {
  selectedPeriod: TimePeriod;
  selectedProject: Project | null;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ selectedPeriod, selectedProject }) => {
  return (
    <InsightsPage 
      selectedPeriod={selectedPeriod}
      selectedProject={selectedProject}
    />
  );
};

export default InsightsPanel;
