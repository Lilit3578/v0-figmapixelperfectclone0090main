import React, { useState, useCallback, useMemo } from 'react';
import { Button, Combobox, Icon } from 'nullab-design-system';
import { useProjects, Project } from '@/hooks/useProjects';
import { CreateProjectDialog } from './CreateProjectDialog';
import { ProjectManagementModal } from './ProjectManagementModal';
import { ComboboxWrapper } from './ComboboxWrapper';

interface ProjectDropdownProps {
  selectedProject: Project | null;
  onProjectChange: (project: Project | null) => void;
  isInsightsTab?: boolean;
}

// Create a special "All Projects" project object to maintain consistency
const ALL_PROJECTS_ITEM: Project = {
  id: 'all-projects',
  name: 'All Projects',
  // Add any other required Project properties with safe defaults
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as Project;

const ProjectDropdown: React.FC<ProjectDropdownProps> = ({
  selectedProject,
  onProjectChange,
  isInsightsTab = false
}) => {
  const { projects, createProject } = useProjects();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [managementModal, setManagementModal] = useState<{
    project: Project;
    mode: 'rename' | 'delete';
  } | null>(null);

  // Memoize valid projects to prevent unnecessary re-renders
  const validProjects = useMemo(() => 
    projects.filter(
      (project) =>
        project &&
        project.id &&
        project.name &&
        project.name.trim().length > 0
    ), [projects]
  );

  // Determine the display value for the combobox
  const displayValue = useMemo(() => {
    // If selectedProject is null and we're in insights tab, show "All Projects"
    if (!selectedProject && isInsightsTab) {
      return ALL_PROJECTS_ITEM;
    }
    return selectedProject;
  }, [selectedProject, isInsightsTab]);

  const handleProjectCreated = useCallback((project: Project) => {
    onProjectChange(project);
  }, [onProjectChange]);

  const handleProjectChange = useCallback((project: Project | null) => {
    // Handle the special "All Projects" case
    if (project && project.id === 'all-projects') {
      // For insights tab, "All Projects" means no specific project selected
      onProjectChange(null);
    } else {
      onProjectChange(project);
    }
  }, [onProjectChange]);

  const handleCreateNewProject = useCallback((searchTerm?: string) => {
    if (searchTerm && searchTerm.trim()) {
      handleCreateWithName(searchTerm.trim());
    } else {
      setShowCreateDialog(true);
    }
  }, []);

  const handleCreateWithName = useCallback(async (name: string) => {
    // Input validation
    if (!name || name.trim().length === 0) {
      // TODO: Show user-friendly error message instead of console.error
      console.error('Project name cannot be empty');
      return;
    }
    if (name.trim().length > 100) {
      // TODO: Show user-friendly error message instead of console.error
      console.error('Project name too long');
      return;
    }
    
    try {
      const project = await createProject(name.trim());
      if (project) {
        handleProjectCreated(project);
      }
    } catch (error) {
      // TODO: Show user-friendly error message instead of console.error
      console.error('Failed to create project:', error);
    }
  }, [createProject, handleProjectCreated]);

  const handleRename = useCallback((project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setManagementModal({ project, mode: 'rename' });
  }, []);

  const handleDelete = useCallback((project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setManagementModal({ project, mode: 'delete' });
  }, []);

  const handleProjectDeleted = useCallback((deletedProject: Project) => {
    if (selectedProject?.id === deletedProject.id) {
      // If deleted project was selected, fall back to "All Projects" in insights tab
      if (isInsightsTab) {
        onProjectChange(null);
      } else {
        onProjectChange(null);
      }
    }
  }, [selectedProject?.id, onProjectChange, isInsightsTab]);

  return (
    <>
      <div className="self-stretch">
        <label htmlFor="project-select" className="sr-only">
          Select project
        </label>
        <ComboboxWrapper
          value={displayValue} // Use the computed display value
          onChange={handleProjectChange}
          onCreateNew={handleCreateNewProject}
          placeholder={isInsightsTab ? "All Projects" : "Search or create project..."}
          className="self-stretch"
        >
          {isInsightsTab && (
            <Combobox.Item 
              key="all-projects" 
              value={ALL_PROJECTS_ITEM}
              aria-label="View data for all projects"
            >
              All Projects
            </Combobox.Item>
          )}

          {validProjects.length > 0 && validProjects.map((project) => {
            // Extra safety check to ensure project is valid
            if (!project || !project.id || !project.name) {
              console.warn('Invalid project detected:', project);
              return null;
            }
            
            return (
              <Combobox.Item
                key={project.id}
                value={project}
                trailing={
                  <div
                    className="flex gap-1"
                    onMouseDown={(e) => {
                      // Prevent Combobox from selecting on button clicks
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <Button
                      variant="icon"
                      tooltip="Rename"
                      tooltipPosition="bottom"
                      className="!w-6 !h-6"
                      onClick={(e) => handleRename(project, e)}
                      aria-label={`Rename ${project.name}`}
                    >
                      <Icon name="PenLine" />
                    </Button>
                    <Button
                      variant="icon"
                      tooltip="Delete"
                      tooltipPosition="bottom"
                      className="!w-6 !h-6"
                      onClick={(e) => handleDelete(project, e)}
                      aria-label={`Delete ${project.name}`}
                    >
                      <Icon name="Trash2" />
                    </Button>
                  </div>
                }
              >
                {project.name}
              </Combobox.Item>
            );
          }).filter(Boolean)}

          <Combobox.Action leading={<Icon name="Plus" />}>
            Create new project
          </Combobox.Action>
        </ComboboxWrapper>
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={handleProjectCreated}
      />

      {managementModal && (
        <ProjectManagementModal
          project={managementModal.project}
          mode={managementModal.mode}
          isOpen={true}
          onClose={() => setManagementModal(null)}
          onProjectDeleted={handleProjectDeleted}
        />
      )}
    </>
  );
};

export default ProjectDropdown;
