import { NextRequest, NextResponse } from "next/server";
import { getFamilyMembership, getFamilyGroup, departMember, deleteGroupIfEmpty } from "@/lib/server/familyDb";

export async function POST(req: NextRequest) {
  try {
    const { requesterUid } = (await req.json()) as { requesterUid: string };
    if (!requesterUid) {
      return NextResponse.json({ error: "requesterUid is required" }, { status: 400 });
    }

    const membership = await getFamilyMembership(requesterUid);
    if (!membership || membership.role !== "child") {
      return NextResponse.json({ error: "Only a Child awaiting confirmation can use this." }, { status: 403 });
    }
    const group = await getFamilyGroup(membership.familyGroupId);
    if (!group || !group.orphaned) {
      return NextResponse.json({ error: "Your family isn't awaiting this confirmation." }, { status: 400 });
    }

    await departMember(group.id, requesterUid);
    await deleteGroupIfEmpty(group.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("family/orphan-confirm error:", err);
    return NextResponse.json({ error: "Failed to confirm" }, { status: 500 });
  }
}
