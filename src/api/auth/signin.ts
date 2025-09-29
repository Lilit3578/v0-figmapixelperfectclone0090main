import type { NextApiRequest, NextApiResponse } from "next"
import { signInWithEmail } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  const result = await signInWithEmail(email)

  if (result.success) {
    res.status(200).json({ success: true, message: "Verification code sent" })
  } else {
    res.status(400).json({ success: false, error: result.error })
  }
}
