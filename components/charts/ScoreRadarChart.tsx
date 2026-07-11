"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { AnalysisResult } from "@/types";

interface ScoreRadarChartProps {
  result: AnalysisResult;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-900/95 p-2.5 shadow-xl backdrop-blur-xl">
      <p className="text-xs font-semibold text-slate-300">
        {payload[0]?.payload?.subject}
      </p>
      <p className="text-xs text-indigo-400 font-bold">
        Score: {payload[0]?.value}/100
      </p>
    </div>
  );
};

export default function ScoreRadarChart({ result }: ScoreRadarChartProps) {
  const data = [
    { subject: "Financial", value: result.financialScore, fullMark: 100 },
    { subject: "Business", value: result.businessScore, fullMark: 100 },
    { subject: "Risk Safety", value: result.riskScore, fullMark: 100 },
    { subject: "Overall", value: result.overallScore, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="rgba(148, 163, 184, 0.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "#64748b" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
