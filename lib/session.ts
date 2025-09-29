import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!)
const NAME = "st_session"

if (!process.env.SESSION_SECRET) {
  throw new Error('Missing env: SESSION_SECRET')
}

export async function createSessionCookie(payload: { userId: string }) {
  const value = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret)

  return {
    name: NAME,
    value,
    options: { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 24 * 3600 } as const,
  }
}

export async function getSession(reqCookies: { get: (name: string) => { value: string } | undefined }) {
  const token = reqCookies.get(NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string }
  } catch {
    return null
  }
}

export function clearSessionCookie() {
  return { name: NAME, value: "", options: { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 } as const }
}


