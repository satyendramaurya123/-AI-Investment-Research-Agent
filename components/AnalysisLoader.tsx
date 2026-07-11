"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, TrendingUp, Building2, ShieldAlert, Lightbulb, CheckCircle2 } from "lucide-react";
import { ANALYSIS_STEPS } from "@/lib/constants";

interface AnalysisLoaderProps {
  companyName: string;
}

const STEP_ICONS = {
  financial: TrendingUp,
  business: Building2,
  risk: ShieldAlert,
  decision: Lightbulb,
};

const STEP_DURATIONS = [3000, 2500, 2500, 3000]; // ms per step

export default function AnalysisLoader({ companyName }: AnalysisLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let step = 0;

    const advance = () => {
      if (step < ANALYSIS_STEPS.length) {
        setCurrentStep(step);
        const timer = setTimeout(() => {
          setCompletedSteps((prev) => [...prev, step]);
          step++;
          advance();
        }, STEP_DURATIONS[step] ?? 2000);
        return timer;
      }
    };

    const timer = advance();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const totalProgress = ((completedSteps.length / ANALYSIS_STEPS.length) * 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Main Animation */}
      <div className="relative mb-8">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-pulse-glow">
          <BrainCircuit className="h-12 w-12 text-white animate-spin-slow" />
        </div>
        {/* Orbiting dots */}
        <div
          className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-spin"
          style={{ animationDuration: "3s" }}
        >
          <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-indigo-400" />
        </div>
        <div
          className="absolute -inset-4 rounded-full border border-purple-500/10 animate-spin"
          style={{ animationDuration: "6s", animationDirection: "reverse" }}
        >
          <div className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-purple-400" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-1 text-center">
        Analyzing{" "}
        <span className="gradient-text">{companyName}</span>
      </h2>
      <p className="text-slate-400 text-sm mb-8 text-center max-w-sm">
        Our AI agents are conducting deep research across multiple dimensions...
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-500">Progress</span>
          <span className="text-xs font-mono text-indigo-400">{Math.round(totalProgress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Step List */}
      <div className="w-full max-w-md space-y-3">
        {ANALYSIS_STEPS.map((step, idx) => {
          const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS] ?? BrainCircuit;
          const isCompleted = completedSteps.includes(idx);
          const isActive = currentStep === idx && !isCompleted;
          const isPending = idx > currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 rounded-xl p-3 border transition-all duration-500 ${
                isActive
                  ? "border-indigo-500/40 bg-indigo-500/10"
                  : isCompleted
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-slate-800/60 bg-slate-900/40"
              }`}
            >
              {/* Icon */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-600/20"
                    : isActive
                    ? "bg-indigo-600/20"
                    : "bg-slate-800/60"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Icon
                    className={`h-5 w-5 ${
                      isActive
                        ? "text-indigo-400 animate-pulse"
                        : "text-slate-600"
                    }`}
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-medium truncate transition-colors ${
                      isCompleted
                        ? "text-emerald-300"
                        : isActive
                        ? "text-indigo-200"
                        : "text-slate-600"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <span className="text-[10px] text-indigo-400 animate-pulse font-medium">
                      Running...
                    </span>
                  )}
                </div>
                {(isActive || isCompleted) && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Status indicator */}
              {isPending && (
                <div className="h-2 w-2 rounded-full bg-slate-700 shrink-0" />
              )}
              {isActive && (
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-slate-600 text-center max-w-sm">
        Fetching real-time financial data and running multi-agent analysis. Usually takes 15-30 seconds.
      </p>
    </div>
  );
}
