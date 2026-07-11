"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { HistoricalRevenue } from "@/types";
import { CHART_COLORS } from "@/lib/constants";

interface RevenueChartProps {
  data: HistoricalRevenue[];
}

function formatBillions(value: number): string {
  if (!value) return "0";
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toFixed(0)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/95 p-3 shadow-xl backdrop-blur-xl">
      <p className="text-xs font-semibold text-slate-400 mb-2">{label}</p>
      {payload.map(
        (entry: { name: string; value: number; color: string }, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="font-semibold text-slate-200">
              {formatBillions(entry.value)}
            </span>
          </div>
        )
      )}
    </div>
  );
};

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-600 text-sm">
        No historical data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    year: d.year,
    Revenue: d.revenue,
    "Net Income": d.netIncome,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatBillions}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "#64748b", paddingTop: "8px" }}
        />
        <Bar
          dataKey="Revenue"
          fill={CHART_COLORS.primary}
          radius={[3, 3, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="Net Income"
          fill={CHART_COLORS.success}
          radius={[3, 3, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
