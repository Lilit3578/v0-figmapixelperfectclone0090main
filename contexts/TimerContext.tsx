"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useTimerWithSprints } from "@/hooks/useTimerWithSprints"
import type { Project } from "@/hooks/useProjects"

export interface TimerContextType {
  // Timer state
  time: number
  isRunning: boolean
  isPaused: boolean
  mode: "stopwatch" | "countdown"
  targetTime: number

  // Timer controls
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
  setMode: (mode: "stopwatch" | "countdown") => void
  setTargetTime: (time: number) => void

  // Sprint management
  notes: string
  setNotes: (notes: string) => void
  selectedProject: Project | null
  onProjectChange: (project: Project | null) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

interface TimerProviderProps {
  children: ReactNode
  selectedProject: Project | null
  onProjectChange: (project: Project | null) => void
}

export function TimerProvider({ children, selectedProject, onProjectChange }: TimerProviderProps) {
  const timerData = useTimerWithSprints(selectedProject)

  const value: TimerContextType = {
    ...timerData,
    selectedProject,
    onProjectChange,
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
