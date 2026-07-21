import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/server/adminAuth";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { VerificationEmail } from "../../../../../emails/VerificationEmail";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, firstName } = await req.json();
    if (!uid || !email) {
      return NextResponse.json({ error: "uid and email are required" }, { status: 400 });
    }

    const db = getAdminFirestore();

    // Delete any existing tokens for this uid (clean up)
    const existing = await db
      .collection("emailVerificationTokens")
      .where("uid", "==", uid)
      .get();
    const batch = db.batch();
    existing.docs.forEach((d: FirebaseFirestore.QueryDocumentSnapshot) => batch.delete(d.ref));
    await batch.commit();

    // Generate a new secure token
    const token = randomBytes(32).toString("hex");
    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    );

    await db.collection("emailVerificationTokens").doc(token).set({
      uid,
      email,
      expiresAt,
    });

    // Build verification URL
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${origin}/api/auth/verify-email?token=${token}`;

    // Send via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY not set");
    const resend = new Resend(apiKey);
    const name = firstName || email.split("@")[0];
    const html = await render(VerificationEmail({ firstName: name, verificationUrl }));

    const { error: sendError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Verify your email for Vestrofin Account Activation",
      html,
    });
    if (sendError) {
      console.error("send-verification: Resend rejected the email:", sendError);
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-verification error:", err);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
