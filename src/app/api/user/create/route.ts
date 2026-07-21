import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase/firebaseRegion";
import { encrypt } from "@/lib/server/crypto";
import { sendWelcomeEmail } from "@/lib/server/email";
import type { Region } from "@/lib/firebase/firebaseRegion";

export async function POST(req: NextRequest) {
  try {
    const { uid, region, fullName, email, currency, displayName } = await req.json() as {
      uid: string;
      region: Region;
      fullName: string;
      email: string;
      currency: string;
      displayName: string;
    };

    if (!uid || !email || !region) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb(region);

    // Encrypt PII before writing to Firestore
    await setDoc(doc(db, "users", uid), {
      fullName: encrypt(fullName || displayName),
      email: encrypt(email),
      displayName,          // keep plain for Firebase Auth display
      currency,             // not encrypted — used in queries
      region,               // not encrypted — used for routing
      createdAt: Timestamp.now(),
    });

    // Send welcome email using plain-text values (before they're only available encrypted in Firestore)
    try {
      const firstName = (fullName || displayName || "").split(" ")[0] || "there";
      await sendWelcomeEmail({ toEmail: email, firstName, currency });
    } catch (emailErr) {
      // Email failure must not break registration
      console.error("Welcome email failed:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("user/create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
