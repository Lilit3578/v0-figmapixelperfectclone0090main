import { useMemo } from 'react';
import { Sprint } from './useSprints';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears } from 'date-fns';

export type TimePeriod = 'today' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-year';

export const useTimeFilter = (sprints: Sprint[], period: TimePeriod, selectedProjectId?: string) => {
  const filteredSprints = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'this-week':
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'last-week':
        const lastWeek = subWeeks(now, 1);
        startDate = startOfWeek(lastWeek, { weekStartsOn: 1 });
        endDate = endOfWeek(lastWeek, { weekStartsOn: 1 });
        break;
      case 'this-month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'this-year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }

    return sprints.filter(sprint => {
      const completedAt = new Date(sprint.completed_at);
      const inTimeRange = completedAt >= startDate && completedAt <= endDate;
      const inProject = !selectedProjectId || sprint.project_id === selectedProjectId;
      return inTimeRange && inProject;
    });
  }, [sprints, period, selectedProjectId]);

  const metrics = useMemo(() => {
    const totalSeconds = filteredSprints.reduce((sum, sprint) => sum + sprint.duration_seconds, 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    
    const averageSeconds = filteredSprints.length > 0 ? totalSeconds / filteredSprints.length : 0;
    const avgHours = Math.floor(averageSeconds / 3600);
    const avgMinutes = Math.floor((averageSeconds % 3600) / 60);

    return {
      totalTimeSpent: totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`,
      averageSprint: avgHours > 0 ? `${avgHours}h ${avgMinutes}m` : `${avgMinutes}m`,
      sprintCount: filteredSprints.length
    };
  }, [filteredSprints]);

  return {
    filteredSprints,
    metrics
  };
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
