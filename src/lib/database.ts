import { getCollection } from "./mongodb"
import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  id: string
  email: string
  created_at: Date
  updated_at: Date
  last_used_project_id?: string
}

export interface Project {
  _id?: ObjectId
  id: string
  name: string
  user_id: string
  created_at: Date
  updated_at: Date
}

export interface Sprint {
  _id?: ObjectId
  id: string
  user_id: string
  project_id: string
  duration_seconds: number
  started_at: Date
  completed_at: Date
  mode: string
  notes?: string
  created_at: Date
}

// User operations
export async function createUser(userData: Omit<User, "_id" | "created_at" | "updated_at">): Promise<User> {
  const users = await getCollection<User>("users")
  const now = new Date()
  const user: User = {
    ...userData,
    created_at: now,
    updated_at: now,
  }

  const result = await users.insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getCollection<User>("users")
  return await users.findOne({ email })
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getCollection<User>("users")
  return await users.findOne({ id })
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
  const users = await getCollection<User>("users")
  const result = await users.updateOne({ id: userId }, { $set: { ...updates, updated_at: new Date() } })
  return result.modifiedCount > 0
}

// Project operations
export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const projects = await getCollection<Project>("projects")
  return await projects.find({ user_id: userId }).sort({ created_at: -1 }).toArray()
}

export async function createProject(projectData: Omit<Project, "_id" | "created_at" | "updated_at">): Promise<Project> {
  const projects = await getCollection<Project>("projects")
  const now = new Date()
  const project: Project = {
    ...projectData,
    created_at: now,
    updated_at: now,
  }

  const result = await projects.insertOne(project)
  return { ...project, _id: result.insertedId }
}

export async function updateProject(projectId: string, userId: string, updates: Partial<Project>): Promise<boolean> {
  const projects = await getCollection<Project>("projects")
  const result = await projects.updateOne(
    { id: projectId, user_id: userId },
    { $set: { ...updates, updated_at: new Date() } },
  )
  return result.modifiedCount > 0
}

export async function deleteProject(projectId: string, userId: string): Promise<boolean> {
  const projects = await getCollection<Project>("projects")
  const result = await projects.deleteOne({ id: projectId, user_id: userId })
  return result.deletedCount > 0
}

// Sprint operations
export async function getSprintsByUserId(
  userId: string,
  filters?: {
    startDate?: Date
    endDate?: Date
    projectId?: string
  },
): Promise<Sprint[]> {
  const sprints = await getCollection<Sprint>("sprints")
  const query: any = { user_id: userId }

  if (filters?.startDate || filters?.endDate) {
    query.completed_at = {}
    if (filters.startDate) query.completed_at.$gte = filters.startDate
    if (filters.endDate) query.completed_at.$lte = filters.endDate
  }

  if (filters?.projectId) {
    query.project_id = filters.projectId
  }

  return await sprints.find(query).sort({ completed_at: -1 }).toArray()
}

export async function createSprint(sprintData: Omit<Sprint, "_id" | "created_at">): Promise<Sprint> {
  const sprints = await getCollection<Sprint>("sprints")
  const sprint: Sprint = {
    ...sprintData,
    created_at: new Date(),
  }

  const result = await sprints.insertOne(sprint)
  return { ...sprint, _id: result.insertedId }
}

export async function updateSprint(sprintId: string, userId: string, updates: Partial<Sprint>): Promise<boolean> {
  const sprints = await getCollection<Sprint>("sprints")
  const result = await sprints.updateOne({ id: sprintId, user_id: userId }, { $set: updates })
  return result.modifiedCount > 0
}

export async function deleteSprint(sprintId: string, userId: string): Promise<boolean> {
  const sprints = await getCollection<Sprint>("sprints")
  const result = await sprints.deleteOne({ id: sprintId, user_id: userId })
  return result.deletedCount > 0
}
