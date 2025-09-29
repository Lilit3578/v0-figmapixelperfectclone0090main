import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTimerWithSprints } from '@/hooks/useTimerWithSprints';
import { Project, useProjects } from '@/hooks/useProjects';
import { useUserProfile } from '@/hooks/useUserProfile';

type TimerContextType = ReturnType<typeof useTimerWithSprints> & {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);


interface TimerProviderProps {
  children: React.ReactNode;
  selectedProject?: Project | null;
  onProjectChange?: (project: Project | null) => void;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ 
  children, 
  selectedProject: externalSelectedProject, 
  onProjectChange 
}) => {
  const [internalSelectedProject, setInternalSelectedProject] = useState<Project | null>(null);
  const { projects } = useProjects();
  const { profile, updateLastUsedProject } = useUserProfile();
  
  // Use external selectedProject if provided, otherwise use internal state
  const selectedProject = externalSelectedProject !== undefined ? externalSelectedProject : internalSelectedProject;
  const timerState = useTimerWithSprints(selectedProject);

  // Load last used project from profile when available (only for internal state)
  useEffect(() => {
    if (externalSelectedProject === undefined && profile?.last_used_project_id && projects.length > 0) {
      const lastProject = projects.find(p => p.id === profile.last_used_project_id);
      if (lastProject) {
        setInternalSelectedProject(lastProject);
      }
    }
  }, [profile, projects, externalSelectedProject]);

  // Update profile when selected project changes
  const handleProjectChange = async (project: Project | null) => {
    if (onProjectChange) {
      onProjectChange(project);
    } else {
      setInternalSelectedProject(project);
    }
    await updateLastUsedProject(project);
  };

  const value = {
    ...timerState,
    selectedProject,
    setSelectedProject: handleProjectChange,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};
