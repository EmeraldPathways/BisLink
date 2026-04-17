import { Resend } from 'resend';

let resendClient: Resend | null | undefined;

export function getResend() {
  if (resendClient !== undefined) return resendClient;
  if (!process.env.RESEND_API_KEY) {
    resendClient = null;
    return resendClient;
  }

  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}
