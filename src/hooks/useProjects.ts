import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure we only show valid projects for this user
      const validProjects = (data || []).filter(project => 
        project && 
        project.id && 
        project.name && 
        project.user_id === user.id
      );
      
      setProjects(validProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Set up real-time subscription for projects
    if (user) {
      const channel = supabase
        .channel('projects_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setProjects(prev => [payload.new as Project, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setProjects(prev => 
                prev.map(project => 
                  project.id === payload.new.id ? payload.new as Project : project
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setProjects(prev => prev.filter(project => project.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const createProject = async (name: string): Promise<Project | null> => {
    if (!user) return null;

    // Check for duplicate project names
    const trimmedName = name.trim();
    const existingProject = projects.find(
      project => project.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingProject) {
      toast({
        title: 'Error',
        description: 'Project name already exists. Please enter a different name.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
          name: trimmedName, 
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Don't update local state here - let real-time subscription handle it
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProject = async (id: string, name: string): Promise<boolean> => {
    if (!user) return false;

    // Check for duplicate project names (excluding the current project)
    const trimmedName = name.trim();
    const existingProject = projects.find(
      project => project.id !== id && project.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingProject) {
      toast({
        title: 'Error',
        description: 'Project name already exists. Please enter a different name.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: trimmedName })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Don't update local state here - let real-time subscription handle it
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    if (!user) return false;

    // Find the project to get its name for the undo notification
    const projectToDelete = projects.find(p => p.id === id);
    if (!projectToDelete) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Show undo notification with project data
      showUndoNotification(projectToDelete);
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
      return false;
    }
  };

  const restoreProject = async (project: Project): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .insert([{
          id: project.id,
          name: project.name,
          user_id: user.id,
          created_at: project.created_at,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project restored successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error restoring project:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore project',
        variant: 'destructive',
      });
      return false;
    }
  };

  const showUndoNotification = (deletedProject: Project) => {
    let timeoutId: NodeJS.Timeout;
    
    toast({
      title: `"${deletedProject.name}" has been deleted`,
      description: 'Project deleted successfully. Click UNDO to restore.',
      action: React.createElement(
        'button',
        {
          onClick: () => {
            clearTimeout(timeoutId);
            restoreProject(deletedProject);
          },
          className: 'text-primary hover:underline font-medium'
        },
        'UNDO'
      ),
      duration: 5000,
    });

    // Auto-dismiss after 5 seconds
    timeoutId = setTimeout(() => {
      // Toast will auto-dismiss based on duration
    }, 5000);
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    restoreProject,
    refetch: fetchProjects,
  };
};
