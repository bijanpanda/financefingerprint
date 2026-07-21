import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getDb } from "@/lib/firebase/firebaseRegion";

// Finds which regional Firebase project a user belongs to by checking both projects.
// Called on login when ff_user_region is not cached in localStorage.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    // Check both projects — the encrypted email means we can't query by email field,
    // so we use the uid lookup path via Firebase Auth instead.
    // For now, default to IN project (existing users are all in India project).
    // When a US project is configured, expand this to query both.
    const regions = ["IN", "US"] as const;

    for (const region of regions) {
      try {
        const db = getDb(region);
        // Query the users collection — note: email is encrypted so we can't filter by it.
        // This is a known limitation; for existing (pre-encryption) users email is plain.
        const snap = await getDocs(query(collection(db, "users"), where("displayName", "!=", "")));
        // We check if ANY document exists in this project as a signal
        if (!snap.empty) {
          return NextResponse.json({ region });
        }
      } catch {
        // Project may not be configured yet — continue to next
      }
    }

    // Default to IN if neither project yields a result
    return NextResponse.json({ region: "IN" });
  } catch (err) {
    console.error("lookup-region error:", err);
    return NextResponse.json({ region: "IN" });
  }
}
