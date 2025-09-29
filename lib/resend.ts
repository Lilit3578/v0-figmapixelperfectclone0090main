import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing env: RESEND_API_KEY')
}
if (!process.env.EMAIL_FROM) {
  throw new Error('Missing env: EMAIL_FROM')
}

export const resend = new Resend(process.env.RESEND_API_KEY)
export const EMAIL_FROM = process.env.EMAIL_FROM


