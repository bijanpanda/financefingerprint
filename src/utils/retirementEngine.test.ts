import { describe, expect, it } from "vitest";
import { project, solveFor, solveForBareSurvival, stressOnePointLower } from "./retirementEngine";
import { Goal, IncomeStream, RetirementPlan } from "@/types/retirement";

// The golden plan — Retirement_system_design_baseline.pdf §7, page 10.
// Age 40, 500,000 balance, retire 60, live to 85, 6% inflation, 8%→6.5% return,
// 400,000/yr indexed savings, 600,000/yr living, one education goal (48–51,
// category rate 10%), one rental income stream (180,000/yr, indexed, from 60).
const educationGoal: Goal = {
  id: "edu",
  label: "Child education",
  amountPerYear: 60000,
  startAge: 48,
  durationYears: 4,
  everyNYears: null,
  category: "child_education",
  inflationRate: null,
};

const rentStream: IncomeStream = {
  id: "rent",
  label: "Rental income",
  kind: "rent",
  amountPerYear: 180000,
  startAge: 60,
  endAge: null,
  growth: "inflation",
};

const goldenPlan: RetirementPlan = {
  currentAge: 40,
  country: "IN",
  baseCurrency: "INR",
  currentBalance: 500000,
  lifeExpectancy: 85,
  retirementAge: 60,
  inflationRate: 0.06,
  returnRatePre: 0.08,
  returnRatePost: 0.065,
  annualSavings: 400000,
  savingsMode: "indexed",
  incomeStreams: [rentStream],
  annualLivingExpense: 600000,
  goals: [educationGoal],
};

// §7's 46-row ledger, ages 40–85: [age, beginBalance, in, expense, endToday, endNominal]
const GOLDEN_LEDGER: [number, number, number, number, number, number][] = [
  [40, 500000, 400000, 0, 972000, 972000],
  [41, 972000, 424000, 0, 1422340, 1507680],
  [42, 1507680, 449440, 0, 1881176, 2113690],
  [43, 2113690, 476406, 0, 2348670, 2797304],
  [44, 2797304, 504991, 0, 2824985, 3566478],
  [45, 3566478, 535290, 0, 3310286, 4429910],
  [46, 4429910, 567408, 0, 3804744, 5397103],
  [47, 5397103, 601452, 0, 4308532, 6478439],
  [48, 6478439, 637539, 128615, 4734675, 7546352],
  [49, 7546352, 675792, 141477, 5165569, 8727120],
  [50, 8727120, 716339, 155625, 5601181, 10030862],
  [51, 10030862, 759319, 171187, 6041470, 11468514],
  [52, 11468514, 804879, 0, 6587460, 13255263],
  [53, 13255263, 853171, 0, 7143752, 15237110],
  [54, 15237110, 904362, 0, 7710539, 17432789],
  [55, 17432789, 958623, 0, 8288021, 19862725],
  [56, 19862725, 1016141, 0, 8876399, 22549175],
  [57, 22549175, 1077109, 0, 9475878, 25516387],
  [58, 25516387, 1141736, 0, 10086668, 28790772],
  [59, 28790772, 1210240, 0, 10708983, 32401093],
  [60, 32401093, 577284, 1924281, 10312197, 33072612],
  [61, 33072612, 611921, 2039738, 9913539, 33701707],
  [62, 33701707, 648637, 2162122, 9513001, 34280456],
  [63, 34280456, 687555, 2291850, 9110574, 34800112],
  [64, 34800112, 728808, 2429361, 8706248, 35251031],
  [65, 35251031, 772537, 2575122, 8300016, 35622594],
  [66, 35622594, 818889, 2729630, 7891867, 35903123],
  [67, 35903123, 868022, 2893408, 7481792, 36079791],
  [68, 36079791, 920104, 3067012, 7069784, 36138520],
  [69, 36138520, 975310, 3251033, 6655832, 36063879],
  [70, 36063879, 1033828, 3446095, 6239927, 35838967],
  [71, 35838967, 1095858, 3652860, 5822061, 35445293],
  [72, 35445293, 1161610, 3872032, 5402223, 34862637],
  [73, 34862637, 1231306, 4104354, 4980406, 34068913],
  [74, 34068913, 1305185, 4350615, 4556598, 33040008],
  [75, 33040008, 1383496, 4611652, 4130792, 31749622],
  [76, 31749622, 1466505, 4888351, 3702976, 30169082],
  [77, 30169082, 1554496, 5181652, 3273143, 28267151],
  [78, 28267151, 1647765, 5492551, 2841283, 26009818],
  [79, 26009818, 1746631, 5822104, 2407385, 23360078],
  [80, 23360078, 1851429, 6171431, 1971440, 20277681],
  [81, 20277681, 1962515, 6541717, 1533440, 16718880],
  [82, 16718880, 2080266, 6934220, 1093373, 12636147],
  [83, 12636147, 2205082, 7350273, 651230, 7977868],
  [84, 7977868, 2337387, 7791289, 207002, 2688024],
  [85, 2688024, 2477630, 8258766, -239321, -3294165],
];

describe("project — golden ledger (PDF §7)", () => {
  const result = project(goldenPlan);

  it("produces 46 rows, ages 40 through 85", () => {
    expect(result.rows).toHaveLength(46);
    expect(result.rows[0].age).toBe(40);
    expect(result.rows[result.rows.length - 1].age).toBe(85);
  });

  it("matches every row of the golden ledger to within ±1 unit", () => {
    GOLDEN_LEDGER.forEach(([age, beginBalance, inflow, expense, endToday, endNominal], i) => {
      const row = result.rows[i];
      expect(row.age).toBe(age);
      expect(row.beginBalance).toBeCloseTo(beginBalance, 0);
      expect(row.in).toBeCloseTo(inflow, 0);
      expect(row.expense).toBeCloseTo(expense, 0);
      expect(row.endToday).toBeCloseTo(endToday, 0);
      expect(row.endNominal).toBeCloseTo(endNominal, 0);
    });
  });

  it("labels the education goal years 'Edu' and the retirement years 'Living'", () => {
    expect(result.rows[8].expenseFor).toBe("Edu"); // age 48
    expect(result.rows[11].expenseFor).toBe("Edu"); // age 51
    expect(result.rows[7].expenseFor).toBeNull(); // age 47, no expense yet
    expect(result.rows[20].expenseFor).toBe("Living"); // age 60
  });

  it("age 48 — education goal at its 10% category rate", () => {
    expect(result.rows[8].expense).toBeCloseTo(128615, 0);
  });

  it("the same goal forced to the 6% country rate must differ", () => {
    const countryRatePlan: RetirementPlan = {
      ...goldenPlan,
      goals: [{ ...educationGoal, inflationRate: 0.06 }],
    };
    const countryResult = project(countryRatePlan);
    expect(countryResult.rows[8].expense).toBeCloseTo(95631, 0);
  });

  it("education goal's four-year nominal total is 596,904 — not the PDF's misprinted 597,145", () => {
    const total = [8, 9, 10, 11].reduce((sum, i) => sum + result.rows[i].expense, 0);
    expect(total).toBeCloseTo(596904, 0);
  });

  it("age 59 — last working year at 8% return", () => {
    expect(result.rows[19].endNominal).toBeCloseTo(32401093, 0);
  });

  it("age 60 — first retirement year at 6.5% return, rent in, living out", () => {
    const row = result.rows[20];
    expect(row.in).toBeCloseTo(577284, 0);
    expect(row.expense).toBeCloseTo(1924281, 0);
    expect(row.endNominal).toBeCloseTo(33072612, 0);
  });

  it("age 85 — the plan runs out with nothing behind it", () => {
    const last = result.rows[result.rows.length - 1];
    expect(last.endToday).toBeCloseTo(-239321, 0);
    expect(last.endNominal).toBeCloseTo(-3294165, 0);
  });

  it("the two-year buffer required at 85 is 16,517,533", () => {
    expect(result.buffer).toBeCloseTo(16517533, -1);
  });

  it("fails the verdict — reached 85, no buffer, actually negative", () => {
    expect(result.passes).toBe(false);
    expect(result.depletionAge).toBe(85);
  });
});

describe("project — flat vs indexed savings", () => {
  it("the same plan with flat savings depletes at age 75", () => {
    const flatPlan: RetirementPlan = { ...goldenPlan, savingsMode: "flat" };
    const result = project(flatPlan);
    expect(result.depletionAge).toBe(75);
    expect(result.rows[result.rows.length - 1].age).toBe(75);
  });
});

describe("solveFor — each lever clears the two-year buffer", () => {
  it("savings, indexed", () => {
    expect(solveFor(goldenPlan, "savings")).toBeCloseTo(450000, 0);
  });

  it("savings, flat", () => {
    const flatPlan: RetirementPlan = { ...goldenPlan, savingsMode: "flat" };
    expect(solveFor(flatPlan, "savings")).toBeCloseTo(715000, 0);
  });

  it("returnPre", () => {
    expect(solveFor(goldenPlan, "returnPre")).toBeCloseTo(0.0905, 3);
  });

  it("retirementAge", () => {
    expect(solveFor(goldenPlan, "retirementAge")).toBe(62);
  });

  it("livingExpense", () => {
    expect(solveFor(goldenPlan, "livingExpense")).toBeCloseTo(550000, 0);
  });

  it("income", () => {
    expect(solveFor(goldenPlan, "income")).toBeCloseTo(230000, 0);
  });
});

describe("solveForBareSurvival — zero floor, not the two-year buffer", () => {
  it("savings for bare survival is lower than the buffer-clearing amount", () => {
    const bare = solveForBareSurvival(goldenPlan, "savings");
    const buffered = solveFor(goldenPlan, "savings");
    expect(bare).toBeCloseTo(410000, 0);
    expect(bare!).toBeLessThan(buffered!);
  });
});

describe("stressOnePointLower", () => {
  it("reports an earlier failure age when returns run a point lower", () => {
    const passingPlan: RetirementPlan = { ...goldenPlan, annualSavings: 450000 };
    const stressedDepletionAge = stressOnePointLower(passingPlan);
    expect(stressedDepletionAge).not.toBeNull();
    expect(stressedDepletionAge!).toBeLessThanOrEqual(85);
  });
});

describe("income streams — flat growth never compounds", () => {
  it("a flat stream is worth the same nominal amount at 80 as at 60", () => {
    const plan: RetirementPlan = {
      currentAge: 60,
      country: "US",
      baseCurrency: "USD",
      currentBalance: 100000000,
      lifeExpectancy: 80,
      retirementAge: 60,
      inflationRate: 0.05,
      returnRatePre: 0.05,
      returnRatePost: 0.05,
      annualSavings: 0,
      savingsMode: "flat",
      incomeStreams: [
        { id: "ann", label: "Annuity", kind: "annuity", amountPerYear: 120000, startAge: 60, endAge: null, growth: "flat" },
      ],
      annualLivingExpense: 0,
      goals: [],
    };
    const result = project(plan);
    const at60 = result.rows.find((r) => r.age === 60)!;
    const at80 = result.rows.find((r) => r.age === 80)!;
    expect(at60.in).toBeCloseTo(120000, 0);
    expect(at80.in).toBeCloseTo(at60.in, 0);
  });
});

describe("goals — a loan payoff inflates at 0% and disappears when it ends", () => {
  it("charges a flat EMI through age 55, then nothing from 56", () => {
    const plan: RetirementPlan = {
      currentAge: 50,
      country: "US",
      baseCurrency: "USD",
      currentBalance: 100000000,
      lifeExpectancy: 58,
      retirementAge: 65,
      inflationRate: 0.06,
      returnRatePre: 0.05,
      returnRatePost: 0.05,
      annualSavings: 0,
      savingsMode: "flat",
      incomeStreams: [],
      annualLivingExpense: 0,
      goals: [
        {
          id: "loan",
          label: "Home loan EMI",
          amountPerYear: 100000,
          startAge: 50,
          durationYears: 6,
          everyNYears: null,
          category: "loan_payoff",
          inflationRate: null,
        },
      ],
    };
    const result = project(plan);
    for (let age = 50; age <= 55; age++) {
      const row = result.rows.find((r) => r.age === age)!;
      expect(row.expense).toBeCloseTo(100000, 0);
      expect(row.expenseFor).toBe("Loan");
    }
    const at56 = result.rows.find((r) => r.age === 56)!;
    expect(at56.expense).toBe(0);
    expect(at56.expenseFor).toBeNull();
  });
});
