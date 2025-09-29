"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./useAuth"
import { useToast } from "./use-toast"

export interface Sprint {
  id: string
  project_id: string
  notes?: string
  duration_seconds: number
  mode: "countdown" | "stopwatch"
  started_at: string
  completed_at: string
  created_at: string
}

export const useSprints = (projectId?: string) => {
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
      const token = localStorage.getItem("auth_token")
      const url = projectId ? `/api/sprints?projectId=${projectId}` : "/api/sprints"
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

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
  }, [user, projectId])

  const createSprint = async (sprintData: {
    project_id: string
    notes?: string
    duration_seconds: number
    mode: "countdown" | "stopwatch"
    started_at: Date
    completed_at: Date
  }): Promise<Sprint | null> => {
    if (!user) return null

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/sprints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...sprintData,
          started_at: sprintData.started_at.toISOString(),
          completed_at: sprintData.completed_at.toISOString(),
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

  const updateSprint = async (
    id: string,
    updates: Partial<Pick<Sprint, "notes" | "duration_seconds">>,
  ): Promise<boolean> => {
    if (!user) return false

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/sprints/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/sprints/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
