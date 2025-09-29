import React, { useState } from 'react';
import { Button, Icon } from 'nullab-design-system';
import { useProjects, Project } from '@/hooks/useProjects';

interface ProjectManagementModalProps {
  project: Project;
  mode: 'rename' | 'delete';
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated?: (project: Project) => void;
  onProjectDeleted?: (project: Project) => void;
}

export const ProjectManagementModal: React.FC<ProjectManagementModalProps> = ({
  project,
  mode,
  isOpen,
  onClose,
  onProjectUpdated,
  onProjectDeleted
}) => {
  const [projectName, setProjectName] = useState(project.name);
  const [isLoading, setIsLoading] = useState(false);
  const { updateProject, deleteProject } = useProjects();

  const handleRename = async () => {
    if (!projectName.trim() || projectName === project.name) return;
    
    setIsLoading(true);
    const success = await updateProject(project.id, projectName.trim());
    
    if (success) {
      onProjectUpdated?.({ ...project, name: projectName.trim() });
      onClose();
    }
    
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const success = await deleteProject(project.id);
    
    if (success) {
      onProjectDeleted?.(project);
      onClose();
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && mode === 'rename') {
      e.preventDefault();
      handleRename();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {mode === 'rename' ? (
          <>
            <h2 className="text-xl font-normal mb-4">
              Rename Project
            </h2>
            
            <div className="space-y-4">
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                onKeyDown={handleKeyPress}
                autoFocus
                className="w-full px-4 py-2 bg-white border border-[rgba(31,31,31,0.12)] rounded"
              />
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRename}
                  disabled={!projectName.trim() || projectName === project.name || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Renaming...' : 'Rename'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-normal mb-4">
              Delete Project
            </h2>
            
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
