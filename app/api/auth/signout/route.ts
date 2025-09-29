import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { clearSessionCookie } from "@/lib/session"

export async function POST() {
  try {
    const cookie = clearSessionCookie()
    cookies().set(cookie.name, cookie.value, cookie.options)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
