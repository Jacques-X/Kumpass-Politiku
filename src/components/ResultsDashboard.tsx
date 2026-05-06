"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Axis, IntuitionResult, UserResult } from "@/types/compass";
import { AXIS_META } from "@/lib/engine";
import { buildShareUrl, encodeScores } from "@/lib/share";
import RadarChart from "./RadarChart";

interface Props {
  result: UserResult;
  onRetake: () => void;
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ axis, score }: { axis: Axis; score: number }) {
  const meta = AXIS_META.find((m) => m.axis === axis)!;
  const pct = ((score + 10) / 20) * 100;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {meta.lowLabel}
        </span>
        <span className="text-xs font-bold" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {meta.highLabel}
        </span>
      </div>

      <div className="relative h-3 bg-slate-100 rounded-full overflow-visible">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 z-0" />

        <motion.div
          className="absolute top-0 bottom-0 rounded-full z-0"
          style={{
            backgroundColor: meta.color + "40",
            left: score >= 0 ? "50%" : `${pct}%`,
            right: score >= 0 ? `${100 - pct}%` : "50%",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md z-10"
          style={{ left: `calc(${pct}% - 8px)`, backgroundColor: meta.color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>−10</span>
        <span className="font-semibold text-slate-600">{score.toFixed(1)}</span>
        <span>+10</span>
      </div>
    </div>
  );
}

// ── System integration badge ───────────────────────────────────────────────────

function SystemBadge({ f }: { f: number }) {
  const isPragmatist = f > 5;
  const isReformer = f < -5;
  if (!isPragmatist && !isReformer) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
        isPragmatist
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isPragmatist ? "bg-amber-500" : "bg-emerald-500"}`} />
      {isPragmatist ? "System Pragmatist" : "System Reformer"}
    </div>
  );
}

// ── Intuition card ────────────────────────────────────────────────────────────

function IntuitionCard({ intuition }: { intuition: IntuitionResult }) {
  const { neutralCount, totalQuestions, neutralRate, isUndecidedObserver } = intuition;
  const decisiveCount = totalQuestions - neutralCount;
  const decisivePct = Math.round((1 - neutralRate) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className={`rounded-2xl border p-5 mb-6 ${
        isUndecidedObserver
          ? "bg-slate-50 border-slate-300"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-3xl leading-none">
          {isUndecidedObserver ? "🌫️" : "⚡"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-slate-800">
              {isUndecidedObserver ? "The Undecided Observer" : "Intuition Score"}
            </p>
            {isUndecidedObserver && (
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                Flag
              </span>
            )}
          </div>

          {isUndecidedObserver ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              You answered Neutral on{" "}
              <span className="font-semibold text-slate-700">{neutralCount} of {totalQuestions}</span>{" "}
              propositions ({Math.round(neutralRate * 100)}%). Your results are recorded, but your
              ideological signal is weak — you may be genuinely centrist, deliberately evasive, or
              simply resistant to gut-feeling prompts.
            </p>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              You gave a decisive gut reaction to{" "}
              <span className="font-semibold text-slate-700">{decisiveCount} of {totalQuestions}</span>{" "}
              propositions. Your results carry a strong ideological signal.
            </p>
          )}

          {/* Decisiveness bar */}
          <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: isUndecidedObserver ? "#94a3b8" : "#2c3e7a" }}
              initial={{ width: 0 }}
              animate={{ width: `${decisivePct}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{decisivePct}% decisive</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function ResultsDashboard({ result, onRetake }: Props) {
  const { archetype, scores } = result;
  const axes: Axis[] = ["territorial", "cultural", "transactional", "global"];
  const router = useRouter();

  const [copied, setCopied] = useState(false);

  function handleCopyLink() {
    const url = buildShareUrl(scores);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCompare() {
    router.push(`/compare?a=${encodeScores(scores)}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Your Ideological Profile
        </p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Kumpass Politiku
        </h2>
      </div>

      {/* Archetype card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl p-6 mb-6 text-white"
        style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}
      >
        <div className="flex items-start gap-4">
          <span className="text-5xl leading-none flex-shrink-0">{archetype.icon}</span>
          <div className="min-w-0">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">
              Archetype
            </p>
            <h3 className="text-xl font-bold leading-tight">{archetype.name}</h3>
            <p className="text-slate-400 text-xs italic mb-3">{archetype.subtitle}</p>
            <p className="text-slate-300 text-sm leading-relaxed">{archetype.description}</p>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
                System Integration
              </p>
              <p className="text-sm font-semibold text-slate-200">{archetype.systemLabel}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* System badge */}
      <div className="flex justify-center mb-6">
        <SystemBadge f={scores.transactional} />
      </div>

      {/* Intuition Score */}
      <IntuitionCard intuition={result.intuition} />

      {/* Radar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
      >
        <h3 className="text-sm font-semibold text-slate-600 mb-4">4-Axis Shape</h3>
        <RadarChart result={result} />
      </motion.div>

      {/* Score bars */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
      >
        <h3 className="text-sm font-semibold text-slate-600 mb-5">Raw Coordinates</h3>
        {axes.map((axis) => (
          <ScoreBar key={axis} axis={axis} score={scores[axis]} />
        ))}

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-x-6 gap-y-2">
          {AXIS_META.map((m) => (
            <div key={m.axis} className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
              <span>
                <span className="font-semibold text-slate-700">{m.label}:</span>{" "}
                {scores[m.axis].toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Compare & share */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8"
      >
        <h3 className="text-sm font-semibold text-slate-600 mb-1">Compare with someone</h3>
        <p className="text-xs text-slate-400 mb-4">
          Share your result link — when they open it they can enter their own code to see both shapes side by side.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150"
            style={
              copied
                ? { borderColor: "#4a7c59", backgroundColor: "#4a7c5912", color: "#4a7c59" }
                : { borderColor: "#e2e8f0", backgroundColor: "#f8fafc", color: "#475569" }
            }
          >
            {copied ? "✓ Link copied!" : "Copy result link"}
          </button>
          <button
            onClick={handleCompare}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{ backgroundColor: "#1e293b" }}
          >
            Compare →
          </button>
        </div>
      </motion.div>

      {/* Retake */}
      <div className="text-center">
        <button
          onClick={onRetake}
          className="px-7 py-3 rounded-full font-semibold text-sm transition-colors text-slate-500 hover:text-slate-800"
        >
          ← Retake the Compass
        </button>
        <p className="text-xs text-slate-400 mt-2">No data is stored. Results exist only in your browser.</p>
      </div>
    </motion.div>
  );
}
