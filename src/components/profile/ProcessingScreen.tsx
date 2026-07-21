"use client";

import { useEffect, useState } from "react";

const FACTS = [
  "Did you know? Starting to invest 10 years earlier can double your retirement corpus.",
  "The power of compounding: ₹5,000/month at 12% becomes ₹1.76 crore in 30 years.",
  "72% of Indians don't have adequate health insurance coverage.",
  "A balanced portfolio has historically outperformed pure equity over 20+ year periods.",
  "Emergency funds should cover 3-6 months of essential expenses.",
  "India's mutual fund industry has grown 5x in the last decade.",
  "SIP investors who stayed invested during 2020 crash saw 40%+ recovery within a year.",
];

export default function ProcessingScreen() {
  const [factIndex, setFactIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const factTimer = setInterval(() => {
      setFactIndex((i) => (i + 1) % FACTS.length);
    }, 3000);
    return () => clearInterval(factTimer);
  }, []);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(dotTimer);
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      {/* DNA animation */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-spin-slow" />
        <div className="absolute inset-2 rounded-full border-4 border-teal-300 animate-spin-reverse" />
        <div className="absolute inset-4 rounded-full border-4 border-cyan-200 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3" />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Analysing your Financial DNA{dots}
      </h2>
      <p className="text-gray-500 text-sm mb-10 max-w-md">
        We&apos;re processing your identity, financial profile, and investor persona to create your personalised Financial DNA report.
      </p>

      {/* Rotating fact */}
      <div className="glass-card rounded-2xl p-5 max-w-lg animate-fadeIn" key={factIndex}>
        <div className="flex items-start gap-3">
          <span className="text-amber-500 text-lg mt-0.5">💡</span>
          <p className="text-sm text-gray-600 text-left leading-relaxed">
            {FACTS[factIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
