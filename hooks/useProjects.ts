"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./useAuth"
import { useToast } from "./use-toast"

export interface Project {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchProjects = async () => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/projects")

      if (!response.ok) throw new Error("Failed to fetch projects")

      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [user])

  const createProject = async (name: string): Promise<Project | null> => {
    if (!user) return null

    // Check for duplicate project names
    const trimmedName = name.trim()
    const existingProject = projects.find((project) => project.name.toLowerCase() === trimmedName.toLowerCase())

    if (existingProject) {
      toast({
        title: "Error",
        description: "Project name already exists. Please enter a different name.",
        variant: "destructive",
      })
      return null
    }

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      })

      if (!response.ok) throw new Error("Failed to create project")

      const data = await response.json()
      const newProject = data.project

      setProjects((prev) => [newProject, ...prev])

      toast({
        title: "Success",
        description: "Project created successfully",
      })

      return newProject
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      })
      return null
    }
  }

  const updateProject = async (id: string, name: string): Promise<boolean> => {
    if (!user) return false

    // Check for duplicate project names (excluding the current project)
    const trimmedName = name.trim()
    const existingProject = projects.find(
      (project) => project.id !== id && project.name.toLowerCase() === trimmedName.toLowerCase(),
    )

    if (existingProject) {
      toast({
        title: "Error",
        description: "Project name already exists. Please enter a different name.",
        variant: "destructive",
      })
      return false
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      })

      if (!response.ok) throw new Error("Failed to update project")

      const data = await response.json()
      const updatedProject = data.project

      setProjects((prev) => prev.map((project) => (project.id === id ? updatedProject : project)))

      toast({
        title: "Success",
        description: "Project updated successfully",
      })

      return true
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteProject = async (id: string): Promise<boolean> => {
    if (!user) return false

    const projectToDelete = projects.find((p) => p.id === id)
    if (!projectToDelete) return false

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete project")

      setProjects((prev) => prev.filter((project) => project.id !== id))

      toast({
        title: "Success",
        description: "Project deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
      return false
    }
  }

  const restoreProject = async (project: Project): Promise<boolean> => {
    // For now, just recreate the project
    const restored = await createProject(project.name)
    return restored !== null
  }

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    restoreProject,
    refetch: fetchProjects,
  }
}
