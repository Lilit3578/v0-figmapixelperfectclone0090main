import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSession } from "@/lib/session"
import { getDb } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession(cookies())
    if (!session) return NextResponse.json({ user: null })
    const db = await getDb()
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) })
    return NextResponse.json({ user: user ? { id: String(user._id), email: user.email } : null })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
