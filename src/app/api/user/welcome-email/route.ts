import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/server/email";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, currency } = await req.json() as {
      email: string;
      firstName: string;
      currency: string;
    };

    if (!email || !firstName || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sendWelcomeEmail({ toEmail: email, firstName, currency });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("welcome-email error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
