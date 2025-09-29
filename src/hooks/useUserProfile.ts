"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./useAuth"
import type { Project } from "./useProjects"

interface UserProfile {
  id: string
  user_id: string
  last_used_project_id?: string
  created_at: string
  updated_at: string
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch profile")

      const data = await response.json()
      setProfile(data.profile)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user])

  const updateLastUsedProject = async (project: Project | null) => {
    if (!user) return

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          last_used_project_id: project?.id || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      const data = await response.json()
      setProfile(data.profile)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  return {
    profile,
    loading,
    updateLastUsedProject,
    refetch: fetchProfile,
  }
}
