"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserResult } from "@/types/compass";
import Quiz from "@/components/Quiz";
import ResultsDashboard from "@/components/ResultsDashboard";

type Phase = "landing" | "quiz" | "results";

const ASSI = [
  { label: "Territorjali", sub: "Konservattiv ↔ Espansjonist", color: "#4a7c59", icon: "🏛️" },
  { label: "Kulturali", sub: "Sekular ↔ Sagru", color: "#c0392b", icon: "⛪" },
  { label: "Sistema", sub: "Riformatur ↔ Pragmatiku", color: "#d4a017", icon: "⚖️" },
  { label: "Globali", sub: "Internazzjonalist ↔ Sovranist", color: "#2c3e7a", icon: "🌍" },
];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [result, setResult] = useState<UserResult | null>(null);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f8f7f4" }}>
      <AnimatePresence mode="wait">

        {/* ── Paġna tal-bidu ───────────────────────────────────────────────── */}
        {phase === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center min-h-screen px-5 py-16 text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Analiżi Ideoloġika Oġġettiva
            </div>

            {/* Titlu */}
            <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight mb-3 leading-none">
              Kumpass<br className="sm:hidden" /> Politiku
            </h1>
            <p className="text-lg text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed">
              50 mistoqsija. 4 assi. Ebda tikketti tribali.{" "}
              <span className="text-slate-700 font-medium">
                Skopri dak li temmnu tassew.
              </span>
            </p>

            {/* Grilja tal-assi */}
            <div className="grid grid-cols-2 gap-3 max-w-sm w-full mb-10">
              {ASSI.map((assi) => (
                <div
                  key={assi.label}
                  className="bg-white rounded-2xl p-4 border border-slate-200 text-left"
                >
                  <span className="text-2xl mb-2 block">{assi.icon}</span>
                  <p className="text-sm font-bold text-slate-800">{assi.label}</p>
                  <p
                    className="text-[10px] font-medium mt-0.5 leading-snug"
                    style={{ color: assi.color }}
                  >
                    {assi.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Dikjarazzjoni */}
            <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-4 mb-8 text-left">
              <p className="text-xs font-bold text-slate-700 mb-1">
                Dan mhuwiex test partiġġjan.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Il-Kumpass Politiku jkejjel l-ideoloġija, mhux il-lealtà. L-ebda isem
                ta&apos; partit ma jiġi msemmi. Ir-riżultat tiegħek huwa koordinata —
                mhux tikketta mogħtija lilek minn magna politika.
              </p>
            </div>

            <button
              onClick={() => setPhase("quiz")}
              className="px-9 py-4 rounded-full text-white font-bold text-base shadow-lg transition-all duration-200 active:scale-95 hover:shadow-xl"
              style={{ backgroundColor: "#1e293b" }}
            >
              Ibda l-Kumpass →
            </button>
            <p className="text-xs text-slate-400 mt-4">
              ~8 minuti · 50 mistoqsija · Kompletament anonimu
            </p>
          </motion.div>
        )}

        {/* ── Il-kwiżż ─────────────────────────────────────────────────────── */}
        {phase === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="min-h-screen"
          >
            <header className="max-w-xl mx-auto px-4 pt-6 pb-2 flex items-center gap-3">
              <button
                onClick={() => setPhase("landing")}
                className="text-slate-400 hover:text-slate-700 text-sm transition-colors"
              >
                ← Lura
              </button>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Kumpass Politiku
              </span>
            </header>

            <Quiz
              onComplete={(r) => {
                setResult(r);
                setPhase("results");
              }}
            />
          </motion.div>
        )}

        {/* ── Ir-riżultati ─────────────────────────────────────────────────── */}
        {phase === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-screen"
          >
            <ResultsDashboard
              result={result}
              onRetake={() => {
                setResult(null);
                setPhase("landing");
              }}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
