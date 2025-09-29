import { NextResponse } from "next/server"
import { randomInt, createHash } from "crypto"
import { getDb } from "@/lib/db"
import { resend, EMAIL_FROM } from "@/lib/resend"
import { z } from "zod"

const SignInSchema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = SignInSchema.parse(body)

    const db = await getDb()
    const code = String(randomInt(100000, 999999))
    const token = createHash("sha256").update(`${email}:${code}`).digest("base64url")
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await db.collection("email_tokens").updateOne(
      { email },
      { $set: { email, token, expiresAt, attempts: 0 } },
      { upsert: true }
    )

    await resend.emails.send({
      from: EMAIL_FROM!,
      to: email,
      subject: "Your Sprint Tracker sign-in code",
      text: `Your code is ${code}`,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
