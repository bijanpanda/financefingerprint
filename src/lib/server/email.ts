// server-only — do NOT import in client components
import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { WelcomeEmail } from "../../../emails/WelcomeEmail";

export async function sendWelcomeEmail({
  toEmail,
  firstName,
  currency,
}: {
  toEmail: string;
  firstName: string;
  currency: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const html = await render(WelcomeEmail({ firstName, currency }));
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "welcome@vestrofin.com",
    to: toEmail,
    subject: `Welcome to Vestrofin, ${firstName}!`,
    html,
  });
  if (error) throw new Error(`Resend rejected welcome email: ${error.message}`);
}
