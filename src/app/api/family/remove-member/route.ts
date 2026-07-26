import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/server/adminAuth";
import { getFamilyGroup, getUserDoc, departMember } from "@/lib/server/familyDb";
import { sendFamilyRemovedEmail } from "@/lib/server/email";

export async function POST(req: NextRequest) {
  try {
    const { requesterUid, targetUid, groupId } = (await req.json()) as {
      requesterUid: string;
      targetUid: string;
      groupId: string;
    };
    if (!requesterUid || !targetUid || !groupId) {
      return NextResponse.json({ error: "requesterUid, targetUid, and groupId are required" }, { status: 400 });
    }
    if (requesterUid === targetUid) {
      return NextResponse.json({ error: "Use \"Leave Family\" to remove yourself." }, { status: 400 });
    }

    const group = await getFamilyGroup(groupId);
    if (!group || group.initiatorUid !== requesterUid) {
      return NextResponse.json({ error: "Only the family's organizer can remove members." }, { status: 403 });
    }

    const [initiatorDoc, targetDoc] = await Promise.all([getUserDoc(requesterUid), getUserDoc(targetUid)]);
    const initiatorAuth = await getAdminAuth().getUser(requesterUid);
    const initiatorName = initiatorDoc?.displayName || initiatorAuth.displayName || "the family organizer";

    await departMember(groupId, targetUid);

    try {
      const targetAuth = await getAdminAuth().getUser(targetUid);
      if (targetAuth.email) {
        const firstName = (targetDoc?.displayName || targetAuth.displayName || "there").split(" ")[0];
        await sendFamilyRemovedEmail({ toEmail: targetAuth.email, firstName, initiatorName, reason: "removed" });
      }
    } catch (err) {
      console.error("family/remove-member: failed to notify removed member:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("family/remove-member error:", err);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
