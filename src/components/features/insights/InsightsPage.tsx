import React, { useState, useMemo } from 'react';
import { useSprints } from '@/hooks/useSprints';
import { useProjects, Project } from '@/hooks/useProjects';
import { useTimeFilter, TimePeriod } from '@/hooks/useTimeFilter';
import { InsightsHeader } from './InsightsHeader';
import { InsightsTabs } from './InsightsTabs';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

interface InsightsPageProps {
  selectedPeriod: TimePeriod;
  selectedProject: Project | null;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ 
  selectedPeriod, 
  selectedProject 
}) => {
  const [activeInsightTab, setActiveInsightTab] = useState<'analytics' | 'sprints'>('analytics');
  const { sprints, loading } = useSprints();
  const { projects } = useProjects();
  
  // Use selectedProject.id when a specific project is selected, null for "All Projects"
  const selectedProjectId = selectedProject?.id;
  const { filteredSprints, metrics } = useTimeFilter(sprints, selectedPeriod, selectedProjectId);

  // Memoize expensive computations
  const memoizedInsightsTabs = useMemo(() => (
    <InsightsTabs 
      activeTab={activeInsightTab}
      onTabChange={setActiveInsightTab}
      sprints={filteredSprints}
      period={selectedPeriod}
      selectedProject={selectedProject}
      projects={projects}
    />
  ), [activeInsightTab, filteredSprints, selectedPeriod, selectedProject, projects]);

  if (loading) {
    return (
      <div className="flex-1 self-stretch overflow-hidden flex-col justify-center items-center flex">
        <LoadingSpinner size="lg" text="Loading insights..." />
      </div>
    );
  }

  return (
    <div className="flex-1 self-stretch overflow-hidden flex-col justify-start items-start gap-4 flex">
      <InsightsHeader metrics={metrics} selectedProject={selectedProject} />
      {memoizedInsightsTabs}
    </div>
  );
};
