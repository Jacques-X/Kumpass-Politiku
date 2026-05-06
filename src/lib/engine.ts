import type { Archetype, Axis, AxisMeta, LikertValue, Question, UserResult } from "@/types/compass";

// ─── Axis metadata ────────────────────────────────────────────────────────────

export const AXIS_META: AxisMeta[] = [
  {
    axis: "territorial",
    label: "Territorial",
    lowLabel: "Preservationist",
    highLabel: "Expansionist",
    color: "#4a7c59",
  },
  {
    axis: "cultural",
    label: "Cultural",
    lowLabel: "Secular",
    highLabel: "Sacred",
    color: "#c0392b",
  },
  {
    axis: "transactional",
    label: "System",
    lowLabel: "Reformer",
    highLabel: "Pragmatist",
    color: "#d4a017",
  },
  {
    axis: "global",
    label: "Global",
    lowLabel: "Internationalist",
    highLabel: "Sovereigntist",
    color: "#2c3e7a",
  },
];

// ─── Scoring engine ───────────────────────────────────────────────────────────

/**
 * Weighted directional score for one axis.
 * Score = (Σ response × direction × weight) / (Σ 2 × weight) × 10
 * Result is clamped to [-10, +10].
 */
export function scoreAxis(
  questions: Question[],
  answers: Record<string, LikertValue>,
  axis: Axis
): number {
  const qs = questions.filter((q) => q.axis === axis);
  if (qs.length === 0) return 0;

  let numerator = 0;
  let denominator = 0;

  for (const q of qs) {
    const r = answers[q.id] ?? 0;
    numerator += r * q.direction * q.weight;
    denominator += 2 * q.weight;
  }

  if (denominator === 0) return 0;
  const raw = (numerator / denominator) * 10;
  return Math.round(Math.min(10, Math.max(-10, raw)) * 100) / 100;
}

// ─── Archetype classifier ─────────────────────────────────────────────────────

/**
 * Compose a descriptive ideological archetype from the four raw axis scores.
 *
 * Territory (T): -10 = deep Preservationist … +10 = deep Expansionist
 * Cultural   (C): -10 = deep Secular        … +10 = deep Sacred
 * System     (F): -10 = deep Reformer       … +10 = deep Pragmatist
 * Global     (G): -10 = Internationalist    … +10 = Sovereigntist
 *
 * Rules are evaluated in order; first match wins.
 */
function systemLabel(f: number): string {
  if (f > 5) return "High System Integration (System Pragmatist)";
  if (f < -5) return "Low System Integration (System Reformer)";
  if (f > 2) return "Moderate System Integration";
  if (f < -2) return "Moderate System Reformism";
  return "Centrist System Orientation";
}

export function classifyArchetype(scores: Record<Axis, number>): Archetype {
  const T = scores.territorial;
  const C = scores.cultural;
  const F = scores.transactional;
  const G = scores.global;

  const sys = systemLabel(F);

  // ── Defined archetypes (ordered by specificity) ──────────────────────────

  // Secular Preservationist: green & progressive
  if (T < -4 && C < -3) {
    return {
      name: "Secular Preservationist",
      subtitle: G < 0 ? "with Euro-Liberal leanings" : "with Sovereigntist tensions",
      description:
        "You want to protect Malta's natural heritage and keep the state out of citizens' personal lives. You believe the island's landscape and individual freedoms are both worth defending against unchecked growth and religious conservatism.",
      icon: "🌿",
      systemLabel: sys,
    };
  }

  // Sacred Expansionist: concrete & religious
  if (T > 4 && C > 3) {
    return {
      name: "Sacred Expansionist",
      subtitle: G > 2 ? "with a Sovereigntist outlook" : "with Europeanist pragmatism",
      description:
        "Growth and God are your twin pillars. You see economic development as progress and Catholic values as the bedrock of a stable society. Malta should build, and Malta should pray.",
      icon: "⛪",
      systemLabel: sys,
    };
  }

  // Sovereign Traditionalist: religion + anti-EU
  if (C > 4 && G > 4) {
    return {
      name: "Sovereign Traditionalist",
      subtitle: "Malta-First conservative",
      description:
        "Faith and national sovereignty are non-negotiable. You distrust Brussels and believe Malta's Catholic identity is under siege from both foreign migration and liberal ideology. The island must govern itself, by its own values.",
      icon: "🇲🇹",
      systemLabel: sys,
    };
  }

  // Civic Reformer: anti-clientelist + progressive
  if (F < -4 && C < -3) {
    return {
      name: "Civic Reformer",
      subtitle: "meritocracy-first progressive",
      description:
        "You see the clientelist system as Malta's deepest structural flaw. You want independent institutions, secular governance, and a culture where merit — not who you know — determines outcomes.",
      icon: "⚖️",
      systemLabel: sys,
    };
  }

  // System Pragmatist: high F
  if (F > 5) {
    return {
      name: "System Pragmatist",
      subtitle: T > 0 ? "with development instincts" : "with preservationist leanings",
      description:
        "You're comfortable with how politics actually works in Malta. Personal relationships, party loyalty, and the exchange of favours are part of the social contract — not corruption, just reality.",
      icon: "🤝",
      systemLabel: sys,
    };
  }

  // System Reformer: low F
  if (F < -5) {
    return {
      name: "System Reformer",
      subtitle: G < 0 ? "with internationalist vision" : "with a local focus",
      description:
        "You reject the transactional culture that defines Maltese politics. Public roles should be earned, not gifted. Party media should be banned. You want a Malta that runs on rules, not relationships.",
      icon: "🔧",
      systemLabel: sys,
    };
  }

  // Green Cosmopolitan: preservationist + internationalist
  if (T < -3 && G < -3) {
    return {
      name: "Green Cosmopolitan",
      subtitle: "environmentalist & Europeanist",
      description:
        "You believe Malta's future lies in European integration and a green economy. You'd rather have a smaller, cleaner island than a bigger, more prosperous one scarred by overdevelopment.",
      icon: "🌍",
      systemLabel: sys,
    };
  }

  // Nationalist Developer: expansionist + sovereigntist
  if (T > 3 && G > 3) {
    return {
      name: "Nationalist Developer",
      subtitle: "growth-first sovereigntist",
      description:
        "Economic expansion is Malta's destiny and Brussels shouldn't stand in the way. You want a Malta that builds, controls its own borders, and answers to no one but its own people.",
      icon: "🏗️",
      systemLabel: sys,
    };
  }

  // Progressive Sovereigntist: secular + anti-EU (unusual combo)
  if (C < -3 && G > 3) {
    return {
      name: "Progressive Sovereigntist",
      subtitle: "secular but Malta-first",
      description:
        "You want a liberal, secular Malta free from both the Church's moral authority and Brussels' political authority. Individual rights, yes — but decided here, not in Strasbourg.",
      icon: "🗽",
      systemLabel: sys,
    };
  }

  // Centrist catch-all
  return {
    name: "The Pragmatic Centrist",
    subtitle: "balanced across all axes",
    description:
      "Your views don't map neatly onto any single ideological camp. You're selective: pragmatic where it counts, principled where you care. Malta's political landscape can't easily claim you.",
    icon: "⚡",
    systemLabel: sys,
  };
}

// ─── Full pipeline ────────────────────────────────────────────────────────────

export function computeResult(
  questions: Question[],
  answers: Record<string, LikertValue>
): UserResult {
  const axes: Axis[] = ["territorial", "cultural", "transactional", "global"];
  const scores = Object.fromEntries(
    axes.map((a) => [a, scoreAxis(questions, answers, a)])
  ) as Record<Axis, number>;

  return {
    answers,
    scores,
    archetype: classifyArchetype(scores),
  };
}
