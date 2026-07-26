import { NextRequest, NextResponse } from "next/server";
import { getInviteToken } from "@/lib/server/familyDb";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInviteToken(token);

  if (!invite) {
    return NextResponse.json({ error: "invalid" }, { status: 404 });
  }
  if (invite.status !== "pending") {
    return NextResponse.json({ error: "used", status: invite.status }, { status: 410 });
  }

  return NextResponse.json({
    inviterName: invite.inviterName,
    inviteeEmail: invite.inviteeEmail,
    role: invite.role,
    isExistingAccount: !!invite.existingUid,
  });
}
