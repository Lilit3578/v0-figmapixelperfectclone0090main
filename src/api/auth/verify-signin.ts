import type { NextApiRequest, NextApiResponse } from "next"
import { verifySignIn } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" })
  }

  const result = await verifySignIn(email, code)

  if (result.success) {
    res.status(200).json({
      success: true,
      user: result.session?.user,
      token: result.session?.token,
      message: "Signed in successfully",
    })
  } else {
    res.status(400).json({ success: false, error: result.error })
  }
}
