import type { Axis } from "@/types/compass";

export interface PartyProfile {
  id: string;
  name: string;
  shortName: string;
  color: string;
  /** Ideological coordinates on each -10..+10 axis */
  scores: Record<Axis, number>;
  /** One-line description shown in the UI */
  blurb: string;
}

/**
 * Party coordinates are estimates based on stated policy positions,
 * parliamentary voting records, and campaign material.
 * They represent ideological tendencies, not endorsements.
 *
 * Territorial: -10 Preservationist … +10 Expansionist
 * Cultural:    -10 Secular         … +10 Sacred
 * System:      -10 Reformer        … +10 Pragmatist (clientelist)
 * Global:      -10 Internationalist… +10 Sovereigntist
 */
export const PARTIES: PartyProfile[] = [
  {
    id: "PL",
    name: "Partit Laburista",
    shortName: "PL",
    color: "#e63946",
    scores: {
      territorial: 5.5,
      cultural: 1.0,
      transactional: 7.5,
      global: 2.0,
    },
    blurb: "Centre-left; pro-development, progressive social policy, high clientelism.",
  },
  {
    id: "PN",
    name: "Partit Nazzjonalista",
    shortName: "PN",
    color: "#1d3557",
    scores: {
      territorial: 3.0,
      cultural: 7.0,
      transactional: 4.0,
      global: -3.5,
    },
    blurb: "Centre-right; pro-EU, Catholic-traditionalist, moderate clientelism.",
  },
  {
    id: "ADPD",
    name: "ADPD – The Greens",
    shortName: "ADPD",
    color: "#2a9d8f",
    scores: {
      territorial: -9.0,
      cultural: -7.5,
      transactional: -7.0,
      global: -8.5,
    },
    blurb: "Green-left; anti-development, secular, anti-clientelist, strongly pro-EU.",
  },
  {
    id: "Momentum",
    name: "Momentum",
    shortName: "MOM",
    color: "#f4a261",
    scores: {
      territorial: -5.0,
      cultural: -5.5,
      transactional: -5.0,
      global: -6.5,
    },
    blurb: "Progressive social democratic; environmental, secular, reformist.",
  },
  {
    id: "AħwaMaltin",
    name: "Aħwa Maltin",
    shortName: "AM",
    color: "#6a0572",
    scores: {
      territorial: 2.5,
      cultural: 9.0,
      transactional: 5.5,
      global: 8.5,
    },
    blurb: "Far-right nationalist; Catholic-conservative, sovereigntist, anti-immigration.",
  },
];
