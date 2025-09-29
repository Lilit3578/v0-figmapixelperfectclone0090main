"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./useAuth"
import { useToast } from "./use-toast"

export interface Sprint {
  id: string
  projectId: string
  duration: number
  startTime: string
  endTime: string
  notes?: string
  timerMode: "stopwatch" | "countdown"
  project?: {
    id: string
    name: string
  }
}

export interface CreateSprintData {
  projectId: string
  duration: number
  notes?: string
  timerMode: "stopwatch" | "countdown"
}

export const useSprints = () => {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchSprints = async () => {
    if (!user) {
      setSprints([])
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/sprints")

      if (!response.ok) throw new Error("Failed to fetch sprints")

      const data = await response.json()
      setSprints(data.sprints || [])
    } catch (error) {
      console.error("Error fetching sprints:", error)
      toast({
        title: "Error",
        description: "Failed to fetch sprints",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSprints()
  }, [user])

  const createSprint = async (sprintData: CreateSprintData): Promise<Sprint | null> => {
    if (!user) return null

    try {
      const now = new Date()
      const startTime = new Date(now.getTime() - sprintData.duration * 1000)

      const response = await fetch("/api/sprints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...sprintData,
          startTime: startTime.toISOString(),
          endTime: now.toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to create sprint")

      const data = await response.json()
      const newSprint = data.sprint

      setSprints((prev) => [newSprint, ...prev])

      toast({
        title: "Success",
        description: "Sprint saved successfully",
      })

      return newSprint
    } catch (error) {
      console.error("Error creating sprint:", error)
      toast({
        title: "Error",
        description: "Failed to save sprint",
        variant: "destructive",
      })
      return null
    }
  }

  const updateSprint = async (id: string, updates: Partial<Sprint>): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch(`/api/sprints/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update sprint")

      const data = await response.json()
      const updatedSprint = data.sprint

      setSprints((prev) => prev.map((sprint) => (sprint.id === id ? updatedSprint : sprint)))

      toast({
        title: "Success",
        description: "Sprint updated successfully",
      })

      return true
    } catch (error) {
      console.error("Error updating sprint:", error)
      toast({
        title: "Error",
        description: "Failed to update sprint",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteSprint = async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch(`/api/sprints/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete sprint")

      setSprints((prev) => prev.filter((sprint) => sprint.id !== id))

      toast({
        title: "Success",
        description: "Sprint deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting sprint:", error)
      toast({
        title: "Error",
        description: "Failed to delete sprint",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    sprints,
    loading,
    createSprint,
    updateSprint,
    deleteSprint,
    refetch: fetchSprints,
  }
}
