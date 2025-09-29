import { type NextRequest, NextResponse } from "next/server"
import { verifySignIn } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    const result = await verifySignIn(email, code)

    if (result.success && result.session) {
      // Set session cookie
      const cookieStore = await cookies()
      cookieStore.set("session-token", result.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: result.session.expires,
      })

      return NextResponse.json({
        success: true,
        user: result.session.user,
      })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Verify sign in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
