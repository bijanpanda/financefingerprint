import { NextRequest, NextResponse } from "next/server";
import { listFamilyMembers } from "@/lib/server/familyDb";
import {
  assertPrincipalRole,
  getMemberBudget,
  listRecentAuditEntries,
  FamilyPermissionError,
} from "@/lib/server/familyBudgetDb";

export async function GET(req: NextRequest) {
  try {
    const requesterUid = req.nextUrl.searchParams.get("requesterUid");
    const monthId = req.nextUrl.searchParams.get("monthId");
    if (!requesterUid || !monthId) {
      return NextResponse.json({ error: "requesterUid and monthId are required" }, { status: 400 });
    }

    const { groupId, currency } = await assertPrincipalRole(requesterUid);
    const members = await listFamilyMembers(groupId);
    const confirmed = members.filter((m) => m.inviteStatus === "confirmed");

    const memberBudgets = await Promise.all(
      confirmed.map(async (m) => {
        const budget = await getMemberBudget(m.uid, monthId);
        const recentEdits =
          m.role === "child" ? await listRecentAuditEntries(groupId, m.uid, 5) : [];
        return {
          uid: m.uid,
          displayName: m.displayName,
          role: m.role,
          ...budget,
          recentEdits,
        };
      })
    );

    return NextResponse.json({ currency, members: memberBudgets });
  } catch (err) {
    if (err instanceof FamilyPermissionError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("family/budget-overview error:", err);
    return NextResponse.json({ error: "Failed to load family budget overview" }, { status: 500 });
  }
}
