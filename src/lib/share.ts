import type { Axis } from "@/types/compass";

const AXIS_ORDER: Axis[] = ["territorial", "cultural", "transactional", "global"];

/** Encode 4 axis scores to a compact comma-separated string, e.g. "3.20,-4.10,1.00,6.70" */
export function encodeScores(scores: Record<Axis, number>): string {
  return AXIS_ORDER.map((a) => scores[a].toFixed(2)).join(",");
}

/** Decode a score string back to axis scores. Returns null if invalid. */
export function decodeScores(code: string): Record<Axis, number> | null {
  try {
    const parts = code.trim().split(",").map(Number);
    if (parts.length !== 4) return null;
    if (parts.some((v) => isNaN(v) || v < -10 || v > 10)) return null;
    return Object.fromEntries(
      AXIS_ORDER.map((a, i) => [a, Math.round(parts[i] * 100) / 100])
    ) as Record<Axis, number>;
  } catch {
    return null;
  }
}

/** Build the full shareable compare URL for a single result. */
export function buildShareUrl(scores: Record<Axis, number>): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/compare?a=${encodeScores(scores)}`;
}
