"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import type { UserResult } from "@/types/compass";
import { AXIS_META } from "@/lib/engine";

interface RadarChartProps {
  result: UserResult;
}

/** Shift -10..+10 to 0..100 so Recharts fills the shape correctly. */
function norm(score: number): number {
  return ((score + 10) / 20) * 100;
}

export default function RadarChart({ result }: RadarChartProps) {
  const data = AXIS_META.map((meta) => ({
    axis: meta.label,
    value: norm(result.scores[meta.axis]),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadar data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
        />
        <Radar
          name="Your ideology"
          dataKey="value"
          stroke="#2c3e7a"
          fill="#2c3e7a"
          fillOpacity={0.22}
          strokeWidth={2}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
