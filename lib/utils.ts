import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { InvestmentDecision } from "@/types";

// Tailwind class merger utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// Number Formatting Utilities
// ============================================================

export function formatCurrency(
  value: number,
  currency = "USD",
  compact = true
): string {
  if (!isFinite(value) || isNaN(value)) return "N/A";

  if (compact) {
    if (Math.abs(value) >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    }
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    }
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, compact = true): string {
  if (!isFinite(value) || isNaN(value)) return "N/A";

  if (compact) {
    if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  }

  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  if (!isFinite(value) || isNaN(value)) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatRatio(value: number, decimals = 2): string {
  if (!isFinite(value) || isNaN(value)) return "N/A";
  return value.toFixed(decimals) + "x";
}

// ============================================================
// Date Utilities
// ============================================================

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

// ============================================================
// Score / Decision Utilities
// ============================================================

export function getDecisionColor(decision: InvestmentDecision): string {
  switch (decision) {
    case "invest":
      return "text-emerald-400";
    case "hold":
      return "text-amber-400";
    case "pass":
      return "text-rose-400";
    default:
      return "text-gray-400";
  }
}

export function getDecisionBg(decision: InvestmentDecision): string {
  switch (decision) {
    case "invest":
      return "bg-emerald-500/20 border-emerald-500/40";
    case "hold":
      return "bg-amber-500/20 border-amber-500/40";
    case "pass":
      return "bg-rose-500/20 border-rose-500/40";
    default:
      return "bg-gray-500/20 border-gray-500/40";
  }
}

export function getDecisionLabel(decision: InvestmentDecision): string {
  switch (decision) {
    case "invest":
      return "INVEST";
    case "hold":
      return "HOLD";
    case "pass":
      return "PASS";
    default:
      return "UNKNOWN";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}

export function getScoreGradient(score: number): string {
  if (score >= 75) return "from-emerald-500 to-green-400";
  if (score >= 50) return "from-amber-500 to-yellow-400";
  return "from-rose-500 to-red-400";
}

export function getRiskLevel(
  riskScore: number
): "low" | "medium" | "high" {
  // Note: In our schema, higher riskScore = LOWER risk (safety score)
  if (riskScore >= 65) return "low";
  if (riskScore >= 40) return "medium";
  return "high";
}

export function getRiskColor(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "low":
      return "text-emerald-400";
    case "medium":
      return "text-amber-400";
    case "high":
      return "text-rose-400";
  }
}

// ============================================================
// Company Utilities
// ============================================================

export function getCompanyLogoUrl(symbol: string): string {
  return `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
}

export function generateSearchId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function sanitizeCompanyName(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9\s\-&.]/g, "").substring(0, 100);
}

// ============================================================
// Local Storage Utilities (client-side)
// ============================================================

export const HISTORY_KEY = "ai_investment_history";
export const BOOKMARKS_KEY = "ai_investment_bookmarks";

export function saveToHistory(
  item: import("@/types").SearchHistoryItem
): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getHistory();
    const filtered = existing.filter((h) => h.symbol !== item.symbol);
    const updated = [item, ...filtered].slice(0, 20); // Keep last 20
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Fail silently
  }
}

export function getHistory(): import("@/types").SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export function addBookmark(
  item: import("@/types").SearchHistoryItem
): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getBookmarks();
    const isBookmarked = existing.some((b) => b.symbol === item.symbol);
    if (!isBookmarked) {
      const updated = [item, ...existing];
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    }
  } catch {
    // Fail silently
  }
}

export function removeBookmark(symbol: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getBookmarks();
    const updated = existing.filter((b) => b.symbol !== symbol);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch {
    // Fail silently
  }
}

export function getBookmarks(): import("@/types").SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(symbol: string): boolean {
  return getBookmarks().some((b) => b.symbol === symbol);
}
