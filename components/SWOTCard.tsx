import { Shield, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import type { SWOTAnalysis } from "@/types";

interface SWOTCardProps {
  swot: SWOTAnalysis;
}

const QUADRANTS = [
  {
    key: "strengths" as const,
    label: "Strengths",
    icon: Shield,
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    textColor: "text-emerald-300",
    dotColor: "bg-emerald-400",
  },
  {
    key: "weaknesses" as const,
    label: "Weaknesses",
    icon: AlertTriangle,
    bg: "bg-rose-500/5",
    border: "border-rose-500/20",
    iconColor: "text-rose-400",
    textColor: "text-rose-300",
    dotColor: "bg-rose-400",
  },
  {
    key: "opportunities" as const,
    label: "Opportunities",
    icon: TrendingUp,
    bg: "bg-indigo-500/5",
    border: "border-indigo-500/20",
    iconColor: "text-indigo-400",
    textColor: "text-indigo-300",
    dotColor: "bg-indigo-400",
  },
  {
    key: "threats" as const,
    label: "Threats",
    icon: Zap,
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
    textColor: "text-amber-300",
    dotColor: "bg-amber-400",
  },
];

export default function SWOTCard({ swot }: SWOTCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {QUADRANTS.map(({ key, label, icon: Icon, bg, border, iconColor, textColor, dotColor }) => {
        const items = swot[key] ?? [];

        return (
          <div
            key={key}
            className={`rounded-xl border ${border} ${bg} p-4`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} border ${border}`}>
                <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
              </div>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>
                {label}
              </h4>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-600">No data available</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
