import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminFirestore } from "@/lib/server/adminAuth";
import { sendWelcomeEmail } from "@/lib/server/email";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const origin = req.headers.get("origin") ||
    (req.url.startsWith("http") ? new URL(req.url).origin : "http://localhost:3000");

  if (!token) {
    return NextResponse.redirect(`${origin}/login?verified=invalid`);
  }

  try {
    const db = getAdminFirestore();
    const docRef = db.collection("emailVerificationTokens").doc(token);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.redirect(`${origin}/login?verified=invalid`);
    }

    const { uid, email, expiresAt } = snap.data() as {
      uid: string;
      email: string;
      expiresAt: Timestamp;
    };

    if (expiresAt.toDate() < new Date()) {
      await docRef.delete();
      return NextResponse.redirect(`${origin}/login?verified=expired`);
    }

    // Mark user as email verified in Firebase Auth
    await getAdminAuth().updateUser(uid, { emailVerified: true });

    // Delete the used token
    await docRef.delete();

    // Send welcome email (fire and forget — don't block the redirect)
    const userRecord = await getAdminAuth().getUser(uid);
    const displayName = userRecord.displayName || email.split("@")[0];
    const firstName = displayName.split(" ")[0];

    // Get currency from Firestore user doc
    const userSnap = await db.collection("users").doc(uid).get();
    const currency = userSnap.exists ? (userSnap.data()?.currency ?? "USD") : "USD";

    sendWelcomeEmail({ toEmail: email, firstName, currency }).catch((err) =>
      console.error("Welcome email failed:", err)
    );

    return NextResponse.redirect(`${origin}/login?verified=true`);
  } catch (err) {
    console.error("verify-email error:", err);
    return NextResponse.redirect(`${origin}/login?verified=error`);
  }
}
