"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import ScoreMeter from "@/components/ScoreMeter";
import type { InvestmentDecision, AnalysisResult } from "@/types";

interface DecisionCardProps {
  result: AnalysisResult;
}

const DECISION_CONFIG = {
  invest: {
    label: "INVEST",
    icon: TrendingUp,
    gradient: "from-emerald-600/20 via-emerald-500/10 to-transparent",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/15",
    badge: "invest" as const,
    description: "Strong buy signal. High conviction investment opportunity.",
  },
  hold: {
    label: "HOLD",
    icon: Minus,
    gradient: "from-amber-600/20 via-amber-500/10 to-transparent",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/15",
    badge: "hold" as const,
    description: "Neutral position. Wait for better entry or more clarity.",
  },
  pass: {
    label: "PASS",
    icon: TrendingDown,
    gradient: "from-rose-600/20 via-rose-500/10 to-transparent",
    border: "border-rose-500/30",
    text: "text-rose-400",
    glow: "shadow-rose-500/15",
    badge: "pass" as const,
    description: "Avoid at current price. Better opportunities exist.",
  },
};

export default function DecisionCard({ result }: DecisionCardProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const config = DECISION_CONFIG[result.decision as InvestmentDecision];
  const Icon = config.icon;

  return (
    <Card
      className={`overflow-hidden border ${config.border} shadow-2xl ${config.glow}`}
    >
      <div className={`bg-gradient-to-br ${config.gradient}`}>
        <CardContent className="p-6">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Score Meter */}
            <ScoreMeter
              score={result.overallScore}
              size="lg"
              label="Overall Score"
              sublabel="AI Investment Score"
            />

            {/* Decision */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={config.badge} className="text-base px-4 py-1.5 font-black tracking-widest">
                  <Icon className="h-4 w-4" />
                  {config.label}
                </Badge>
              </div>

              <p className="text-sm text-slate-400">{config.description}</p>

              {/* Confidence */}
              <div className="w-full max-w-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-indigo-400" />
                    AI Confidence
                  </span>
                  <span className={`text-sm font-bold ${config.text}`}>
                    {result.confidence}%
                  </span>
                </div>
                <Progress
                  value={result.confidence}
                  className="h-2"
                  indicatorClassName={
                    result.decision === "invest"
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                      : result.decision === "hold"
                      ? "bg-gradient-to-r from-amber-600 to-amber-400"
                      : "bg-gradient-to-r from-rose-600 to-rose-400"
                  }
                />
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[
                { label: "Financial", score: result.financialScore },
                { label: "Business", score: result.businessScore },
                { label: "Risk Safety", score: result.riskScore },
              ].map(({ label, score }) => (
                <ScoreMeter
                  key={label}
                  score={score}
                  size="sm"
                  label={label}
                />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-xl bg-slate-900/40 border border-slate-700/30 p-4">
            <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
          </div>

          {/* Pros & Cons */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Pros
              </h4>
              <ul className="space-y-2">
                {result.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="rounded-xl bg-rose-500/5 border border-rose-500/15 p-4">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Cons
              </h4>
              <ul className="space-y-2">
                {result.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Expandable Reasoning */}
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowReasoning(!showReasoning)}
              className="w-full text-xs text-slate-400 hover:text-slate-200 border border-slate-700/40 hover:border-slate-600 rounded-xl"
            >
              {showReasoning ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide AI Reasoning
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show Detailed AI Reasoning
                </>
              )}
            </Button>

            {showReasoning && (
              <div className="mt-3 rounded-xl bg-slate-900/60 border border-slate-700/30 p-4 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    AI Reasoning Chain
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {result.detailedReasoning}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
