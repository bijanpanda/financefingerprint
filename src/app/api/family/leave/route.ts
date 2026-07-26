import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/server/adminAuth";
import {
  getFamilyMembership,
  getFamilyGroup,
  listFamilyMembers,
  departMember,
  promoteToInitiator,
  markGroupOrphaned,
  deleteGroupIfEmpty,
  getUserDoc,
} from "@/lib/server/familyDb";
import {
  sendFamilyRemovedEmail,
  sendFamilyOwnershipTransferEmail,
  sendFamilyOrphanedEmail,
  sendFamilyMemberLeftEmail,
} from "@/lib/server/email";

export async function POST(req: NextRequest) {
  try {
    const { requesterUid } = (await req.json()) as { requesterUid: string };
    if (!requesterUid) {
      return NextResponse.json({ error: "requesterUid is required" }, { status: 400 });
    }

    const membership = await getFamilyMembership(requesterUid);
    if (!membership) {
      return NextResponse.json({ error: "You're not part of a family group." }, { status: 404 });
    }
    const group = await getFamilyGroup(membership.familyGroupId);
    if (!group) {
      return NextResponse.json({ error: "Family group not found." }, { status: 404 });
    }

    const requesterAuth = await getAdminAuth().getUser(requesterUid);
    const requesterDoc = await getUserDoc(requesterUid);
    const requesterName = requesterDoc?.displayName || requesterAuth.displayName || "A family member";
    const requesterFirstName = requesterName.split(" ")[0];

    if (membership.role === "child") {
      await departMember(group.id, requesterUid);
      await deleteGroupIfEmpty(group.id);
      if (requesterAuth.email) {
        sendFamilyRemovedEmail({
          toEmail: requesterAuth.email,
          firstName: requesterFirstName,
          initiatorName: "your family",
          reason: "left",
        }).catch((err) => console.error("family/leave: failed to notify leaver:", err));
      }
      return NextResponse.json({ ok: true });
    }

    // Principal
    const isInitiator = group.initiatorUid === requesterUid;

    if (!isInitiator) {
      await departMember(group.id, requesterUid);
      try {
        const initiatorAuth = await getAdminAuth().getUser(group.initiatorUid);
        if (initiatorAuth.email) {
          const initiatorDoc = await getUserDoc(group.initiatorUid);
          const initiatorFirstName = (initiatorDoc?.displayName || initiatorAuth.displayName || "there").split(" ")[0];
          await sendFamilyMemberLeftEmail({ toEmail: initiatorAuth.email, initiatorFirstName, memberName: requesterName });
        }
      } catch (err) {
        console.error("family/leave: failed to notify initiator:", err);
      }
      return NextResponse.json({ ok: true });
    }

    // Initiator is leaving — find a successor Principal among the other confirmed members
    const members = await listFamilyMembers(group.id);
    const confirmed = members.filter((m) => m.inviteStatus === "confirmed" && m.uid !== requesterUid);
    const otherPrincipals = confirmed.filter((m) => m.role === "principal");
    const otherChildren = confirmed.filter((m) => m.role === "child");

    if (otherPrincipals.length > 0) {
      const successor = otherPrincipals[0];
      await promoteToInitiator(group.id, successor.uid);
      await departMember(group.id, requesterUid);

      try {
        const successorAuth = await getAdminAuth().getUser(successor.uid);
        if (successorAuth.email) {
          await sendFamilyOwnershipTransferEmail({
            toEmail: successorAuth.email,
            firstName: successor.displayName.split(" ")[0],
            previousInitiatorName: requesterName,
          });
        }
      } catch (err) {
        console.error("family/leave: failed to notify new initiator:", err);
      }
      if (requesterAuth.email) {
        sendFamilyRemovedEmail({
          toEmail: requesterAuth.email,
          firstName: requesterFirstName,
          initiatorName: successor.displayName,
          reason: "left",
        }).catch((err) => console.error("family/leave: failed to notify leaver:", err));
      }
      return NextResponse.json({ ok: true, transferredTo: successor.uid });
    }

    if (otherChildren.length > 0) {
      await markGroupOrphaned(group.id, true, requesterName);
      await departMember(group.id, requesterUid);

      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      for (const child of otherChildren) {
        try {
          const childAuth = await getAdminAuth().getUser(child.uid);
          if (childAuth.email) {
            await sendFamilyOrphanedEmail({
              toEmail: childAuth.email,
              firstName: child.displayName.split(" ")[0],
              initiatorName: requesterName,
              familyUrl: `${origin}/family`,
            });
          }
        } catch (err) {
          console.error("family/leave: failed to notify orphaned child:", child.uid, err);
        }
      }
      if (requesterAuth.email) {
        sendFamilyRemovedEmail({
          toEmail: requesterAuth.email,
          firstName: requesterFirstName,
          initiatorName: "your family",
          reason: "left",
        }).catch((err) => console.error("family/leave: failed to notify leaver:", err));
      }
      return NextResponse.json({ ok: true, orphaned: true });
    }

    // No one else left at all — dissolve the group
    await departMember(group.id, requesterUid);
    await deleteGroupIfEmpty(group.id);
    if (requesterAuth.email) {
      sendFamilyRemovedEmail({
        toEmail: requesterAuth.email,
        firstName: requesterFirstName,
        initiatorName: "your family",
        reason: "left",
      }).catch((err) => console.error("family/leave: failed to notify leaver:", err));
    }
    return NextResponse.json({ ok: true, dissolved: true });
  } catch (err) {
    console.error("family/leave error:", err);
    return NextResponse.json({ error: "Failed to leave family" }, { status: 500 });
  }
}
