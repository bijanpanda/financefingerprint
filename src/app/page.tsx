"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800">Finance<span className="text-emerald-600">Fingerprint</span><span className="text-slate-400 text-sm">.ai</span></span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
            <a href="#tools" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">Tools</a>
            <a href="#about" className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">About</a>
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors">
                  Budget Dashboard
                </Link>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {initials}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{displayName}</span>
                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-slate-800">{displayName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors" onClick={() => setMenuOpen(false)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Budget Dashboard
                      </Link>
                      <button
                        onClick={() => { signOut(); setMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="px-5 py-2 gradient-btn text-white rounded-xl text-sm font-medium shadow-sm">
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Now in Beta — Free to use
            </div>
            <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
              Your finances,<br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                perfectly planned.
              </span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
              FinanceFingerprint.ai gives you intelligent tools to budget smarter, track every expense,
              and build wealth — all in one beautiful dashboard. Your financial fingerprint, perfected.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="px-8 py-3 gradient-btn text-white rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                {user ? "Open Dashboard" : "Start Free Today"}
              </Link>
              <a
                href="#tools"
                className="px-8 py-3 border-2 border-emerald-200 text-emerald-700 rounded-xl text-base font-semibold hover:bg-emerald-50 transition-colors"
              >
                Explore Tools
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-16">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">100%</div>
            <div className="text-xs text-slate-500">Free to Use</div>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">7+</div>
            <div className="text-xs text-slate-500">Expense Categories</div>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">Real-time</div>
            <div className="text-xs text-slate-500">Budget Tracking</div>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">Secure</div>
            <div className="text-xs text-slate-500">Google & Email Auth</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Why FinanceFingerprint?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Smart features designed to make personal finance effortless</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Zero-Based Budgeting</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Allocate every unit of income to expenses or savings. Get instant alerts when your budget is unbalanced.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Visual Analytics</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Interactive pie charts show exactly where your money goes — both planned and actual expense breakdowns.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Expense Tracking</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Log every transaction with date, merchant, and category. See planned vs actual spending at a glance.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Multi-Currency</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Support for INR, USD, EUR, GBP, AUD, CAD, SGD, and AED. Choose your currency at signup.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Secure & Private</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Firebase authentication with Google Sign-In. Your data is encrypted and stored securely in the cloud.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Monthly Planning</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Navigate between months, plan ahead, and review past budgets. Each month gets its own clean slate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 px-6 bg-gradient-to-b from-slate-50 to-emerald-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Finance Tools</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Powerful tools to manage every aspect of your financial life</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Budget App — Active */}
            <Link href={user ? "/dashboard" : "/signup"} className="group">
              <div className="glass-card rounded-2xl p-6 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Live</div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Budget Planner</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  Plan your monthly income, expenses across 7 categories, and savings. Track actuals vs planned with visual analytics.
                </p>
                <span className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                  Open Budget Planner →
                </span>
              </div>
            </Link>

            {/* Investment Tracker — Coming Soon */}
            <div className="glass-card rounded-2xl p-6 opacity-75 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-full uppercase">Coming Soon</div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Investment Tracker</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Track your stocks, mutual funds, and SIPs. Get portfolio analytics and performance insights.
              </p>
              <span className="text-sm font-medium text-slate-400">Coming Soon</span>
            </div>

            {/* Net Worth Calculator — Coming Soon */}
            <div className="glass-card rounded-2xl p-6 opacity-75 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-full uppercase">Coming Soon</div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Net Worth Calculator</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Track assets, liabilities, and net worth over time. Visualize your wealth-building journey.
              </p>
              <span className="text-sm font-medium text-slate-400">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">About FinanceFingerprint</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            FinanceFingerprint.ai is built on a simple belief: everyone deserves clarity over their money.
            We&apos;re creating a suite of intelligent, beautiful tools that make personal finance management
            not just easy, but enjoyable. No spreadsheets, no complexity — just clear financial planning.
          </p>
          <p className="text-slate-500 text-sm">
            Built with Next.js, Firebase, and a passion for clean design.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 gradient-header">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to take control?</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Start planning your budget today. It&apos;s free, secure, and takes 30 seconds to sign up.
          </p>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="inline-block px-10 py-3.5 bg-white text-emerald-700 rounded-xl text-base font-bold shadow-lg hover:shadow-xl hover:bg-emerald-50 transition-all"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-400">FinanceFingerprint.ai</span>
          </div>
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} FinanceFingerprint. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
