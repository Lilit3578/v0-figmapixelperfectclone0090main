import { NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { getSession } from "@/lib/session"
import { projects } from "@/lib/collections"
import { ObjectId } from "mongodb"

const Create = z.object({ name: z.string().min(1).max(100) })

export async function GET() {
  const session = await getSession(cookies())
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const col = await projects()
  const docs = await col.find({ userId: session.userId, archived: { $ne: true } }).sort({ createdAt: -1 }).toArray()
  const items = docs.map((d) => ({ id: String((d as any)._id), name: (d as any).name, created_at: ((d as any).createdAt ?? new Date()).toISOString(), updated_at: ((d as any).updatedAt ?? (d as any).createdAt ?? new Date()).toISOString() }))
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const session = await getSession(cookies())
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name } = Create.parse(await req.json())
  const col = await projects()
  const now = new Date()
  const res = await col.insertOne({ userId: session.userId, name, createdAt: now } as any)
  const item = { id: String(res.insertedId), name, created_at: now.toISOString(), updated_at: now.toISOString() }
  return NextResponse.json({ item })
}


