import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/firebaseRegion";
import { decrypt } from "@/lib/server/crypto";
import type { Region } from "@/lib/firebase/firebaseRegion";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const region = (searchParams.get("region") || "IN") as Region;

    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    const db = getDb(region);
    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = snap.data();

    // Decrypt PII fields; pass through non-encrypted fields as-is
    const profile = {
      fullName: data.fullName ? decrypt(data.fullName) : data.displayName || "",
      email: data.email ? decrypt(data.email) : "",
      displayName: data.displayName || "",
      currency: data.currency || "USD",
      region: data.region || region,
    };

    return NextResponse.json(profile);
  } catch (err) {
    console.error("user/profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
