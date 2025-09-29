import { NextResponse } from "next/server"
import { signOut } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session-token")?.value

    if (token) {
      await signOut(token)
      cookieStore.delete("session-token")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
