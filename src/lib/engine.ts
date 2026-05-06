import type { Archetype, Axis, AxisMeta, IntuitionResult, LikertValue, Question, UserResult } from "@/types/compass";

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

  // The Concrete Traditionalist: builds + religious
  if (T > 4 && C > 3) {
    return {
      name: "The Concrete Traditionalist",
      subtitle: G > 2 ? "with a Sovereigntist outlook" : "with Europeanist pragmatism",
      description:
        "Growth and God are your twin pillars. You see cranes on the skyline as progress and Catholic values as the bedrock of a stable society. Malta should build — and Malta should pray.",
      icon: "⛪",
      systemLabel: sys,
    };
  }

  // The Secular Preservationist: green + secular
  if (T < -4 && C < -3) {
    return {
      name: "The Secular Preservationist",
      subtitle: G < 0 ? "with Europeanist leanings" : "with Sovereigntist tensions",
      description:
        "You want to protect Malta's natural heritage and keep the state out of citizens' personal lives. The island's landscape and individual freedoms are both worth defending against unchecked growth and religious conservatism.",
      icon: "🌿",
      systemLabel: sys,
    };
  }

  // The Sacred Sovereigntist: religious + closed borders
  if (C > 4 && G > 4) {
    return {
      name: "The Sacred Sovereigntist",
      subtitle: "Malta-first conservative",
      description:
        "Faith and national sovereignty are non-negotiable. You distrust Brussels and believe Malta's Catholic identity is under siege from foreign migration and liberal ideology. The island must govern itself, by its own values.",
      icon: "🇲🇹",
      systemLabel: sys,
    };
  }

  // The Civic Reformer: principled + secular
  if (F < -4 && C < -3) {
    return {
      name: "The Civic Reformer",
      subtitle: "meritocracy-first progressive",
      description:
        "You see the clientelist system as Malta's deepest structural flaw. You want independent institutions, secular governance, and a culture where merit — not who you know — determines outcomes.",
      icon: "⚖️",
      systemLabel: sys,
    };
  }

  // The Tribal Globalist: clientelist + open borders (unusual combo)
  if (F > 4 && G < -3) {
    return {
      name: "The Tribal Globalist",
      subtitle: "loyalist with an open door",
      description:
        "You navigate life through networks and personal loyalty, yet you're comfortable with Malta's place in a wider world. Favours flow through familiar faces, but you don't fear the foreigner.",
      icon: "🌐",
      systemLabel: sys,
    };
  }

  // The Principled Nationalist: reformist + closed borders
  if (F < -4 && G > 3) {
    return {
      name: "The Principled Nationalist",
      subtitle: "clean governance, closed gates",
      description:
        "You want a Malta run on rules, not relationships — but those rules should be made here, not in Brussels. Meritocracy at home, sovereignty abroad.",
      icon: "🏛️",
      systemLabel: sys,
    };
  }

  // The Tribal Sovereigntist: clientelist + closed borders
  if (F > 4 && G > 3) {
    return {
      name: "The Tribal Sovereigntist",
      subtitle: "loyalty and closed borders",
      description:
        "You believe in taking care of your own — your people, your party, your island. Personal networks matter, and so do national borders. Malta belongs to the Maltese, and the Maltese take care of each other.",
      icon: "🤝",
      systemLabel: sys,
    };
  }

  // The Civic Internationalist: principled + open
  if (F < -4 && G < -3) {
    return {
      name: "The Civic Internationalist",
      subtitle: "rules-based, globally minded",
      description:
        "You reject transactional politics and believe Malta's future is bound to Europe and the international rules-based order. Institutions should be independent, borders relatively open, and governance transparent.",
      icon: "🌍",
      systemLabel: sys,
    };
  }

  // The Green Cosmopolitan: preservationist + internationalist
  if (T < -3 && G < -3) {
    return {
      name: "The Green Cosmopolitan",
      subtitle: "environmentalist & Europeanist",
      description:
        "Malta's future lies in European integration and a green economy. You'd rather have a smaller, cleaner island than a bigger, more prosperous one scarred by overdevelopment and closed off from the world.",
      icon: "♻️",
      systemLabel: sys,
    };
  }

  // The Secular Expansionist: builds + secular
  if (T > 3 && C < -3) {
    return {
      name: "The Secular Expansionist",
      subtitle: "growth without the altar",
      description:
        "You want a modern, forward-looking Malta: built up, economically aggressive, and free from the influence of the Church. Progress means development and individual liberty — not tradition.",
      icon: "🏙️",
      systemLabel: sys,
    };
  }

  // The Sacred Conservationist: protects land + religious (unusual combo)
  if (T < -3 && C > 3) {
    return {
      name: "The Sacred Conservationist",
      subtitle: "faith and field",
      description:
        "You see Malta's rural landscape and Catholic heritage as two sides of the same coin — both worth defending against the bulldozer and the secularist. Some things should simply not be touched.",
      icon: "⛩️",
      systemLabel: sys,
    };
  }

  // The Nationalist Developer: expansionist + sovereigntist
  if (T > 3 && G > 3) {
    return {
      name: "The Nationalist Developer",
      subtitle: "growth-first sovereigntist",
      description:
        "Economic expansion is Malta's destiny and Brussels shouldn't stand in the way. You want a Malta that builds, controls its own borders, and answers to no one but its own people.",
      icon: "🏗️",
      systemLabel: sys,
    };
  }

  // The Progressive Sovereigntist: secular + anti-EU (unusual combo)
  if (C < -3 && G > 3) {
    return {
      name: "The Progressive Sovereigntist",
      subtitle: "secular but Malta-first",
      description:
        "You want a liberal, secular Malta free from both the Church's moral authority and Brussels' political authority. Individual rights, yes — but decided here, not in Strasbourg.",
      icon: "🗽",
      systemLabel: sys,
    };
  }

  // The Pragmatic Centrist: catch-all
  return {
    name: "The Pragmatic Centrist",
    subtitle: "balanced across all axes",
    description:
      "Your views don't map neatly onto any single ideological camp. You're selective: pragmatic where it counts, principled where you care. Malta's political landscape can't easily claim you.",
    icon: "⚡",
    systemLabel: sys,
  };
}

// ─── Intuition score ──────────────────────────────────────────────────────────

export function computeIntuition(
  questions: Question[],
  answers: Record<string, LikertValue>
): IntuitionResult {
  const total = questions.length;
  const neutralCount = questions.filter((q) => (answers[q.id] ?? 0) === 0).length;
  const neutralRate = total > 0 ? neutralCount / total : 0;

  return {
    neutralCount,
    totalQuestions: total,
    neutralRate: Math.round(neutralRate * 100) / 100,
    isUndecidedObserver: neutralRate > 0.2,
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
    intuition: computeIntuition(questions, answers),
  };
}
