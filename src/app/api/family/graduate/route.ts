import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/server/adminAuth";
import { getFamilyMembership, getFamilyGroup, getUserDoc, departMember, deleteGroupIfEmpty } from "@/lib/server/familyDb";
import { sendFamilyGraduationEmail } from "@/lib/server/email";

export async function POST(req: NextRequest) {
  try {
    const { requesterUid } = (await req.json()) as { requesterUid: string };
    if (!requesterUid) {
      return NextResponse.json({ error: "requesterUid is required" }, { status: 400 });
    }

    const membership = await getFamilyMembership(requesterUid);
    if (!membership || membership.role !== "child") {
      return NextResponse.json({ error: "Only a Child can graduate to an independent account." }, { status: 403 });
    }
    const group = await getFamilyGroup(membership.familyGroupId);
    if (!group) {
      return NextResponse.json({ error: "Family group not found." }, { status: 404 });
    }

    await departMember(group.id, requesterUid);
    await deleteGroupIfEmpty(group.id);

    try {
      const auth = await getAdminAuth().getUser(requesterUid);
      const doc = await getUserDoc(requesterUid);
      if (auth.email) {
        const firstName = (doc?.displayName || auth.displayName || "there").split(" ")[0];
        await sendFamilyGraduationEmail({ toEmail: auth.email, firstName });
      }
    } catch (err) {
      console.error("family/graduate: failed to send graduation email:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("family/graduate error:", err);
    return NextResponse.json({ error: "Failed to graduate" }, { status: 500 });
  }
}
