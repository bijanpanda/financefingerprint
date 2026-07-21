"use client";

const STEPS = [
  { key: "identity", label: "Identity", icon: "1" },
  { key: "financial", label: "Financial", icon: "2" },
  { key: "questionnaire", label: "Questionnaire", icon: "3" },
];

interface Props {
  currentStep: string;
}

export default function ProgressStepper({ currentStep }: Props) {
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const isActive = i === stepIndex;
        const isCompleted = i < stepIndex;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? "bg-slate-800 text-white"
                    : isActive
                    ? "bg-gradient-to-r from-slate-800 to-slate-950 text-white shadow-md"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  isActive ? "text-slate-900" : isCompleted ? "text-slate-700" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-1 ${
                  isCompleted ? "bg-slate-800" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
