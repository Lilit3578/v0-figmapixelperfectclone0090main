import React from 'react'
import { useTimerContext } from '@/contexts/TimerContext'

interface TimerDisplayProps {
  formattedTime: string
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ formattedTime }) => {
  const { state, mode, showCustomInput, customInput, handleCustomInputChange, handleCustomInputComplete } = useTimerContext()

  const textColor = state === 'idle' ? 'rgba(31, 31, 31, 0.24)' : '#1F1F1F'

  if (mode === 'custom' && showCustomInput) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-[200px] max-h-[400px]">
        <input
          value={customInput}
          onChange={(e) => handleCustomInputChange(e.target.value)}
          placeholder="e.g. 1h 30m"
          className="text-center font-normal leading-none tracking-[-0.02em] font-mono text-[clamp(30px,8vw,120px)] border-none bg-transparent text-[rgba(31,31,31,0.64)] placeholder:text-[rgba(31,31,31,0.24)] focus:outline-none focus:ring-0 max-w-full h-auto px-0"
          style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(30px, 8vw, 120px)' }}
          autoFocus
          onBlur={handleCustomInputComplete}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleCustomInputComplete()
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-[200px] max-h-[400px]">
      <time className="text-center font-normal leading-none tracking-[-0.02em] font-mono text-[clamp(60px,12vw,240px)] max-w-full" style={{ fontFamily: 'Instrument Serif, serif', color: textColor }}>
        {formattedTime}
      </time>
    </div>
  )
}

export default TimerDisplay


