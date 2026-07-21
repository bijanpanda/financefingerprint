"use client";

import { useState } from "react";
import { Question, AnsweredQuestion } from "@/types/profile";
import ChoiceQuestion from "./ChoiceQuestion";
import ScaleQuestion from "./ScaleQuestion";
import RankingQuestion from "./RankingQuestion";

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: AnsweredQuestion) => void;
}

export default function QuestionCard({ question, questionNumber, totalQuestions, onAnswer }: Props) {
  const isAutoAnswered = question.format === "scale" || question.format === "ranking";
  const defaultScaleValue = question.format === "scale"
    ? Math.ceil(((question.scaleMin || 1) + (question.scaleMax || 10)) / 2)
    : null;
  const defaultScore = question.format === "scale" && defaultScaleValue !== null
    ? Math.round(((defaultScaleValue - (question.scaleMin || 1)) / ((question.scaleMax || 10) - (question.scaleMin || 1))) * 25)
    : question.format === "ranking" ? 25 : 0;

  const [selectedOption, setSelectedOption] = useState<string | null>(
    isAutoAnswered ? (defaultScaleValue !== null ? String(defaultScaleValue) : JSON.stringify(question.rankingItems || [])) : null
  );
  const [score, setScore] = useState<number>(defaultScore);
  const [answered, setAnswered] = useState(isAutoAnswered);

  const handleSelect = (optionId: string, optScore: number) => {
    setSelectedOption(optionId);
    setScore(optScore);
    setAnswered(true);
  };

  const handleScaleChange = (value: number, optScore: number) => {
    setSelectedOption(String(value));
    setScore(optScore);
    setAnswered(true);
  };

  const handleRankingChange = (ranked: string[], optScore: number) => {
    setSelectedOption(JSON.stringify(ranked));
    setScore(optScore);
    setAnswered(true);
  };

  const handleNext = () => {
    if (!answered || selectedOption === null) return;
    onAnswer({
      questionId: question.id,
      dimension: question.dimension,
      questionText: question.text,
      selectedOption,
      score,
    });
  };

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="animate-fadeIn">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span className="font-medium">Question {questionNumber} of {totalQuestions}</span>
          <span className="font-semibold gradient-text">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Dimension badge */}
      <div className="mb-5">
        <span className="text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-slate-800 to-slate-950 text-white px-4 py-1.5 rounded-full shadow-sm">
          {question.dimension.replace(/_/g, " ")}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-2xl font-extrabold text-slate-800 mb-8 leading-snug">
        {question.text}
      </h2>

      {/* Question format renderer */}
      {question.format === "single_choice" && question.options && (
        <ChoiceQuestion
          options={question.options}
          selected={selectedOption}
          onSelect={handleSelect}
        />
      )}

      {question.format === "scale" && (
        <ScaleQuestion
          min={question.scaleMin || 1}
          max={question.scaleMax || 10}
          labels={question.scaleLabels || { min: "Low", max: "High" }}
          value={selectedOption ? parseInt(selectedOption) : null}
          onChange={handleScaleChange}
        />
      )}

      {question.format === "ranking" && question.rankingItems && (
        <RankingQuestion
          items={question.rankingItems}
          ranked={selectedOption ? JSON.parse(selectedOption) : null}
          onChange={handleRankingChange}
        />
      )}

      {/* Next button */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!answered}
          className="gradient-btn text-white px-10 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {questionNumber === totalQuestions ? "Finish" : "Next"}
          <span className="ml-2">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
