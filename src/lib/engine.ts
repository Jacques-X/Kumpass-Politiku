import type { Archetype, Axis, AxisMeta, LikertValue, Question, UserResult } from "@/types/compass";

// ─── Metadejta tal-assi ───────────────────────────────────────────────────────

export const AXIS_META: AxisMeta[] = [
  {
    axis: "territorial",
    label: "Territorjali",
    lowLabel: "Konservattiv",
    highLabel: "Espansjonist",
    color: "#4a7c59",
  },
  {
    axis: "cultural",
    label: "Kulturali",
    lowLabel: "Sekular",
    highLabel: "Sagru",
    color: "#c0392b",
  },
  {
    axis: "transactional",
    label: "Sistema",
    lowLabel: "Riformatur",
    highLabel: "Pragmatiku",
    color: "#d4a017",
  },
  {
    axis: "global",
    label: "Globali",
    lowLabel: "Internazzjonalist",
    highLabel: "Sovranist",
    color: "#2c3e7a",
  },
];

// ─── Magna tal-kalkolu ────────────────────────────────────────────────────────

/**
 * Skor direzjonali b'piż għal assi wieħed.
 * Skor = (Σ risposta × direzzjoni × piż) / (Σ 2 × piż) × 10
 * Ir-riżultat huwa limitat għal [-10, +10].
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

// ─── Klassifikatur tal-arkettip ───────────────────────────────────────────────

/**
 * Territorjali (T): -10 = Konservattiv profond … +10 = Espansjonist profond
 * Kulturali    (C): -10 = Sekular profond      … +10 = Sagru profond
 * Sistema      (F): -10 = Riformatur profond   … +10 = Pragmatiku profond
 * Globali      (G): -10 = Internazzjonalist    … +10 = Sovranist
 *
 * Ir-regoli jiġu evalwati fl-ordni; l-ewwel waħda li taqbel tirbaħ.
 */
function sistemLabel(f: number): string {
  if (f > 5) return "Integrazzjoni Għolja fis-Sistema (Pragmatiku tas-Sistema)";
  if (f < -5) return "Integrazzjoni Baxxa fis-Sistema (Riformatur tas-Sistema)";
  if (f > 2) return "Integrazzjoni Moderata fis-Sistema";
  if (f < -2) return "Riformiżmu Moderat tas-Sistema";
  return "Orjentament Ċentrali tas-Sistema";
}

export function classifyArchetype(scores: Record<Axis, number>): Archetype {
  const T = scores.territorial;
  const C = scores.cultural;
  const F = scores.transactional;
  const G = scores.global;

  const sys = sistemLabel(F);

  // Konservattiv Sekular: ekoloġiku u progressiv
  if (T < -4 && C < -3) {
    return {
      name: "Konservattiv Sekular",
      subtitle: G < 0 ? "b'inklinazzjonijiet Euro-Liberali" : "b'tensjonijiet Sovranisti",
      description:
        "Trid tipproteġi l-wirt naturali ta' Malta u żżomm l-istat 'il bogħod mill-ħajja personali taċ-ċittadini. Temmen li l-pajsaġġ tal-gżira u l-libertajiet individwali jistħoqqilhom li jiġu difiżi kontra t-tkabbir bla kontroll u l-konservattività reliġjuża.",
      icon: "🌿",
      systemLabel: sys,
    };
  }

  // Espansjonist Sagru: konkrit u reliġjuż
  if (T > 4 && C > 3) {
    return {
      name: "Espansjonist Sagru",
      subtitle: G > 2 ? "b'perspettiva Sovranista" : "b'pragmatiżmu Ewropeist",
      description:
        "It-tkabbir u Alla huma ż-żewġ pilastri tiegħek. Tara l-iżvilupp ekonomiku bħala progress u l-valuri Kattoliċi bħala l-pedament ta' soċjetà stabbli. Malta għandha tibni, u Malta għandha titlob.",
      icon: "⛪",
      systemLabel: sys,
    };
  }

  // Tradizzjonalist Sovranist: reliġjuż u kontra l-UE
  if (C > 4 && G > 4) {
    return {
      name: "Tradizzjonalist Sovranist",
      subtitle: "konservattiv Malta l-Ewwel",
      description:
        "Il-fidi u s-sovranità nazzjonali huma mhux negozzjabbli. Ma tafdax lil Brussell u temmen li l-identità Kattolika ta' Malta hija taħt theddida kemm mill-migrazzjoni barranija kif ukoll mill-ideoloġija liberali. Il-gżira trid tiggverna lilha nnifisha, bl-valuri tagħha stess.",
      icon: "🇲🇹",
      systemLabel: sys,
    };
  }

  // Riformatur Ċiviku: kontra l-klienteliżmu u progressiv
  if (F < -4 && C < -3) {
    return {
      name: "Riformatur Ċiviku",
      subtitle: "progressiv bil-meritokrazija l-ewwel",
      description:
        "Tara s-sistema klientelista bħala l-akbar difett strutturali ta' Malta. Trid istituzzjonijiet indipendenti, governanza laika, u kultura fejn il-mertu — mhux min taf — jiddetermina r-riżultati.",
      icon: "⚖️",
      systemLabel: sys,
    };
  }

  // Pragmatiku tas-Sistema: F għoli
  if (F > 5) {
    return {
      name: "Pragmatiku tas-Sistema",
      subtitle: T > 0 ? "b'instinti ta' żvilupp" : "b'inklinazzjonijiet konservattivi",
      description:
        "Inti komdu bil-mod kif il-politika taħdem tassew f'Malta. Ir-relazzjonijiet personali, il-lealtà tal-partit, u l-iskambju ta' pjaċiri huma parti mill-kuntratt soċjali — mhux korruzzjoni, sempliċiment ir-realtà.",
      icon: "🤝",
      systemLabel: sys,
    };
  }

  // Riformatur tas-Sistema: F baxx
  if (F < -5) {
    return {
      name: "Riformatur tas-Sistema",
      subtitle: G < 0 ? "b'viżjoni internazzjonalista" : "b'fokus lokali",
      description:
        "Tirrifjuta l-kultura transazzjonali li tiddefinixxi l-politika Maltija. Ir-rwoli pubbliċi għandhom jiġu maqbudin bil-mertu, mhux mogħtija bħala rigali. Il-midja tal-partiti għandha tiġi pprojbita. Trid Malta li taħdem fuq regoli, mhux relazzjonijiet.",
      icon: "🔧",
      systemLabel: sys,
    };
  }

  // Kosmopolita Ekoloġiku: konservattiv u internazzjonalist
  if (T < -3 && G < -3) {
    return {
      name: "Kosmopolita Ekoloġiku",
      subtitle: "ambjentalista u Ewropeist",
      description:
        "Temmen li l-futur ta' Malta jinsab fl-integrazzjoni Ewropea u ekonomija ekoloġika. Tippreferi gżira iżgħar u aktar nadifa minn waħda akbar u aktar prosperuża mġarrfa bl-iżvilupp żejjed.",
      icon: "🌍",
      systemLabel: sys,
    };
  }

  // Żviluppatur Nazzjonalista: espansjonist u sovranist
  if (T > 3 && G > 3) {
    return {
      name: "Żviluppatur Nazzjonalista",
      subtitle: "sovranist li jipprioritizza t-tkabbir",
      description:
        "L-espansjoni ekonomika hija d-destin ta' Malta u Brussell m'għandux jostakolaha. Trid Malta li tibni, tikkontrolla l-fruntieri tagħha, u twieġeb lil ħadd ħlief lil nies tagħha stess.",
      icon: "🏗️",
      systemLabel: sys,
    };
  }

  // Sovranist Progressiv: sekular u kontra l-UE (taħlita rari)
  if (C < -3 && G > 3) {
    return {
      name: "Sovranist Progressiv",
      subtitle: "sekular imma Malta l-ewwel",
      description:
        "Trid Malta liberali u sekulari ħielsa kemm mill-awtorità morali tal-Knisja kif ukoll mill-awtorità politika ta' Brussell. Drittijiet individwali, iva — imma deċiżi hawn, mhux fi Strasburgu.",
      icon: "🗽",
      systemLabel: sys,
    };
  }

  // Ċentrist Pragmatiku: għall-oħrajn kollha
  return {
    name: "Ċentrist Pragmatiku",
    subtitle: "bilanċjat fuq l-assi kollha",
    description:
      "Il-fehmiet tiegħek ma jaqblux ma' ebda kampja ideoloġika waħda. Inti selettiv: pragmatiku fejn jaqbel, prinċipjat fejn tgħajjat. Il-pajsaġġ politiku ta' Malta ma jistax jiddakrak faċilment.",
    icon: "⚡",
    systemLabel: sys,
  };
}

// ─── Pipeline sħiħ ───────────────────────────────────────────────────────────

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
