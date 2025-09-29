"use client"

import { useState, useCallback, useEffect } from "react"
import { useTimer } from "./useTimer"
import { useSprints } from "./useSprints"
import type { Project } from "./useProjects"

export const useTimerWithSprints = (selectedProject: Project | null) => {
  const [notes, setNotes] = useState("")
  const { createSprint } = useSprints()

  const handleComplete = useCallback(async () => {
    if (!selectedProject) return

    const sprintData = {
      projectId: selectedProject.id,
      duration: timer.mode === "countdown" ? timer.targetTime : timer.time,
      notes: notes.trim() || undefined,
      timerMode: timer.mode,
    }

    try {
      await createSprint(sprintData)
      setNotes("") // Clear notes after successful sprint
    } catch (error) {
      console.error("Failed to save sprint:", error)
    }
  }, [selectedProject, notes, createSprint])

  const timer = useTimer({
    mode: "stopwatch",
    targetTime: 1500, // 25 minutes default
    onComplete: handleComplete,
  })

  // Update browser title when timer is running
  useEffect(() => {
    if (timer.isRunning && typeof window !== "undefined") {
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      }

      const timeDisplay = formatTime(timer.time)
      const projectName = selectedProject?.name || "Sprint"
      document.title = `${timeDisplay} - ${projectName} | Sprint Tracker`
    } else if (typeof window !== "undefined") {
      document.title = "Sprint Tracker - Time Management & Productivity"
    }
  }, [timer.isRunning, timer.time, selectedProject?.name])

  return {
    ...timer,
    notes,
    setNotes,
    handleComplete,
  }
}
