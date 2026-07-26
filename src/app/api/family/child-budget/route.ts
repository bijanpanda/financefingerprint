import { NextRequest, NextResponse } from "next/server";
import {
  assertCanEditChild,
  getMemberBudget,
  getMemberTransactions,
  addIncomeItemAdmin,
  updateIncomeItemAdmin,
  deleteIncomeItemAdmin,
  addExpenseItemAdmin,
  updateExpenseItemAdmin,
  deleteExpenseItemAdmin,
  addSavingsItemAdmin,
  updateSavingsItemAdmin,
  deleteSavingsItemAdmin,
  addTransactionAdmin,
  deleteTransactionAdmin,
  getItemName,
  getTransactionInfo,
  writeBudgetAuditEntry,
  FamilyPermissionError,
} from "@/lib/server/familyBudgetDb";
import { sendChildBudgetEditedEmail } from "@/lib/server/email";
import { formatCurrency } from "@/utils/currency";
import { LineItem, ExpenseItem, Transaction } from "@/types";

type Op =
  | "addIncome" | "updateIncome" | "deleteIncome"
  | "addExpense" | "updateExpense" | "deleteExpense"
  | "addSavings" | "updateSavings" | "deleteSavings"
  | "addTransaction" | "deleteTransaction";

const ITEM_KIND: Partial<Record<Op, "income" | "expense" | "savings">> = {
  addIncome: "income", updateIncome: "income", deleteIncome: "income",
  addExpense: "expense", updateExpense: "expense", deleteExpense: "expense",
  addSavings: "savings", updateSavings: "savings", deleteSavings: "savings",
};
const COLLECTION_FOR: Record<"income" | "expense" | "savings", "incomeItems" | "expenseItems" | "savingsItems"> = {
  income: "incomeItems", expense: "expenseItems", savings: "savingsItems",
};

export async function GET(req: NextRequest) {
  try {
    const requesterUid = req.nextUrl.searchParams.get("requesterUid");
    const childUid = req.nextUrl.searchParams.get("childUid");
    const monthId = req.nextUrl.searchParams.get("monthId");
    if (!requesterUid || !childUid || !monthId) {
      return NextResponse.json({ error: "requesterUid, childUid, and monthId are required" }, { status: 400 });
    }

    const { currency } = await assertCanEditChild(requesterUid, childUid);
    const [budget, transactions] = await Promise.all([
      getMemberBudget(childUid, monthId),
      getMemberTransactions(childUid, monthId),
    ]);

    return NextResponse.json({ currency, ...budget, transactions });
  } catch (err) {
    if (err instanceof FamilyPermissionError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("family/child-budget GET error:", err);
    return NextResponse.json({ error: "Failed to load child's budget" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { requesterUid, childUid, monthId, op, payload } = (await req.json()) as {
      requesterUid: string;
      childUid: string;
      monthId: string;
      op: Op;
      payload: Record<string, unknown>;
    };
    if (!requesterUid || !childUid || !monthId || !op) {
      return NextResponse.json({ error: "requesterUid, childUid, monthId, and op are required" }, { status: 400 });
    }

    const { groupId, currency, editorName, childName, childEmail } = await assertCanEditChild(requesterUid, childUid);

    let result: { id: string } | null = null;
    let changeSummary = "";

    if (op === "addTransaction" || op === "deleteTransaction") {
      if (op === "addTransaction") {
        const amount = payload.amount as number;
        const merchantName = payload.merchantName as string;
        result = { id: await addTransactionAdmin(childUid, monthId, payload as unknown as Omit<Transaction, "id" | "createdAt">) };
        changeSummary = `Logged a transaction of ${formatCurrency(amount, currency)} at "${merchantName}"`;
      } else {
        const info = await getTransactionInfo(childUid, monthId, payload.id as string);
        await deleteTransactionAdmin(childUid, monthId, payload.id as string);
        changeSummary = info
          ? `Deleted a transaction of ${formatCurrency(info.amount, currency)} at "${info.merchantName}"`
          : "Deleted a transaction";
      }
    } else {
      const kind = ITEM_KIND[op];
      if (!kind) {
        return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
      }
      const collection = COLLECTION_FOR[kind];
      const isAdd = op.startsWith("add");
      const isUpdate = op.startsWith("update");

      if (isAdd) {
        const name = payload.name as string;
        if (kind === "income") result = { id: await addIncomeItemAdmin(childUid, monthId, payload as unknown as Omit<LineItem, "id">) };
        else if (kind === "expense") result = { id: await addExpenseItemAdmin(childUid, monthId, payload as unknown as Omit<ExpenseItem, "id">) };
        else result = { id: await addSavingsItemAdmin(childUid, monthId, payload as unknown as Omit<LineItem, "id">) };
        changeSummary = `Added ${kind} item "${name}"`;
      } else {
        const id = payload.id as string;
        const name = await getItemName(childUid, monthId, collection, id);
        if (isUpdate) {
          const data = payload.data as Record<string, unknown>;
          if (kind === "income") await updateIncomeItemAdmin(childUid, monthId, id, data as Partial<LineItem>);
          else if (kind === "expense") await updateExpenseItemAdmin(childUid, monthId, id, data as Partial<ExpenseItem>);
          else await updateSavingsItemAdmin(childUid, monthId, id, data as Partial<LineItem>);

          if (typeof data.planned === "number") {
            changeSummary = `Updated planned amount for "${name}" to ${formatCurrency(data.planned as number, currency)}`;
          } else if (typeof data.actual === "number") {
            changeSummary = `Updated actual amount for "${name}"`;
          } else {
            changeSummary = `Updated ${kind} item "${name}"`;
          }
        } else {
          if (kind === "income") await deleteIncomeItemAdmin(childUid, monthId, id);
          else if (kind === "expense") await deleteExpenseItemAdmin(childUid, monthId, id);
          else await deleteSavingsItemAdmin(childUid, monthId, id);
          changeSummary = `Deleted ${kind} item "${name}"`;
        }
      }
    }

    await writeBudgetAuditEntry({
      groupId,
      childUid,
      editedByUid: requesterUid,
      editedByName: editorName,
      monthId,
      changeSummary,
    });

    if (childEmail) {
      const firstName = childName.split(" ")[0];
      sendChildBudgetEditedEmail({ toEmail: childEmail, childFirstName: firstName, editorName, changeSummary }).catch(
        (err) => console.error("child-budget: failed to notify child:", err)
      );
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof FamilyPermissionError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("family/child-budget POST error:", err);
    return NextResponse.json({ error: "Failed to update child's budget" }, { status: 500 });
  }
}
