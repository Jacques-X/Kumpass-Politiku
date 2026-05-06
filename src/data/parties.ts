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
      territorial: 8.0,
      cultural: -3.5,
      transactional: 9.0,
      global: 1.5,
    },
    blurb: "Pro-development and socially liberal, but the engine of Malta's clientelist state. Muscat's 'Dubai vision' and systematic distribution of positions of trust define the era.",
  },
  {
    id: "PN",
    name: "Partit Nazzjonalista",
    shortName: "PN",
    color: "#1d3557",
    scores: {
      territorial: 1.0,
      cultural: 6.5,
      transactional: 3.0,
      global: -5.5,
    },
    blurb: "Christian democratic and strongly pro-EU — the party that took Malta into the EU. Currently in opposition, campaigning against overdevelopment and Labour's corruption.",
  },
  {
    id: "ADPD",
    name: "ADPD – The Greens",
    shortName: "ADPD",
    color: "#2a9d8f",
    scores: {
      territorial: -9.0,
      cultural: -7.5,
      transactional: -8.0,
      global: -8.0,
    },
    blurb: "Malta's conscience party. Strongly anti-development, secular, anti-clientelist, and firmly pro-EU. Limited electoral weight; principled ideological anchor.",
  },
  {
    id: "Momentum",
    name: "Momentum",
    shortName: "MOM",
    color: "#f4a261",
    scores: {
      territorial: -4.5,
      cultural: -2.5,
      transactional: -6.0,
      global: -5.0,
    },
    blurb: "New centrist party (2025), led by Arnold Cassola. Anti-clientelist and pro-EU, with a conscience-vote approach to social issues — more moderate than ADPD on culture.",
  },
  {
    id: "AħwaMaltin",
    name: "Aħwa Maltin",
    shortName: "AM",
    color: "#6a0572",
    scores: {
      territorial: 2.0,
      cultural: 5.0,
      transactional: 3.5,
      global: 8.5,
    },
    blurb: "Right-wing populist and nativist. 'Malta for the Maltese' — anti-immigration, sovereigntist, and traditionally conservative. More identity-driven than explicitly Catholic.",
  },
];
