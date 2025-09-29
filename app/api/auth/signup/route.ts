import { type NextRequest, NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await sendVerificationEmail(email)

    if (result.success) {
      return NextResponse.json({ success: true, message: "Verification code sent" })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
