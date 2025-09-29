import type { NextApiRequest, NextApiResponse } from "next"
import { getSessionByToken } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  const session = await getSessionByToken(token)

  if (session) {
    res.status(200).json({ user: session.user })
  } else {
    res.status(401).json({ error: "Invalid or expired token" })
  }
}
