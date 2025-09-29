import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Sprint {
  id: string;
  project_id: string;
  notes?: string;
  duration_seconds: number;
  mode: 'countdown' | 'stopwatch';
  started_at: string;
  completed_at: string;
  created_at: string;
}

export const useSprints = (projectId?: string) => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSprints = async () => {
    if (!user) {
      setSprints([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('sprints')
        .select('*')
        .eq('user_id', user.id);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query.order('completed_at', { ascending: false });

      if (error) throw error;
      setSprints((data || []) as Sprint[]);
    } catch (error) {
      console.error('Error fetching sprints:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch sprints',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprints();

    // Set up real-time subscription for sprints only once per user
    if (user) {
      const channel = supabase
        .channel('sprints_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sprints',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setSprints(prev => {
                // Prevent duplicates by checking if sprint already exists
                const exists = prev.some(sprint => sprint.id === payload.new.id);
                if (exists) return prev;
                return [payload.new as Sprint, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              setSprints(prev => 
                prev.map(sprint => 
                  sprint.id === payload.new.id ? payload.new as Sprint : sprint
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setSprints(prev => prev.filter(sprint => sprint.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]); // Remove projectId dependency to prevent refetches

  const createSprint = async (sprintData: {
    project_id: string;
    notes?: string;
    duration_seconds: number;
    mode: 'countdown' | 'stopwatch';
    started_at: Date;
    completed_at: Date;
  }): Promise<Sprint | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert([{
          ...sprintData,
          user_id: user.id,
          started_at: sprintData.started_at.toISOString(),
          completed_at: sprintData.completed_at.toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Don't update local state here - let real-time subscription handle it
      toast({
        title: 'Success',
        description: 'Sprint saved successfully',
      });
      
      return data as Sprint;
    } catch (error) {
      console.error('Error creating sprint:', error);
      toast({
        title: 'Error',
        description: 'Failed to save sprint',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateSprint = async (id: string, updates: Partial<Pick<Sprint, 'notes' | 'duration_seconds'>>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('sprints')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Don't update local state here - let real-time subscription handle it
      toast({
        title: 'Success',
        description: 'Sprint updated successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating sprint:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sprint',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteSprint = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('sprints')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Don't update local state here - let real-time subscription handle it
      toast({
        title: 'Success',
        description: 'Sprint deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting sprint:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete sprint',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    sprints,
    loading,
    createSprint,
    updateSprint,
    deleteSprint,
    refetch: fetchSprints,
  };
};
