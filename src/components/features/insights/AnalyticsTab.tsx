import React, { useMemo } from 'react';
import { ChartContainer } from '../../shared/ChartContainer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { Sprint } from '@/hooks/useSprints';
import { TimePeriod, formatDuration } from '@/hooks/useTimeFilter';
import { Project } from '@/hooks/useProjects';
import { format, getHours, getDay, getDate, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface AnalyticsTabProps {
  sprints: Sprint[];
  period: TimePeriod;
  selectedProject: Project | null;
  projects: Project[];
}

interface ChartData {
  label: string;
  value: number;
  displayValue: string;
  isFuture?: boolean;
  fullDate?: string;
}

// Helper to calculate the Y-Axis domain with exactly 4 labels and nice round numbers
const calculateYAxisDomain = (maxSeconds: number) => {
  if (maxSeconds === 0) {
    return { 
      domainMax: 3600, 
      useMinutes: true, 
      ticks: [0, 900, 1800, 2700, 3600] // 0m, 15m, 30m, 45m, 60m
    };
  }
  
  // Find nice step sizes based on max value, ensuring we get round numbers
  let stepSeconds;
  if (maxSeconds <= 3600) { // Up to 1 hour
    stepSeconds = Math.ceil(maxSeconds / (4 * 900)) * 900; // Round to 15min increments
  } else if (maxSeconds <= 7200) { // Up to 2 hours
    stepSeconds = Math.ceil(maxSeconds / (4 * 1800)) * 1800; // Round to 30min increments
  } else if (maxSeconds <= 14400) { // Up to 4 hours
    stepSeconds = Math.ceil(maxSeconds / (4 * 3600)) * 3600; // Round to 1h increments
  } else { // Above 4 hours
    stepSeconds = Math.ceil(maxSeconds / (4 * 7200)) * 7200; // Round to 2h increments
  }

  // Ensure minimum step is reasonable
  if (stepSeconds < 900) stepSeconds = 900; // Minimum 15 minutes

  // Calculate domain maximum as 4 steps
  const domainMax = stepSeconds * 4;
  const useMinutes = domainMax <= 3600;
  
  // Create exactly 5 ticks (0, step, 2*step, 3*step, 4*step) for 4 intervals
  const ticks = [0, stepSeconds, stepSeconds * 2, stepSeconds * 3, domainMax];
  
  return { domainMax, useMinutes, ticks };
};

// Helper to format Y-axis labels
const formatYAxisLabel = (value: number, useMinutes: boolean) => {
  if (useMinutes) {
    return `${Math.round(value / 60)}m`;
  } else {
    // For hours, always show clean hour values (no minutes)
    const hours = Math.round(value / 3600);
    return `${hours}h`;
  }
};

// Helper function to determine if a period is in the future
const isFuture = (label: string, period: TimePeriod): boolean => {
  const now = new Date();
  const currentDay = getDay(now);
  const currentDate = getDate(now);
  const currentMonth = now.getMonth();
  
  switch (period) {
    case 'today':
      const periodHour = ['0-3am', '3-6am', '6-9am', '9am-12pm', '12-3pm', '3-6pm', '6-9pm', '9pm-12am'].indexOf(label);
      const periodStartHour = [0, 3, 6, 9, 12, 15, 18, 21][periodHour];
      return periodStartHour > getHours(now);
    case 'this-week':
      const dayIndex = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(label);
      const adjustedCurrentDay = currentDay === 0 ? 6 : currentDay - 1;
      return dayIndex > adjustedCurrentDay;
    case 'this-month':
      const dayOfMonth = parseInt(label);
      return dayOfMonth > currentDate;
    case 'this-year':
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(label);
      return monthIndex > currentMonth;
    default:
      return false;
  }
};

// Store chart dimensions globally for the CustomBarShape to access
let chartDimensions = { height: 0, yAxisTop: 0, yAxisBottom: 0 };

// Custom Bar shape for future/striped bars
const CustomBarShape = (props: any) => {
  const { x, y, width, height, fill, payload } = props;
  const isFutureBar = payload?.isFuture;
  
  if (isFutureBar) {
    // Use the stored chart dimensions to render full-height striped bars
    const { yAxisTop, yAxisBottom } = chartDimensions;
    const fullHeight = yAxisBottom - yAxisTop;
    
    return (
      <rect 
        x={x} 
        y={yAxisTop} 
        width={width} 
        height={fullHeight} 
        fill="url(#stripedPattern)" 
        rx={4} 
        ry={4}
      />
    );
  }
  
  return (
    <rect 
      x={x} 
      y={y} 
      width={width} 
      height={height} 
      fill={fill} 
      rx={4} 
      ry={4}
    />
  );
};

// Custom Bar Label component
const BarLabel = (props: any) => {
  const { x, y, width, payload, period } = props;
  
  // Only show labels for today, this-week, and last-week views
  const shouldShowLabel = ['today', 'this-week', 'last-week'].includes(period);
  
  if (!shouldShowLabel) {
    return null; // Hide labels for monthly views and other periods
  }

  // Don't show labels for zero values or future bars
  if (!payload?.value || payload?.value === 0 || payload?.isFuture) {
    return null;
  }

  return (
    <text 
      x={x + width / 2} 
      y={y - 8} 
      fill="hsl(var(--foreground))"
      textAnchor="middle" 
      className="text-sm font-medium"
    >
      {payload.displayValue}
    </text>
  );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, period }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    
    if (data.value === 0 || data.isFuture) return null;
    
    const isMonthly = ['this-month', 'last-month'].includes(period);
    const displayLabel = isMonthly && data.fullDate ? data.fullDate : label;
    
    return (
      <div className="bg-black text-white border border-gray-600 rounded-md px-3 py-2 shadow-md">
        <p className="text-sm">
          {isMonthly ? `${displayLabel}: ${data.displayValue}` : data.displayValue}
        </p>
      </div>
    );
  }
  
  return null;
};

// Custom X-Axis Tick for monthly views
const CustomXAxisTick = (props: any, isMonthlyView: boolean, isProjectView: boolean) => {
  const { x, y, payload } = props;
  
  if (isMonthlyView && !isProjectView) {
    const day = parseInt(payload.value || '0');
    const shouldShowLabel = [1, 8, 15, 29].includes(day);
    
    return (
      <g>
        {/* Always show tick line */}
        <line 
          x1={x} 
          y1={y - 6} 
          x2={x} 
          y2={y} 
          stroke="hsl(var(--border))" 
          strokeWidth={1}
        />
        {/* Only show label for specific days */}
        {shouldShowLabel && (
          <text 
            x={x} 
            y={y + 4} 
            textAnchor="middle" 
            fill="hsl(var(--muted-foreground))" 
            fontSize={12}
            dy="0.71em"
          >
            {payload.value}
          </text>
        )}
      </g>
    );
  }
  
  return (
    <text 
      x={x} 
      y={y + 4} 
      textAnchor="middle" 
      fill="hsl(var(--muted-foreground))" 
      fontSize={12}
      dy="0.71em"
    >
      {payload.value}
    </text>
  );
};

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  sprints,
  period,
  selectedProject,
  projects = [],
}) => {
  const chartData = useMemo(() => {
    if (!selectedProject) {
      const projectTotals: { [key: string]: number } = {};
      sprints.forEach(sprint => {
        projectTotals[sprint.project_id] = (projectTotals[sprint.project_id] || 0) + sprint.duration_seconds;
      });
      return projects.map(project => ({
        label: project.name,
        value: projectTotals[project.id] || 0,
        displayValue: formatDuration(projectTotals[project.id] || 0),
        isFuture: false,
      }));
    }

    const groupedData: { [key: string]: number } = {};
    let allLabels: string[] = [];

    if (period === 'this-month' || period === 'last-month') {
      const currentMonth = new Date();
      const monthToShow = period === 'this-month' ? currentMonth : new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
      const monthInterval = { start: startOfMonth(monthToShow), end: endOfMonth(monthToShow) };
      allLabels = eachDayOfInterval(monthInterval).map(day => format(day, 'dd'));
      
      sprints.forEach(sprint => {
        const completedAt = new Date(sprint.completed_at);
        const groupKey = format(completedAt, 'dd');
        groupedData[groupKey] = (groupedData[groupKey] || 0) + sprint.duration_seconds;
      });
      
      return allLabels.map(day => ({
        label: day,
        value: groupedData[day] || 0,
        displayValue: groupedData[day] ? formatDuration(groupedData[day]) : '',
        isFuture: isFuture(day, period),
        fullDate: format(new Date(monthToShow.getFullYear(), monthToShow.getMonth(), parseInt(day)), 'MMM dd'),
      }));
    } else if (period === 'today') {
      allLabels = ['0-3am', '3-6am', '6-9am', '9am-12pm', '12-3pm', '3-6pm', '6-9pm', '9pm-12am'];
      
      sprints.forEach(sprint => {
        const completedAt = new Date(sprint.completed_at);
        const hour = getHours(completedAt);
        let groupKey = '';
        
        if (hour >= 0 && hour < 3) groupKey = '0-3am';
        else if (hour >= 3 && hour < 6) groupKey = '3-6am';
        else if (hour >= 6 && hour < 9) groupKey = '6-9am';
        else if (hour >= 9 && hour < 12) groupKey = '9am-12pm';
        else if (hour >= 12 && hour < 15) groupKey = '12-3pm';
        else if (hour >= 15 && hour < 18) groupKey = '3-6pm';
        else if (hour >= 18 && hour < 21) groupKey = '6-9pm';
        else groupKey = '9pm-12am';
        
        groupedData[groupKey] = (groupedData[groupKey] || 0) + sprint.duration_seconds;
      });
    } else if (period === 'this-week' || period === 'last-week') {
      allLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      sprints.forEach(sprint => {
        const completedAt = new Date(sprint.completed_at);
        const dayOfWeek = getDay(completedAt);
        const groupKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
        groupedData[groupKey] = (groupedData[groupKey] || 0) + sprint.duration_seconds;
      });
    } else if (period === 'this-year' || period === 'last-year') {
      allLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      sprints.forEach(sprint => {
        const completedAt = new Date(sprint.completed_at);
        const month = completedAt.getMonth();
        const groupKey = allLabels[month];
        groupedData[groupKey] = (groupedData[groupKey] || 0) + sprint.duration_seconds;
      });
    }

    return allLabels.map(label => ({
      label,
      value: groupedData[label] || 0,
      displayValue: groupedData[label] ? formatDuration(groupedData[label]) : '',
      isFuture: isFuture(label, period),
    }));
  }, [sprints, period, selectedProject, projects]);

  const maxValue = Math.max(...chartData.filter(d => !d.isFuture).map(d => d.value));
  const { domainMax, useMinutes, ticks } = calculateYAxisDomain(maxValue);

  const isMonthlyView = period === 'this-month' || period === 'last-month';
  const isProjectView = !selectedProject;

  return (
    <ChartContainer className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          barCategoryGap="20%"
        >
          <defs>
            <pattern
              id="stripedPattern"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <rect width="4" height="8" fill="hsl(var(--muted))" />
              <rect x="4" width="4" height="8" fill="transparent" />
            </pattern>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            horizontal={true}
            vertical={false}
          />
          
          <XAxis 
            dataKey="label"
            axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            tickLine={false}
            tick={(props) => CustomXAxisTick(props, isMonthlyView, isProjectView)}
            interval={0}
          />
          
          <YAxis 
            domain={[0, domainMax]}
            ticks={ticks}
            tickFormatter={(value) => formatYAxisLabel(value, useMinutes)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            width={80}
          />
          
          <Tooltip content={<CustomTooltip period={period} />} />
          
          <Bar 
            dataKey="value" 
            fill="#0A68F5"
            shape={<CustomBarShape />}
          >
            <LabelList 
              content={(props) => <BarLabel {...props} period={period} />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
