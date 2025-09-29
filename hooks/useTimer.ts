"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export type TimerMode = "stopwatch" | "countdown"
export type TimerState = "idle" | "running" | "paused" | "completed"

export interface UseTimerOptions {
  mode?: TimerMode
  targetTime?: number
  onComplete?: () => void
  onTick?: (time: number) => void
}

export const useTimer = (options: UseTimerOptions = {}) => {
  const { mode = "stopwatch", targetTime = 0, onComplete, onTick } = options

  const [time, setTime] = useState(0)
  const [state, setState] = useState<TimerState>("idle")
  const [currentMode, setCurrentMode] = useState<TimerMode>(mode)
  const [currentTargetTime, setCurrentTargetTime] = useState(targetTime)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  const isRunning = state === "running"
  const isPaused = state === "paused"
  const isCompleted = state === "completed"

  const updateTime = useCallback(() => {
    const now = Date.now()
    const elapsed = now - startTimeRef.current + pausedTimeRef.current

    if (currentMode === "stopwatch") {
      const newTime = Math.floor(elapsed / 1000)
      setTime(newTime)
      onTick?.(newTime)
    } else {
      const remaining = Math.max(0, currentTargetTime - Math.floor(elapsed / 1000))
      setTime(remaining)
      onTick?.(remaining)

      if (remaining === 0) {
        setState("completed")
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        onComplete?.()
      }
    }
  }, [currentMode, currentTargetTime, onComplete, onTick])

  const start = useCallback(() => {
    if (state === "idle") {
      startTimeRef.current = Date.now()
      pausedTimeRef.current = 0
      if (currentMode === "countdown") {
        setTime(currentTargetTime)
      } else {
        setTime(0)
      }
    } else if (state === "paused") {
      startTimeRef.current = Date.now()
    }

    setState("running")
    intervalRef.current = setInterval(updateTime, 100)
  }, [state, currentMode, currentTargetTime, updateTime])

  const pause = useCallback(() => {
    if (state === "running" && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      pausedTimeRef.current += Date.now() - startTimeRef.current
      setState("paused")
    }
  }, [state])

  const resume = useCallback(() => {
    if (state === "paused") {
      start()
    }
  }, [state, start])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState("completed")
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState("idle")
    setTime(currentMode === "countdown" ? currentTargetTime : 0)
    startTimeRef.current = 0
    pausedTimeRef.current = 0
  }, [currentMode, currentTargetTime])

  const setMode = useCallback(
    (newMode: TimerMode) => {
      if (state === "idle") {
        setCurrentMode(newMode)
        setTime(newMode === "countdown" ? currentTargetTime : 0)
      }
    },
    [state, currentTargetTime],
  )

  const setTargetTime = useCallback(
    (newTargetTime: number) => {
      if (state === "idle") {
        setCurrentTargetTime(newTargetTime)
        if (currentMode === "countdown") {
          setTime(newTargetTime)
        }
      }
    },
    [state, currentMode],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    time,
    state,
    mode: currentMode,
    targetTime: currentTargetTime,
    isRunning,
    isPaused,
    isCompleted,
    start,
    pause,
    resume,
    stop,
    reset,
    setMode,
    setTargetTime,
  }
}
