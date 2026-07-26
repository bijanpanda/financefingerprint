import { NextRequest, NextResponse } from "next/server";
import {
  getFamilyMembership,
  getFamilyGroup,
  listFamilyMembers,
  listPendingInvites,
} from "@/lib/server/familyDb";

export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get("uid");
    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    const membership = await getFamilyMembership(uid);
    if (!membership) {
      return NextResponse.json({ inGroup: false });
    }

    const group = await getFamilyGroup(membership.familyGroupId);
    if (!group) {
      return NextResponse.json({ inGroup: false });
    }

    const isInitiator = group.initiatorUid === uid;

    if (membership.role === "child") {
      const members = await listFamilyMembers(group.id);
      const initiator = members.find((m) => m.uid === group.initiatorUid);
      return NextResponse.json({
        inGroup: true,
        role: "child",
        isInitiator: false,
        groupId: group.id,
        orphaned: group.orphaned,
        initiatorName: (group.orphaned ? group.orphanedInitiatorName : initiator?.displayName) || "your family",
      });
    }

    const [members, pendingInvites] = await Promise.all([
      listFamilyMembers(group.id),
      listPendingInvites(group.id),
    ]);
    const initiator = members.find((m) => m.uid === group.initiatorUid);

    return NextResponse.json({
      inGroup: true,
      role: "principal",
      isInitiator,
      groupId: group.id,
      currency: group.currency,
      initiatorName: initiator?.displayName || "the organizer",
      members,
      pendingInvites,
    });
  } catch (err) {
    console.error("family/status error:", err);
    return NextResponse.json({ error: "Failed to load family status" }, { status: 500 });
  }
}
