"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import type { Axis } from "@/types/compass";
import { AXIS_META, classifyArchetype } from "@/lib/engine";
import { decodeScores, encodeScores } from "@/lib/share";
import { PARTIES, type PartyProfile } from "@/data/parties";

// ── Colours ───────────────────────────────────────────────────────────────────

const COLOR_A = "#2c3e7a"; // deep blue — Person A / "You"
const COLOR_B = "#e76f51"; // terracotta — Person B / party

// ── Helpers ───────────────────────────────────────────────────────────────────

function norm(score: number) {
  return ((score + 10) / 20) * 100;
}

// ── Overlaid radar ────────────────────────────────────────────────────────────

function CompareRadar({
  scoresA,
  scoresB,
  labelA,
  labelB,
  colorB,
}: {
  scoresA: Record<Axis, number>;
  scoresB: Record<Axis, number>;
  labelA: string;
  labelB: string;
  colorB: string;
}) {
  const data = AXIS_META.map((m) => ({
    axis: m.label,
    a: norm(scoresA[m.axis]),
    b: norm(scoresB[m.axis]),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 8, right: 28, bottom: 8, left: 28 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
        />
        <Radar
          name={labelA}
          dataKey="a"
          stroke={COLOR_A}
          fill={COLOR_A}
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name={labelB}
          dataKey="b"
          stroke={colorB}
          fill={colorB}
          fillOpacity={0.15}
          strokeWidth={2}
          strokeDasharray="5 3"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Dual axis bar ─────────────────────────────────────────────────────────────

function DualBar({
  axis,
  scoreA,
  scoreB,
  colorB,
}: {
  axis: Axis;
  scoreA: number;
  scoreB: number;
  colorB: string;
}) {
  const meta = AXIS_META.find((m) => m.axis === axis)!;
  const pctA = ((scoreA + 10) / 20) * 100;
  const pctB = ((scoreB + 10) / 20) * 100;
  const delta = scoreB - scoreA;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {meta.lowLabel}
        </span>
        <span className="text-xs font-bold" style={{ color: meta.color }}>
          {meta.label}
          <span className="ml-2 font-normal text-slate-400">
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)}
          </span>
        </span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {meta.highLabel}
        </span>
      </div>

      <div className="relative h-3 bg-slate-100 rounded-full overflow-visible">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 z-0" />

        {/* Person B dot (behind) */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow z-10"
          style={{ left: `calc(${pctB}% - 8px)`, backgroundColor: colorB }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.25 }}
        />
        {/* Person A dot (front) */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md z-20"
          style={{ left: `calc(${pctA}% - 8px)`, backgroundColor: COLOR_A }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>−10</span>
        <span className="text-slate-500">
          <span style={{ color: COLOR_A }} className="font-semibold">{scoreA.toFixed(1)}</span>
          {" "}vs{" "}
          <span style={{ color: colorB }} className="font-semibold">{scoreB.toFixed(1)}</span>
        </span>
        <span>+10</span>
      </div>
    </div>
  );
}

// ── Archetype mini-card ───────────────────────────────────────────────────────

function ArchetypeCard({
  label,
  scores,
  color,
  partyBlurb,
}: {
  label: string;
  scores: Record<Axis, number>;
  color: string;
  partyBlurb?: string;
}) {
  const archetype = classifyArchetype(scores);

  return (
    <div className="flex-1 min-w-0 rounded-xl border-2 p-4" style={{ borderColor: color + "60" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
        {label}
      </p>
      <p className="text-lg leading-none mb-1">{archetype.icon}</p>
      <p className="text-sm font-bold text-slate-800 leading-tight">{archetype.name}</p>
      <p className="text-xs text-slate-400 italic">{archetype.subtitle}</p>
      {partyBlurb && (
        <p className="text-xs text-slate-500 mt-2 leading-snug border-t border-slate-100 pt-2">
          {partyBlurb}
        </p>
      )}
    </div>
  );
}

// ── Party preset buttons ───────────────────────────────────────────────────────

function PartyPicker({
  selected,
  onSelect,
}: {
  selected: PartyProfile | null;
  onSelect: (p: PartyProfile | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PARTIES.map((p) => {
        const isActive = selected?.id === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(isActive ? null : p)}
            className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all duration-150"
            style={
              isActive
                ? { borderColor: p.color, backgroundColor: p.color, color: "#fff" }
                : { borderColor: p.color + "60", backgroundColor: "#fff", color: p.color }
            }
          >
            {p.shortName}
          </button>
        );
      })}
    </div>
  );
}

// ── Main ComparisonView ───────────────────────────────────────────────────────

interface ComparisonViewProps {
  /** Person A's encoded score string (from URL ?a=) */
  codeA: string;
  /** Person B's encoded score string (from URL ?b=), optional */
  codeB?: string;
}

export default function ComparisonView({ codeA, codeB: initialCodeB }: ComparisonViewProps) {
  const scoresA = decodeScores(codeA);

  const [manualCode, setManualCode] = useState(initialCodeB ?? "");
  const [selectedParty, setSelectedParty] = useState<PartyProfile | null>(null);
  const [codeError, setCodeError] = useState(false);

  // Person B is either a picked party or a manually-entered code
  const scoresB: Record<Axis, number> | null = selectedParty
    ? selectedParty.scores
    : decodeScores(manualCode);

  const labelB = selectedParty ? selectedParty.name : "Person B";
  const colorB = selectedParty ? selectedParty.color : COLOR_B;

  function handleCodeChange(val: string) {
    setManualCode(val);
    setSelectedParty(null);
    setCodeError(false);
  }

  function handlePartySelect(p: PartyProfile | null) {
    setSelectedParty(p);
    setManualCode("");
    setCodeError(false);
  }

  function handleCodeBlur() {
    if (manualCode && !decodeScores(manualCode)) setCodeError(true);
  }

  if (!scoresA) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-sm">Invalid result link — please go back and share again.</p>
      </div>
    );
  }

  const axes: Axis[] = ["territorial", "cultural", "transactional", "global"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Comparison
        </p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Kumpass Politiku</h2>
      </div>

      {/* Person B selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-3">Compare against…</p>

        {/* Party presets */}
        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">
          Political parties
        </p>
        <PartyPicker selected={selectedParty} onSelect={handlePartySelect} />

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400 font-medium">or</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Manual code input */}
        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">
          Another person's result code
        </p>
        <input
          type="text"
          placeholder="e.g. 3.20,-4.10,1.00,6.70"
          value={manualCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          onBlur={handleCodeBlur}
          className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-mono transition-colors outline-none ${
            codeError
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-slate-200 bg-slate-50 text-slate-700 focus:border-slate-400"
          }`}
        />
        {codeError && (
          <p className="text-xs text-red-400 mt-1">
            Invalid code — paste the 4-number code from a result page.
          </p>
        )}
      </div>

      {/* Comparison content — shown only when Person B is set */}
      {scoresB ? (
        <>
          {/* Archetype cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mb-6"
          >
            <ArchetypeCard label="You" scores={scoresA} color={COLOR_A} />
            <ArchetypeCard
              label={labelB}
              scores={scoresB}
              color={colorB}
              partyBlurb={selectedParty?.blurb}
            />
          </motion.div>

          {/* Overlaid radar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-sm font-semibold text-slate-600 flex-1">Side-by-side shape</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-1 rounded-full inline-block" style={{ backgroundColor: COLOR_A }} />
                  You
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-1 rounded-full inline-block opacity-70"
                    style={{ backgroundColor: colorB }}
                  />
                  {selectedParty?.shortName ?? "Person B"}
                </span>
              </div>
            </div>
            <CompareRadar
              scoresA={scoresA}
              scoresB={scoresB}
              labelA="You"
              labelB={labelB}
              colorB={colorB}
            />
          </motion.div>

          {/* Dual axis bars */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-sm font-semibold text-slate-600 flex-1">Axis breakdown</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_A }} />
                  <span className="text-slate-500">You</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorB }} />
                  <span className="text-slate-500">{selectedParty?.shortName ?? "Person B"}</span>
                </span>
              </div>
            </div>

            {axes.map((axis) => (
              <DualBar
                key={axis}
                axis={axis}
                scoreA={scoresA[axis]}
                scoreB={scoresB[axis]}
                colorB={colorB}
              />
            ))}

            {/* Biggest gap callout */}
            {(() => {
              const biggest = axes
                .map((a) => ({ axis: a, gap: Math.abs(scoresB[a] - scoresA[a]) }))
                .sort((x, y) => y.gap - x.gap)[0];
              const meta = AXIS_META.find((m) => m.axis === biggest.axis)!;
              return (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
                  <span className="text-base">🎯</span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your biggest divergence is on the{" "}
                    <span className="font-semibold" style={{ color: meta.color }}>
                      {meta.label}
                    </span>{" "}
                    axis, with a gap of{" "}
                    <span className="font-semibold text-slate-700">
                      {biggest.gap.toFixed(1)} points
                    </span>
                    .
                  </p>
                </div>
              );
            })()}
          </motion.div>

          {/* Share this comparison */}
          {!selectedParty && (
            <div className="text-center mb-6">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/compare?a=${encodeScores(scoresA)}&b=${encodeScores(scoresB)}`;
                  navigator.clipboard.writeText(url);
                }}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                Copy comparison link →
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="text-center py-12 text-slate-300">
          <p className="text-4xl mb-3">↑</p>
          <p className="text-sm text-slate-400">
            Select a party or paste a result code above to see the comparison.
          </p>
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-xs text-slate-400 pb-4">
        Party coordinates are ideological estimates based on policy positions, not endorsements.
      </p>
    </motion.div>
  );
}
