import React, { useState } from 'react';
import { Button } from 'nullab-design-system';
import { useProjects, Project } from '@/hooks/useProjects';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: Project) => void;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  onProjectCreated
}) => {
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createProject } = useProjects();

  const handleCreate = async () => {
    if (!projectName.trim()) return;
    
    setIsCreating(true);
    const project = await createProject(projectName.trim());
    
    if (project) {
      onProjectCreated(project);
      setProjectName('');
      onOpenChange(false);
    }
    
    setIsCreating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 
          className="text-xl font-normal mb-4"
          style={{ 
            fontFamily: 'Instrument Serif',
            fontStyle: 'italic'
          }}
        >
          create <span style={{ fontStyle: 'italic' }}>new project</span>
        </h2>
        
        <div className="space-y-4">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="project name"
            onKeyDown={handleKeyPress}
            autoFocus
            className="w-full px-4 py-2 bg-white border border-[rgba(31,31,31,0.12)] rounded"
            style={{ 
              fontFamily: 'Be Vietnam Pro',
              fontSize: '14px',
              lineHeight: '23.80px'
            }}
          />
          
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={!projectName.trim() || isCreating}
            className="w-full rounded-[100px] py-3 font-mono text-xs font-medium uppercase"
          >
            {isCreating ? 'CREATING...' : 'CREATE'}
          </Button>
        </div>
      </div>
    </div>
  );
};
