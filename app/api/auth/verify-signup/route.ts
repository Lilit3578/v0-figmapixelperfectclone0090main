import { type NextRequest, NextResponse } from "next/server"
import { verifyEmailAndCreateUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    const result = await verifyEmailAndCreateUser(email, code)

    if (result.success && result.user) {
      return NextResponse.json({
        success: true,
        user: result.user,
      })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Verify sign up error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
