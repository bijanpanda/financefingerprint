"use client";

import { useState } from "react";
import { SpendingQuestion, SpendingAnswer } from "@/types/profile";
import ChoiceQuestion from "./ChoiceQuestion";
import ScaleQuestion from "./ScaleQuestion";

interface Props {
  question: SpendingQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: SpendingAnswer) => void;
}

export default function SpendingQuestionCard({ question, questionNumber, totalQuestions, onAnswer }: Props) {
  const isScale = question.format === "scale";
  const defaultScaleValue = isScale
    ? Math.ceil(((question.scaleMin || 1) + (question.scaleMax || 10)) / 2)
    : null;
  const defaultScore = isScale && defaultScaleValue !== null
    ? Math.round(((defaultScaleValue - (question.scaleMin || 1)) / ((question.scaleMax || 10) - (question.scaleMin || 1))) * 25)
    : 0;

  const [selectedOption, setSelectedOption] = useState<string | null>(
    isScale && defaultScaleValue !== null ? String(defaultScaleValue) : null
  );
  const [score, setScore] = useState<number>(defaultScore);
  const [answered, setAnswered] = useState(isScale);

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
          <span className="font-medium">Habit {questionNumber} of {totalQuestions}</span>
          <span className="font-semibold gradient-text">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Dimension badge */}
      <div className="mb-5">
        <span className="text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1.5 rounded-full shadow-sm">
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
