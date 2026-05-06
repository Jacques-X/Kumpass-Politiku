export type Axis = "territorial" | "cultural" | "transactional" | "global";

/** Raw Likert response from the user: -2 = Strongly Disagree, +2 = Strongly Agree */
export type LikertValue = -2 | -1 | 0 | 1 | 2;

/**
 * direction: 1  — Agree pushes the axis score toward +10 (high end)
 * direction: -1 — Agree pushes the axis score toward -10 (low end)
 */
export interface Question {
  id: string;
  text: string;
  axis: Axis;
  weight: number;
  direction: 1 | -1;
}

export interface AxisMeta {
  axis: Axis;
  label: string;
  lowLabel: string;
  highLabel: string;
  color: string;
}

export interface Archetype {
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  systemLabel: string;
}

export interface IntuitionResult {
  neutralCount: number;
  totalQuestions: number;
  /** 0.0 – 1.0: fraction of answers that were Neutral */
  neutralRate: number;
  /** True when neutralRate > 0.20 */
  isUndecidedObserver: boolean;
}

export interface UserResult {
  answers: Record<string, LikertValue>;
  scores: Record<Axis, number>;
  archetype: Archetype;
  intuition: IntuitionResult;
}
