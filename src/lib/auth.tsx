import { Resend } from "resend"
import { createUser, getUserByEmail } from "./database"
import { randomBytes, pbkdf2Sync } from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface AuthUser {
  id: string
  email: string
}

export interface AuthSession {
  user: AuthUser
  token: string
  expires: Date
}

// Simple in-memory session store (in production, use Redis or database)
const sessions = new Map<string, AuthSession>()
const verificationCodes = new Map<string, { code: string; expires: Date; email: string }>()

function generateToken(): string {
  return randomBytes(32).toString("hex")
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
}

function generateSalt(): string {
  return randomBytes(16).toString("hex")
}

export async function sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const code = generateVerificationCode()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    verificationCodes.set(email, { code, expires, email })

    await resend.emails.send({
      from: "Sprint Tracker <noreply@sprinttracker.com>",
      to: email,
      subject: "Your Sprint Tracker verification code",
      html: `
        <h2>Welcome to Sprint Tracker!</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, error: "Failed to send verification email" }
  }
}

export async function verifyEmailAndCreateUser(
  email: string,
  code: string,
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const verification = verificationCodes.get(email)

  if (!verification) {
    return { success: false, error: "Verification code not found" }
  }

  if (verification.expires < new Date()) {
    verificationCodes.delete(email)
    return { success: false, error: "Verification code expired" }
  }

  if (verification.code !== code) {
    return { success: false, error: "Invalid verification code" }
  }

  // Check if user already exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    verificationCodes.delete(email)
    return { success: false, error: "User already exists" }
  }

  // Create new user
  const userId = generateToken()
  const user = await createUser({
    id: userId,
    email,
  })

  verificationCodes.delete(email)

  return {
    success: true,
    user: { id: user.id, email: user.email },
  }
}

export async function signInWithEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const user = await getUserByEmail(email)
  if (!user) {
    return { success: false, error: "User not found" }
  }

  return await sendVerificationEmail(email)
}

export async function verifySignIn(
  email: string,
  code: string,
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const verification = verificationCodes.get(email)

  if (!verification) {
    return { success: false, error: "Verification code not found" }
  }

  if (verification.expires < new Date()) {
    verificationCodes.delete(email)
    return { success: false, error: "Verification code expired" }
  }

  if (verification.code !== code) {
    return { success: false, error: "Invalid verification code" }
  }

  const user = await getUserByEmail(email)
  if (!user) {
    return { success: false, error: "User not found" }
  }

  const token = generateToken()
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  const session: AuthSession = {
    user: { id: user.id, email: user.email },
    token,
    expires,
  }

  sessions.set(token, session)
  verificationCodes.delete(email)

  return { success: true, session }
}

export async function getSessionByToken(token: string): Promise<AuthSession | null> {
  const session = sessions.get(token)

  if (!session) {
    return null
  }

  if (session.expires < new Date()) {
    sessions.delete(token)
    return null
  }

  return session
}

export async function signOut(token: string): Promise<{ success: boolean }> {
  sessions.delete(token)
  return { success: true }
}
