import React from 'react'
import { useTimerContext } from '@/contexts/TimerContext'
import { Button } from 'nullab-design-system'

const TimerControls: React.FC = () => {
  const { state, startTimer, pauseTimer, completeTimer, selectedProject } = useTimerContext()

  const handleStartSprint = () => {
    if (state === 'idle' || state === 'paused') {
      startTimer()
    }
  }

  if (state === 'idle') {
    return (
      <>
        <Button variant="primary" onClick={handleStartSprint} disabled={!selectedProject}>
          start sprint
        </Button>
        {!selectedProject && <p className="text-sm text-[rgba(31,31,31,0.64)] text-center self-stretch">Select a project to start a sprint</p>}
      </>
    )
  }

  if (state === 'running') {
    return (
      <>
        <Button variant="secondary" onClick={pauseTimer} className="flex h-10 justify-center items-center gap-2 self-stretch box-border px-6 py-3 rounded-[100px]">
          <span className="text-xs font-medium leading-3 uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            pause
          </span>
        </Button>
        <Button variant="accent" onClick={completeTimer} className="flex h-10 justify-center items-center gap-2 self-stretch box-border px-6 py-3 rounded-[100px]">
          <span className="text-xs font-medium leading-3 uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Complete
          </span>
        </Button>
      </>
    )
  }

  if (state === 'paused') {
    return (
      <>
        <Button variant="primary" onClick={startTimer} className="flex h-10 justify-center items-center gap-2 self-stretch box-border px-6 py-3 rounded-[100px]">
          <span className="text-xs font-medium leading-3 uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            resume
          </span>
        </Button>
        <Button variant="accent" onClick={completeTimer} className="flex h-10 justify-center items-center gap-2 self-stretch box-border px-6 py-3 rounded-[100px]">
          <span className="text-xs font-medium leading-3 uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Complete
          </span>
        </Button>
      </>
    )
  }

  return null
}

export default TimerControls


