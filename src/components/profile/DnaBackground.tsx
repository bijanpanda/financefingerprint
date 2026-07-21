"use client";

export default function DnaBackground() {
  return (
    <div className="dna-scene" aria-hidden="true">
      {/* Left helix — large, slow */}
      <svg viewBox="0 0 120 900" className="dna-helix-left" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M30,0 Q90,45 30,90 Q-30,135 30,180 Q90,225 30,270 Q-30,315 30,360 Q90,405 30,450 Q-30,495 30,540 Q90,585 30,630 Q-30,675 30,720 Q90,765 30,810 Q-30,855 30,900"
          className="helix-stroke-a" fill="none"
        />
        <path
          d="M90,0 Q30,45 90,90 Q150,135 90,180 Q30,225 90,270 Q150,315 90,360 Q30,405 90,450 Q150,495 90,540 Q30,585 90,630 Q150,675 90,720 Q30,765 90,810 Q150,855 90,900"
          className="helix-stroke-b" fill="none"
        />
        {Array.from({ length: 10 }).map((_, i) => {
          const y = i * 90 + 45;
          const even = i % 2 === 0;
          return (
            <g key={i} style={{ animationDelay: `${i * 0.2}s` }} className="base-pair-group">
              <line x1={even ? 40 : 20} y1={y} x2={even ? 80 : 100} y2={y} className="base-pair-line" />
              <circle cx={even ? 40 : 20} cy={y} r="5" className={i % 3 === 0 ? "dot-green" : i % 3 === 1 ? "dot-cyan" : "dot-purple"} />
              <circle cx={even ? 80 : 100} cy={y} r="5" className={i % 3 === 0 ? "dot-purple" : i % 3 === 1 ? "dot-green" : "dot-cyan"} />
            </g>
          );
        })}
      </svg>

      {/* Right helix — large, offset timing */}
      <svg viewBox="0 0 120 900" className="dna-helix-right" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M30,0 Q90,45 30,90 Q-30,135 30,180 Q90,225 30,270 Q-30,315 30,360 Q90,405 30,450 Q-30,495 30,540 Q90,585 30,630 Q-30,675 30,720 Q90,765 30,810 Q-30,855 30,900"
          className="helix-stroke-b" fill="none"
        />
        <path
          d="M90,0 Q30,45 90,90 Q150,135 90,180 Q30,225 90,270 Q150,315 90,360 Q30,405 90,450 Q150,495 90,540 Q30,585 90,630 Q150,675 90,720 Q30,765 90,810 Q150,855 90,900"
          className="helix-stroke-a" fill="none"
        />
        {Array.from({ length: 10 }).map((_, i) => {
          const y = i * 90 + 45;
          const even = i % 2 === 0;
          return (
            <g key={i} style={{ animationDelay: `${i * 0.25 + 0.5}s` }} className="base-pair-group">
              <line x1={even ? 40 : 20} y1={y} x2={even ? 80 : 100} y2={y} className="base-pair-line" />
              <circle cx={even ? 40 : 20} cy={y} r="5" className={i % 3 === 0 ? "dot-cyan" : i % 3 === 1 ? "dot-purple" : "dot-green"} />
              <circle cx={even ? 80 : 100} cy={y} r="5" className={i % 3 === 0 ? "dot-green" : i % 3 === 1 ? "dot-cyan" : "dot-purple"} />
            </g>
          );
        })}
      </svg>

      {/* Floating bubbles / particles */}
      <div className="dna-bubble dna-bubble-1" />
      <div className="dna-bubble dna-bubble-2" />
      <div className="dna-bubble dna-bubble-3" />
      <div className="dna-bubble dna-bubble-4" />
      <div className="dna-bubble dna-bubble-5" />
      <div className="dna-bubble dna-bubble-6" />
      <div className="dna-bubble dna-bubble-7" />
      <div className="dna-bubble dna-bubble-8" />

      {/* Floating icons */}
      <div className="dna-float-icon dna-icon-1">🧬</div>
      <div className="dna-float-icon dna-icon-2">💰</div>
      <div className="dna-float-icon dna-icon-3">📊</div>
      <div className="dna-float-icon dna-icon-4">🔬</div>
      <div className="dna-float-icon dna-icon-5">🧪</div>
    </div>
  );
}
