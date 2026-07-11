import type { RiskFactor } from "@/types";
import { Progress } from "@/components/ui/progress";

interface RiskGaugeProps {
  label: string;
  factor: RiskFactor;
}

const LEVEL_CONFIG = {
  low: {
    label: "Low Risk",
    color: "text-emerald-400",
    indicator: "bg-gradient-to-r from-emerald-600 to-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
  medium: {
    label: "Medium Risk",
    color: "text-amber-400",
    indicator: "bg-gradient-to-r from-amber-600 to-amber-400",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  },
  high: {
    label: "High Risk",
    color: "text-rose-400",
    indicator: "bg-gradient-to-r from-rose-600 to-rose-400",
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  },
};

export default function RiskGauge({ label, factor }: RiskGaugeProps) {
  const config = LEVEL_CONFIG[factor.level];

  return (
    <div className="rounded-xl bg-slate-900/40 border border-slate-800/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-300">{label}</span>
        <span
          className={`text-[10px] font-bold border rounded-full px-2 py-0.5 uppercase tracking-wider ${config.badge}`}
        >
          {config.label}
        </span>
      </div>

      <Progress
        value={factor.score}
        className="h-1.5 mb-2"
        indicatorClassName={config.indicator}
      />

      <p className="text-[11px] text-slate-500 leading-relaxed">
        {factor.description}
      </p>
    </div>
  );
}
