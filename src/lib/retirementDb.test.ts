import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  addGoal,
  defaultCountryForCurrency,
  deleteGoal,
  getGoals,
  getRetirementPlan,
  saveRetirementPlan,
  updateGoal,
  RetirementPlanDoc,
} from "./retirementDb";

const state = vi.hoisted(() => ({
  planData: undefined as Record<string, unknown> | undefined,
  goalDocs: [] as { id: string; data: Record<string, unknown> }[],
}));

vi.mock("./firebase", () => ({ db: {} }));

vi.mock("firebase/firestore", () => ({
  doc: (...args: unknown[]) => ({ __path: args.slice(1).join("/") }),
  collection: (...args: unknown[]) => ({ __path: args.slice(1).join("/") }),
  getDoc: async (ref: { __path: string }) => ({
    exists: () => state.planData !== undefined,
    data: () => state.planData,
    id: ref.__path,
  }),
  getDocs: async () => ({
    docs: state.goalDocs.map((g) => ({ id: g.id, data: () => g.data })),
  }),
  setDoc: async (_ref: unknown, data: Record<string, unknown>) => {
    state.planData = { ...(state.planData ?? {}), ...data };
  },
  addDoc: async (_ref: unknown, data: Record<string, unknown>) => {
    const id = `goal-${state.goalDocs.length + 1}`;
    state.goalDocs.push({ id, data });
    return { id };
  },
  updateDoc: async (ref: { __path: string }, data: Record<string, unknown>) => {
    const id = ref.__path.split("/").pop();
    const g = state.goalDocs.find((d) => d.id === id);
    if (g) Object.assign(g.data, data);
  },
  deleteDoc: async (ref: { __path: string }) => {
    const id = ref.__path.split("/").pop();
    state.goalDocs = state.goalDocs.filter((d) => d.id !== id);
  },
}));

beforeEach(() => {
  state.planData = undefined;
  state.goalDocs = [];
});

const basePlanFields = {
  currentAge: 40,
  country: "IN",
  baseCurrency: "INR" as const,
  currentBalance: 500000,
  lifeExpectancy: 85,
  retirementAge: 60,
  inflationRate: 0.06,
  returnRatePre: 0.08,
  returnRatePost: 0.065,
  annualSavings: 400000,
  savingsMode: "indexed" as const,
  incomeStreams: [],
  annualLivingExpense: 600000,
  accounts: [],
  livingExpenseSource: "manual" as const,
  livingExpenseDerivedAt: null,
};

describe("getRetirementPlan / saveRetirementPlan", () => {
  it("returns null when no plan doc exists yet", async () => {
    expect(await getRetirementPlan("u1")).toBeNull();
  });

  it("round-trips scalar fields, keeping goals in the subcollection", async () => {
    const plan: RetirementPlanDoc = { ...basePlanFields, goals: [] };
    await saveRetirementPlan("u1", plan);
    await addGoal("u1", {
      label: "Child education",
      amountPerYear: 60000,
      startAge: 48,
      durationYears: 4,
      everyNYears: null,
      category: "child_education",
      inflationRate: null,
    });

    const loaded = await getRetirementPlan("u1");
    expect(loaded?.currentBalance).toBe(500000);
    expect(loaded?.goals).toHaveLength(1);
    expect(loaded?.goals[0].label).toBe("Child education");
  });

  it("saveRetirementPlan never writes goals into the plan doc itself", async () => {
    const plan: RetirementPlanDoc = {
      ...basePlanFields,
      goals: [
        {
          id: "x",
          label: "Should not persist here",
          amountPerYear: 1,
          startAge: 1,
          durationYears: 1,
          everyNYears: null,
          category: "custom",
          inflationRate: 0,
        },
      ],
    };
    await saveRetirementPlan("u1", plan);
    expect(state.planData).not.toHaveProperty("goals");
  });
});

describe("goal CRUD", () => {
  it("adds, updates, and deletes a goal", async () => {
    const ref = await addGoal("u1", {
      label: "Vehicle",
      amountPerYear: 500000,
      startAge: 50,
      durationYears: 1,
      everyNYears: 7,
      category: "vehicle_purchase",
      inflationRate: null,
    });
    let goals = await getGoals("u1");
    expect(goals).toHaveLength(1);

    await updateGoal("u1", ref.id, { amountPerYear: 600000 });
    goals = await getGoals("u1");
    expect(goals[0].amountPerYear).toBe(600000);

    await deleteGoal("u1", ref.id);
    goals = await getGoals("u1");
    expect(goals).toHaveLength(0);
  });
});

describe("defaultCountryForCurrency", () => {
  it("guesses a plausible country for each supported currency", () => {
    expect(defaultCountryForCurrency("INR")).toBe("IN");
    expect(defaultCountryForCurrency("USD")).toBe("US");
    expect(defaultCountryForCurrency("AED")).toBe("AE");
  });
});
