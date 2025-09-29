import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/session"

export async function middleware(req: NextRequest) {
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const session = await getSession({ get: (n) => req.cookies.get(n) as any })
  if (!session && !isAuthPage) return NextResponse.redirect(new URL("/auth", req.url))
  if (session && isAuthPage) return NextResponse.redirect(new URL("/", req.url))
  return NextResponse.next()
}

export const config = { matcher: ["/((?!_next|api|public|favicon.ico|robots.txt).*)"] }


