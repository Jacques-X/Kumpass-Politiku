"use client";

import { motion } from "framer-motion";
import type { Axis, UserResult } from "@/types/compass";
import { AXIS_META } from "@/lib/engine";
import RadarChart from "./RadarChart";

interface Props {
  result: UserResult;
  onRetake: () => void;
}

// ── Barra tal-iskor ───────────────────────────────────────────────────────────

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
        {/* Tikka taċ-ċentru */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 z-0" />

        {/* Traċċa mimlija miċ-ċentru sad-dott */}
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

        {/* Dott */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md z-10"
          style={{
            left: `calc(${pct}% - 8px)`,
            backgroundColor: meta.color,
          }}
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

// ── Badge tal-integrazzjoni tas-sistema ──────────────────────────────────────

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
      {isPragmatist ? "Pragmatiku tas-Sistema" : "Riformatur tas-Sistema"}
    </div>
  );
}

// ── Dashboard ewlenija ────────────────────────────────────────────────────────

export default function ResultsDashboard({ result, onRetake }: Props) {
  const { archetype, scores } = result;
  const axes: Axis[] = ["territorial", "cultural", "transactional", "global"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-xl mx-auto px-4 py-8"
    >
      {/* Intestatura */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Il-Profil Ideoloġiku Tiegħek
        </p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Kumpass Politiku
        </h2>
      </div>

      {/* Karta tal-arkettip */}
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
              Arkettip
            </p>
            <h3 className="text-xl font-bold leading-tight">{archetype.name}</h3>
            <p className="text-slate-400 text-xs italic mb-3">{archetype.subtitle}</p>
            <p className="text-slate-300 text-sm leading-relaxed">{archetype.description}</p>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
                Integrazzjoni fis-Sistema
              </p>
              <p className="text-sm font-semibold text-slate-200">{archetype.systemLabel}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badge tas-sistema */}
      <div className="flex justify-center mb-6">
        <SystemBadge f={scores.transactional} />
      </div>

      {/* Radar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
      >
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Forma tal-4 Assi</h3>
        <RadarChart result={result} />
      </motion.div>

      {/* Barri tal-iskor */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8"
      >
        <h3 className="text-sm font-semibold text-slate-600 mb-5">Koordinati Assoluti</h3>
        {axes.map((axis) => (
          <ScoreBar key={axis} axis={axis} score={scores[axis]} />
        ))}

        {/* Ringiela tal-leġġenda */}
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

      {/* Erġa' agħmel */}
      <div className="text-center">
        <button
          onClick={onRetake}
          className="px-7 py-3 rounded-full font-semibold text-sm transition-colors"
          style={{ backgroundColor: "#1e293b", color: "#fff" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
        >
          Erġa&apos; Agħmel il-Kumpass
        </button>
        <p className="text-xs text-slate-400 mt-3">
          L-ebda data ma tinħażen. Ir-riżultati jeżistu biss fil-browser tiegħek.
        </p>
      </div>
    </motion.div>
  );
}
