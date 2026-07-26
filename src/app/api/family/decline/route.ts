import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/server/adminAuth";
import { sendFamilyInviteResponseEmail } from "@/lib/server/email";
import { getInviteToken, getFamilyGroup, markInviteTokenStatus, getUserDoc } from "@/lib/server/familyDb";

export async function POST(req: NextRequest) {
  try {
    const { token } = (await req.json()) as { token: string };
    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    const invite = await getInviteToken(token);
    if (!invite) {
      return NextResponse.json({ error: "This invite link is invalid." }, { status: 404 });
    }
    if (invite.status !== "pending") {
      return NextResponse.json({ error: "This invite has already been used." }, { status: 410 });
    }

    await markInviteTokenStatus(token, "declined");

    try {
      const group = await getFamilyGroup(invite.familyGroupId);
      if (group) {
        const initiatorAuth = await getAdminAuth().getUser(group.initiatorUid);
        if (initiatorAuth.email) {
          const initiatorDoc = await getUserDoc(group.initiatorUid);
          const firstName = (initiatorDoc?.displayName || initiatorAuth.displayName || "there").split(" ")[0];
          await sendFamilyInviteResponseEmail({
            toEmail: initiatorAuth.email,
            inviterFirstName: firstName,
            inviteeEmail: invite.inviteeEmail,
            outcome: "declined",
          });
        }
      }
    } catch (err) {
      console.error("family/decline: failed to notify initiator:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("family/decline error:", err);
    return NextResponse.json({ error: "Failed to decline invite" }, { status: 500 });
  }
}
