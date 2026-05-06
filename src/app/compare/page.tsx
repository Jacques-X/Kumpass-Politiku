"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ComparisonView from "@/components/ComparisonView";

function CompareContent() {
  const params = useSearchParams();
  const router = useRouter();

  const codeA = params.get("a") ?? "";
  const codeB = params.get("b") ?? undefined;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f7f4" }}>
      <header className="max-w-xl mx-auto px-4 pt-6 pb-2 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-slate-700 text-sm transition-colors"
        >
          ← Back
        </button>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Kumpass Politiku
        </span>
      </header>

      {codeA ? (
        <ComparisonView codeA={codeA} codeB={codeB} />
      ) : (
        /* No code in URL — direct visit to /compare */
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <p className="text-4xl mb-4">📊</p>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Compare Results</h2>
          <p className="text-sm text-slate-500 mb-6">
            To compare, finish the quiz first — the results page will give you a shareable link that opens this view.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: "#1e293b" }}
          >
            Take the quiz →
          </button>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  );
}
