"use client";

import { useState } from "react";
import Link from "next/link";

const COURSES = [
  {
    id: "budgeting-101",
    title: "Budgeting 101",
    description: "Master the fundamentals of planning your money every month.",
    icon: "🎯",
    color: "from-emerald-500 to-teal-600",
    lessons: [
      {
        num: 1,
        title: "Why budgeting matters",
        content: "A budget isn't about restricting yourself — it's about giving yourself permission to spend guilt-free on things that matter. Without a budget, money disappears into small, unmemorable purchases. With one, you make conscious choices. Studies show that people who budget are 2x more likely to reach their financial goals. The first step is simply tracking where your money went last month.",
      },
      {
        num: 2,
        title: "The 50/30/20 rule",
        content: "Split your after-tax income: 50% for Needs (rent, groceries, utilities, insurance, minimum loan payments), 30% for Wants (dining out, entertainment, shopping, subscriptions), and 20% for Savings & Extra Debt Payments. This isn't rigid — if your rent is high, your needs might be 60%. The point is having a framework. Track your spending for one month and see where you land.",
      },
      {
        num: 3,
        title: "Zero-based budgeting",
        content: "In zero-based budgeting, Income - Expenses - Savings = 0. Every unit of money gets assigned a job before the month starts. Savings is treated as an expense — 'pay yourself first.' Our Budget Planner tool uses this exact approach: you set Planned amounts for Income, Expenses, and Savings, and the app alerts you if anything is unallocated.",
      },
      {
        num: 4,
        title: "Tracking expenses daily",
        content: "The gap between your planned budget and actual spending is where financial awareness lives. Log every expense — coffee, auto-rickshaw, online shopping. Use the Monthly Expense Tracker in our Budget Planner to record each transaction with date, amount, and merchant. After one month of tracking, you'll spot patterns you never noticed. That ₹200/day food delivery habit? That's ₹6,000/month.",
      },
    ],
  },
  {
    id: "saving-smart",
    title: "Saving Smart",
    description: "Build your safety net and grow your savings systematically.",
    icon: "🛡️",
    color: "from-blue-500 to-indigo-600",
    lessons: [
      {
        num: 1,
        title: "The emergency fund",
        content: "Before investing, before paying off low-interest debt, build an emergency fund. Target 3-6 months of essential expenses (rent, food, utilities, EMIs). Keep it in a savings account or liquid mutual fund — accessible within 24 hours. Start with ₹10,000 if that's all you can manage. This fund prevents you from going into debt when life surprises you — a medical bill, car repair, or job loss.",
      },
      {
        num: 2,
        title: "Pay yourself first",
        content: "On payday, immediately transfer your savings amount before spending on anything else. Set up an auto-debit to a separate savings account or SIP. If you wait to save 'whatever is left,' there's never anything left. Treat your savings like a mandatory bill — because it is. You're paying your future self.",
      },
      {
        num: 3,
        title: "Cutting expenses without suffering",
        content: "Saving doesn't mean living miserably. Focus on the big three: Housing (consider a roommate or cheaper area), Transportation (public transit vs car), and Food (cook at home 5 days, eat out 2). These three categories typically make up 60-70% of expenses. Cutting ₹100 from 20 small things is harder than cutting ₹2,000 from one big thing.",
      },
    ],
  },
  {
    id: "investing-basics",
    title: "Investing Basics",
    description: "Start growing your wealth with confidence, even with small amounts.",
    icon: "🌱",
    color: "from-purple-500 to-violet-600",
    lessons: [
      {
        num: 1,
        title: "Why invest (not just save)",
        content: "Inflation erodes your savings at 5-7% per year. ₹1 lakh today will have the purchasing power of ₹50,000 in 10 years. A savings account earning 3-4% loses money in real terms. Investing in equity (stocks/mutual funds) has historically returned 12-15% per year in India, beating inflation comfortably. The risk is short-term volatility — but over 7+ years, equity has never given negative returns in India.",
      },
      {
        num: 2,
        title: "SIPs: Your first investment",
        content: "A Systematic Investment Plan (SIP) invests a fixed amount every month into a mutual fund. Start with ₹500-5,000/month in a Nifty 50 index fund. You benefit from rupee-cost averaging — buying more units when markets are low, fewer when high. Over time, this smooths out volatility. Apps like Groww, Zerodha Coin, or Kuvera make it easy to set up in 10 minutes.",
      },
      {
        num: 3,
        title: "The power of compounding",
        content: "₹5,000/month invested at 12% average return: After 10 years = ₹11.6 lakhs (invested ₹6 lakhs). After 20 years = ₹49.9 lakhs (invested ₹12 lakhs). After 30 years = ₹1.76 crore (invested ₹18 lakhs). The magic is time — the last 10 years contribute more than the first 20 combined. Starting at 25 vs 35 can mean the difference between ₹1.76 crore and ₹49.9 lakhs.",
      },
    ],
  },
];

export default function InsightsCourse() {
  const [activeCourse, setActiveCourse] = useState(COURSES[0].id);
  const [activeLesson, setActiveLesson] = useState(1);

  const course = COURSES.find((c) => c.id === activeCourse)!;
  const lesson = course.lessons.find((l) => l.num === activeLesson)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-800">Finance<span className="text-emerald-600">Fingerprint</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Home</Link>
            <span className="text-sm font-medium text-emerald-600">FinPrint Insights</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">FinPrint Insights</h1>
        </div>
        <p className="text-slate-500 text-lg">Structured learning paths to master personal finance, one lesson at a time.</p>
      </div>

      {/* Course Selector */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COURSES.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActiveCourse(c.id); setActiveLesson(1); }}
              className={`glass-card rounded-2xl p-5 text-left transition-all ${
                activeCourse === c.id
                  ? "ring-2 ring-emerald-500 shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{c.icon}</span>
                <h3 className="text-base font-bold text-slate-800">{c.title}</h3>
              </div>
              <p className="text-xs text-slate-500">{c.description}</p>
              <div className="mt-3 flex items-center gap-1.5">
                {c.lessons.map((l) => (
                  <div
                    key={l.num}
                    className={`h-1.5 flex-1 rounded-full ${
                      activeCourse === c.id && l.num <= activeLesson
                        ? "bg-emerald-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">{c.lessons.length} lessons</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex gap-6">
          {/* Lesson Sidebar */}
          <div className="w-[220px] shrink-0">
            <div className="space-y-1">
              {course.lessons.map((l) => (
                <button
                  key={l.num}
                  onClick={() => setActiveLesson(l.num)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${
                    activeLesson === l.num
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-white/70"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    activeLesson === l.num
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-slate-500"
                  }`}>
                    {l.num}
                  </span>
                  <span className="truncate">{l.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lesson Body */}
          <div className="flex-1">
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Lesson {lesson.num} of {course.lessons.length}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 capitalize">{lesson.title}</h2>
              <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-line">{lesson.content}</p>

              {/* Nav buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setActiveLesson(Math.max(1, activeLesson - 1))}
                  disabled={activeLesson === 1}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-slate-600"
                >
                  ← Previous
                </button>
                <span className="text-xs text-slate-400">
                  {course.title} · {activeLesson}/{course.lessons.length}
                </span>
                <button
                  onClick={() => setActiveLesson(Math.min(course.lessons.length, activeLesson + 1))}
                  disabled={activeLesson === course.lessons.length}
                  className="px-4 py-2 text-sm font-medium gradient-btn text-white rounded-xl disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
