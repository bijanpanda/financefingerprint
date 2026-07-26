import { NextRequest, NextResponse } from "next/server";
import { listAllPendingInviteTokens, touchInviteTokenReminder } from "@/lib/server/familyDb";
import { sendFamilyInviteEmail } from "@/lib/server/email";

const REMINDER_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

// Meant to be called by a scheduler (see vercel.json's `crons` entry), not a logged-in user —
// guarded by a shared secret instead of a uid.
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured on the server." }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pending = await listAllPendingInviteTokens();
    const now = Date.now();
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let sent = 0;
    for (const invite of pending) {
      const isStale = !invite.lastReminderSentAt || now - invite.lastReminderSentAt.getTime() > REMINDER_INTERVAL_MS;
      if (!isStale) continue;

      try {
        await sendFamilyInviteEmail({
          toEmail: invite.inviteeEmail,
          inviterName: invite.inviterName,
          role: invite.role,
          inviteUrl: `${origin}/family/invite/${invite.token}`,
          isExistingAccount: !!invite.existingUid,
        });
        await touchInviteTokenReminder(invite.token);
        sent++;
      } catch (err) {
        console.error("send-reminders: failed to remind", invite.inviteeEmail, err);
      }
    }

    return NextResponse.json({ ok: true, checked: pending.length, sent });
  } catch (err) {
    console.error("family/send-reminders error:", err);
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 });
  }
}
