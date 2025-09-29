import { getDb } from "@/lib/db"

export async function ensureIndexes() {
  const db = await getDb()
  await db.collection("users").createIndex({ email: 1 }, { unique: true })
  await db.collection("projects").createIndex({ userId: 1, name: 1 }, { unique: true })
  await db.collection("sprints").createIndex({ userId: 1, completedAt: -1 })
  await db.collection("sprints").createIndex({ userId: 1, projectId: 1, completedAt: -1 })
}


