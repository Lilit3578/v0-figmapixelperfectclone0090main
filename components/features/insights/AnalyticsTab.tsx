import React, { useMemo } from 'react'
import ChartContainer from '@/components/shared/ChartContainer'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { Sprint } from '@/hooks/useSprints'
import { TimePeriod, formatDuration } from '@/hooks/useTimeFilter'
import { Project } from '@/hooks/useProjects'
import { format, getHours, getDay, getDate, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

interface AnalyticsTabProps {
  sprints: Sprint[]
  period: TimePeriod
  selectedProject: Project | null
  projects: Project[]
}

interface ChartData { label: string; value: number; displayValue: string; isFuture?: boolean; fullDate?: string }

const calculateYAxisDomain = (maxSeconds: number) => {
  if (maxSeconds === 0) { return { domainMax: 3600, useMinutes: true, ticks: [0, 900, 1800, 2700, 3600] } }
  let stepSeconds
  if (maxSeconds <= 3600) stepSeconds = Math.ceil(maxSeconds / (4 * 900)) * 900
  else if (maxSeconds <= 7200) stepSeconds = Math.ceil(maxSeconds / (4 * 1800)) * 1800
  else if (maxSeconds <= 14400) stepSeconds = Math.ceil(maxSeconds / (4 * 3600)) * 3600
  else stepSeconds = Math.ceil(maxSeconds / (4 * 7200)) * 7200
  if (stepSeconds < 900) stepSeconds = 900
  const domainMax = stepSeconds * 4
  const useMinutes = domainMax <= 3600
  const ticks = [0, stepSeconds, stepSeconds * 2, stepSeconds * 3, domainMax]
  return { domainMax, useMinutes, ticks }
}

const formatYAxisLabel = (value: number, useMinutes: boolean) => (useMinutes ? `${Math.round(value / 60)}m` : `${Math.round(value / 3600)}h`)

const isFutureLabel = (label: string, period: TimePeriod): boolean => {
  const now = new Date()
  const currentDay = getDay(now)
  const currentDate = getDate(now)
  const currentMonth = now.getMonth()
  switch (period) {
    case 'today': {
      const idx = ['0-3am', '3-6am', '6-9am', '9am-12pm', '12-3pm', '3-6pm', '6-9pm', '9pm-12am'].indexOf(label)
      const start = [0, 3, 6, 9, 12, 15, 18, 21][idx]
      return start > getHours(now)
    }
    case 'this-week': {
      const idx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(label)
      const adjusted = currentDay === 0 ? 6 : currentDay - 1
      return idx > adjusted
    }
    case 'this-month': {
      const day = parseInt(label)
      return day > currentDate
    }
    case 'this-year': {
      const idx = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(label)
      return idx > currentMonth
    }
    default:
      return false
  }
}

let chartDimensions = { height: 0, yAxisTop: 0, yAxisBottom: 0 }
const CustomBarShape = (props: any) => {
  const { x, y, width, height, fill, payload } = props
  if (payload?.isFuture) {
    const { yAxisTop, yAxisBottom } = chartDimensions
    const fullHeight = yAxisBottom - yAxisTop
    return <rect x={x} y={yAxisTop} width={width} height={fullHeight} fill="url(#stripedPattern)" rx={4} ry={4} />
  }
  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />
}

const BarLabel = (props: any) => {
  const { x, y, width, payload, period } = props
  const shouldShowLabel = ['today', 'this-week', 'last-week'].includes(period)
  if (!shouldShowLabel || !payload?.value || payload?.value === 0 || payload?.isFuture) return null
  return (
    <text x={x + width / 2} y={y - 8} fill="hsl(var(--foreground))" textAnchor="middle" className="text-sm font-medium">
      {payload.displayValue}
    </text>
  )
}

const CustomTooltip = ({ active, payload, label, period }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload
    if (data.value === 0 || data.isFuture) return null
    const isMonthly = ['this-month', 'last-month'].includes(period)
    const displayLabel = isMonthly && data.fullDate ? data.fullDate : label
    return (
      <div className="bg-black text-white border border-gray-600 rounded-md px-3 py-2 shadow-md">
        <p className="text-sm">{isMonthly ? `${displayLabel}: ${data.displayValue}` : data.displayValue}</p>
      </div>
    )
  }
  return null
}

const CustomXAxisTick = (props: any, isMonthlyView: boolean, isProjectView: boolean) => {
  const { x, y, payload } = props
  if (isMonthlyView && !isProjectView) {
    const day = parseInt(payload.value || '0')
    const shouldShowLabel = [1, 8, 15, 29].includes(day)
    return (
      <g>
        <line x1={x} y1={y - 6} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth={1} />
        {shouldShowLabel && (
          <text x={x} y={y + 4} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={12} dy="0.71em">
            {payload.value}
          </text>
        )}
      </g>
    )
  }
  return (
    <text x={x} y={y + 4} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={12} dy="0.71em">
      {payload.value}
    </text>
  )
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ sprints, period, selectedProject, projects = [] }) => {
  const chartData = useMemo(() => {
    if (!selectedProject) {
      const projectTotals: Record<string, number> = {}
      sprints.forEach((s) => {
        const pid = (s as any).projectId || (s as any).project_id
        const dur = (s as any).duration || (s as any).duration_seconds
        projectTotals[pid] = (projectTotals[pid] || 0) + dur
      })
      return projects.map((p) => ({ label: p.name, value: projectTotals[p.id] || 0, displayValue: formatDuration(projectTotals[p.id] || 0), isFuture: false }))
    }
    const grouped: Record<string, number> = {}
    let labels: string[] = []
    if (period === 'this-month' || period === 'last-month') {
      const current = new Date()
      const monthToShow = period === 'this-month' ? current : new Date(current.getFullYear(), current.getMonth() - 1)
      const interval = { start: startOfMonth(monthToShow), end: endOfMonth(monthToShow) }
      labels = eachDayOfInterval(interval).map((d) => format(d, 'dd'))
      sprints.forEach((s) => {
        const completedAt = new Date((s as any).endTime || (s as any).completed_at)
        const key = format(completedAt, 'dd')
        const dur = (s as any).duration || (s as any).duration_seconds
        grouped[key] = (grouped[key] || 0) + dur
      })
      return labels.map((day) => ({ label: day, value: grouped[day] || 0, displayValue: grouped[day] ? formatDuration(grouped[day]) : '', isFuture: isFutureLabel(day, period), fullDate: format(new Date(monthToShow.getFullYear(), monthToShow.getMonth(), parseInt(day)), 'MMM dd') }))
    } else if (period === 'today') {
      labels = ['0-3am', '3-6am', '6-9am', '9am-12pm', '12-3pm', '3-6pm', '6-9pm', '9pm-12am']
      sprints.forEach((s) => {
        const completedAt = new Date((s as any).endTime || (s as any).completed_at)
        const hour = getHours(completedAt)
        let key = ''
        if (hour >= 0 && hour < 3) key = '0-3am'
        else if (hour >= 3 && hour < 6) key = '3-6am'
        else if (hour >= 6 && hour < 9) key = '6-9am'
        else if (hour >= 9 && hour < 12) key = '9am-12pm'
        else if (hour >= 12 && hour < 15) key = '12-3pm'
        else if (hour >= 15 && hour < 18) key = '3-6pm'
        else if (hour >= 18 && hour < 21) key = '6-9pm'
        else key = '9pm-12am'
        const dur = (s as any).duration || (s as any).duration_seconds
        grouped[key] = (grouped[key] || 0) + dur
      })
    } else if (period === 'this-week' || period === 'last-week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      sprints.forEach((s) => {
        const completedAt = new Date((s as any).endTime || (s as any).completed_at)
        const dayOfWeek = getDay(completedAt)
        const key = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]
        const dur = (s as any).duration || (s as any).duration_seconds
        grouped[key] = (grouped[key] || 0) + dur
      })
    } else if (period === 'this-year' || period === 'last-year') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      sprints.forEach((s) => {
        const completedAt = new Date((s as any).endTime || (s as any).completed_at)
        const month = completedAt.getMonth()
        const key = labels[month]
        const dur = (s as any).duration || (s as any).duration_seconds
        grouped[key] = (grouped[key] || 0) + dur
      })
    }
    return labels.map((label) => ({ label, value: grouped[label] || 0, displayValue: grouped[label] ? formatDuration(grouped[label]) : '', isFuture: isFutureLabel(label, period) }))
  }, [sprints, period, selectedProject, projects])

  const maxValue = Math.max(...chartData.filter((d) => !d.isFuture).map((d) => d.value))
  const { domainMax, useMinutes, ticks } = calculateYAxisDomain(maxValue)
  const isMonthlyView = period === 'this-month' || period === 'last-month'
  const isProjectView = !selectedProject

  return (
    <ChartContainer className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
          <defs>
            <pattern id="stripedPattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
              <rect width="4" height="8" fill="hsl(var(--muted))" />
              <rect x="4" width="4" height="8" fill="transparent" />
            </pattern>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
          <XAxis dataKey="label" axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }} tickLine={false} tick={(props) => CustomXAxisTick(props, isMonthlyView, isProjectView)} interval={0} />
          <YAxis domain={[0, domainMax]} ticks={ticks} tickFormatter={(v) => formatYAxisLabel(v, useMinutes)} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={80} />
          <Tooltip content={<CustomTooltip period={period} />} />
          <Bar dataKey="value" fill="#0A68F5" shape={<CustomBarShape />}>
            <LabelList content={(props) => <BarLabel {...props} period={period} />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


