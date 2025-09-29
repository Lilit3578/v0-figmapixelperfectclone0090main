import { NextResponse } from "next/server"
import { getSessionByToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session-token")?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    const session = await getSessionByToken(token)

    if (session) {
      return NextResponse.json({ user: session.user })
    } else {
      return NextResponse.json({ user: null })
    }
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
