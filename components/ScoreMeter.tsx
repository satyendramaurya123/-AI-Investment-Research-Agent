"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  sublabel?: string;
  className?: string;
  animated?: boolean;
}

const SIZE_CONFIG = {
  sm: { viewBox: 80, radius: 30, strokeWidth: 5, fontSize: 18, labelSize: 10 },
  md: { viewBox: 120, radius: 45, strokeWidth: 7, fontSize: 26, labelSize: 11 },
  lg: { viewBox: 180, radius: 70, strokeWidth: 9, fontSize: 40, labelSize: 13 },
};

function getScoreGradientId(score: number, id: string): { id: string; colors: [string, string] } {
  if (score >= 75) return { id: `${id}-green`, colors: ["#10b981", "#34d399"] };
  if (score >= 50) return { id: `${id}-amber`, colors: ["#f59e0b", "#fbbf24"] };
  return { id: `${id}-red`, colors: ["#f43f5e", "#fb7185"] };
}

export default function ScoreMeter({
  score,
  size = "md",
  label,
  sublabel,
  className,
  animated = true,
}: ScoreMeterProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const { viewBox, radius, strokeWidth, fontSize, labelSize } = SIZE_CONFIG[size];
  const center = viewBox / 2;

  // Circumference and stroke math
  const circumference = 2 * Math.PI * radius;
  const arcPercent = 0.75; // 270 degrees of arc
  const arcLength = circumference * arcPercent;
  const offset = arcLength - (arcLength * displayScore) / 100;

  // Rotation to start arc from bottom-left
  const startAngle = 135;

  const gradientConfig = getScoreGradientId(score, `meter-${label?.replace(/\s/g, "") ?? "score"}`);

  // Animate count-up
  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }
    setDisplayScore(0);
    let start = 0;
    const duration = 1200;
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = score / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score, animated]);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative">
        <svg
          width={viewBox}
          height={viewBox}
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          className="-rotate-[0deg]"
        >
          <defs>
            <linearGradient
              id={gradientConfig.id}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={gradientConfig.colors[0]} />
              <stop offset="100%" stopColor={gradientConfig.colors[1]} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
          />

          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientConfig.id})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
            className="score-ring transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${gradientConfig.colors[0]}60)`,
            }}
          />

          {/* Score text */}
          <text
            x={center}
            y={center - 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fontWeight="700"
            fill={gradientConfig.colors[0]}
            className="font-mono"
          >
            {displayScore}
          </text>

          {/* /100 text */}
          <text
            x={center}
            y={center + fontSize * 0.7}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={labelSize}
            fill="rgba(148, 163, 184, 0.5)"
            className="font-mono"
          >
            / 100
          </text>
        </svg>
      </div>

      {label && (
        <p className="text-xs font-medium text-slate-400 text-center">{label}</p>
      )}
      {sublabel && (
        <p className="text-[10px] text-slate-600 text-center">{sublabel}</p>
      )}
    </div>
  );
}
