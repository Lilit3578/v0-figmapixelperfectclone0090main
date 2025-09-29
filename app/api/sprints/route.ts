import { NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { getSession } from "@/lib/session"
import { sprints } from "@/lib/collections"

const Create = z.object({
  projectId: z.string(),
  durationSec: z.number().int().positive(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date(),
  mode: z.enum(["countdown", "stopwatch"]),
  notes: z.string().max(2000).optional(),
})

export async function GET() {
  const session = await getSession(cookies())
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const col = await sprints()
  const docs = await col.find({ userId: session.userId }).sort({ completedAt: -1 }).limit(500).toArray()
  const items = docs.map((d: any) => ({
    id: String(d._id),
    projectId: d.projectId,
    duration: d.durationSec,
    startTime: (d.startedAt ?? new Date()).toISOString(),
    endTime: (d.completedAt ?? new Date()).toISOString(),
    notes: d.notes,
    timerMode: d.mode,
  }))
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const session = await getSession(cookies())
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const input = Create.parse(await req.json())
  const col = await sprints()
  const doc = {
    userId: session.userId,
    projectId: input.projectId,
    durationSec: input.durationSec,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    mode: input.mode,
    notes: input.notes,
  }
  const res = await col.insertOne(doc as any)
  const item = {
    id: String(res.insertedId),
    projectId: doc.projectId,
    duration: doc.durationSec,
    startTime: doc.startedAt.toISOString(),
    endTime: doc.completedAt.toISOString(),
    notes: doc.notes,
    timerMode: doc.mode,
  }
  return NextResponse.json({ item })
}


