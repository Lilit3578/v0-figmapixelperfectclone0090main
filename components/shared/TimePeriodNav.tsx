import React from 'react'
import { TimePeriod } from '@/hooks/useTimeFilter'

interface TimePeriodNavProps {
  selectedPeriod: TimePeriod
  onPeriodChange: (period: TimePeriod) => void
}

const TimePeriodNav: React.FC<TimePeriodNavProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { id: 'today' as TimePeriod, label: 'today' },
    { id: 'this-week' as TimePeriod, label: 'this week' },
    { id: 'last-week' as TimePeriod, label: 'last week' },
    { id: 'this-month' as TimePeriod, label: 'this month' },
    { id: 'last-month' as TimePeriod, label: 'last month' },
    { id: 'this-year' as TimePeriod, label: 'this year' },
  ]

  return (
    <div className="flex-col justify-start items-start flex self-stretch">
      {periods.map((period) => (
        <div key={period.id} className={`self-stretch px-4 py-2 overflow-hidden rounded cursor-pointer flex justify-start items-center gap-2 ${selectedPeriod === period.id ? 'bg-[rgba(31,31,31,0.08)]' : 'hover:bg-[rgba(31,31,31,0.04)]'}`} onClick={() => onPeriodChange(period.id)}>
          <div className="flex-1 text-[#1F1F1F] text-sm font-normal" style={{ fontFamily: 'Be Vietnam Pro', lineHeight: '23.80px' }}>
            {period.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TimePeriodNav


