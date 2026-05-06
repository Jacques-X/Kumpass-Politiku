"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LikertValue } from "@/types/compass";
import { QUESTIONS } from "@/data/questions";
import { computeResult } from "@/lib/engine";
import type { UserResult } from "@/types/compass";

const LIKERT: { value: LikertValue; label: string }[] = [
  { value: -2, label: "Ma naqbilx bis-sħiħ" },
  { value: -1, label: "Ma naqbilx" },
  { value: 0, label: "Newtrali" },
  { value: 1, label: "Naqbel" },
  { value: 2, label: "Naqbel bis-sħiħ" },
];

const AXIS_COLOR: Record<string, string> = {
  territorial: "#4a7c59",
  cultural: "#c0392b",
  transactional: "#d4a017",
  global: "#2c3e7a",
};

const AXIS_LABEL: Record<string, string> = {
  territorial: "Territorjali",
  cultural: "Kulturali",
  transactional: "Sistema",
  global: "Globali",
};

interface QuizProps {
  onComplete: (result: UserResult) => void;
}

export default function Quiz({ onComplete }: QuizProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LikertValue>>({});
  const [direction, setDirection] = useState(1);

  const question = QUESTIONS[index];
  const total = QUESTIONS.length;
  const progress = (index / total) * 100;

  function handleAnswer(value: LikertValue) {
    const newAnswers = { ...answers, [question.id]: value };

    if (index < total - 1) {
      setDirection(1);
      setAnswers(newAnswers);
      setIndex(index + 1);
    } else {
      onComplete(computeResult(QUESTIONS, newAnswers));
    }
  }

  function handleBack() {
    if (index === 0) return;
    setDirection(-1);
    setIndex(index - 1);
  }

  const axisColor = AXIS_COLOR[question.axis];
  const axisLabel = AXIS_LABEL[question.axis];

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Barra tal-progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
          <span>{index + 1} / {total}</span>
          <span style={{ color: axisColor }}>Assi {axisLabel}</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: axisColor }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Karta tal-mistoqsija */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={question.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -48 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8"
        >
          <div
            className="inline-block w-1 h-8 rounded-full mb-4"
            style={{ backgroundColor: axisColor }}
          />
          <p className="text-[1.1rem] font-medium text-slate-800 leading-relaxed">
            {question.text}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Buttuni tal-Likert */}
      <div className="flex flex-col gap-2.5 mb-6">
        {LIKERT.map((opt) => {
          const selected = answers[question.id] === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="w-full text-left px-5 py-3.5 rounded-xl border-2 font-medium text-sm transition-all duration-150 active:scale-[0.98]"
              style={
                selected
                  ? {
                      borderColor: axisColor,
                      backgroundColor: axisColor + "18",
                      color: axisColor,
                    }
                  : {
                      borderColor: "#e2e8f0",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                    }
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Lura */}
      {index > 0 && (
        <button
          onClick={handleBack}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
        >
          ← Mistoqsija ta&apos; qabel
        </button>
      )}
    </div>
  );
}
