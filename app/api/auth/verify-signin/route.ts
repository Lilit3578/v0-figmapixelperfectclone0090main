import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { z } from "zod"
import { createHash } from "crypto"
import { createSessionCookie } from "@/lib/session"

const VerifySchema = z.object({ email: z.string().email(), code: z.string().regex(/^\d{6}$/) })

export async function POST(request: Request) {
  try {
    const { email, code } = VerifySchema.parse(await request.json())
    const db = await getDb()
    const rec = await db.collection("email_tokens").findOne({ email })
    if (!rec || rec.expiresAt < new Date()) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })

    const token = createHash("sha256").update(`${email}:${code}`).digest("base64url")
    if (token !== rec.token) return NextResponse.json({ error: "Invalid code" }, { status: 400 })

    const user = await db.collection("users").findOneAndUpdate(
      { email },
      { $setOnInsert: { email, createdAt: new Date() }, $set: { lastLoginAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    )

    await db.collection("email_tokens").deleteOne({ email })

    const cookie = await createSessionCookie({ userId: String(user.value!._id) })
    cookies().set(cookie.name, cookie.value, cookie.options)

    return NextResponse.json({ ok: true, user: { id: String(user.value!._id), email } })
  } catch (error) {
    console.error("Verify sign in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
