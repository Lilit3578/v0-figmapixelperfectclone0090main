import { getDb } from "@/lib/db"
import type { Collection } from "mongodb"

export interface UserDoc { _id: string; email: string; createdAt: Date; lastLoginAt?: Date }
export interface ProjectDoc { _id: string; userId: string; name: string; createdAt: Date; archived?: boolean }
export interface SprintDoc {
  _id: string
  userId: string
  projectId: string
  durationSec: number
  startedAt: Date
  completedAt: Date
  mode: "countdown" | "stopwatch"
  notes?: string
}

export async function users(): Promise<Collection<UserDoc>> {
  return (await getDb()).collection<UserDoc>("users")
}
export async function projects(): Promise<Collection<ProjectDoc>> {
  return (await getDb()).collection<ProjectDoc>("projects")
}
export async function sprints(): Promise<Collection<SprintDoc>> {
  return (await getDb()).collection<SprintDoc>("sprints")
}


