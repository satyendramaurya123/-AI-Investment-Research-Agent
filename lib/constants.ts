// ============================================================
// Application Constants
// ============================================================

export const APP_NAME = "InvestIQ";
export const APP_DESCRIPTION =
  "AI-powered Investment Research Agent using multi-agent LangGraph workflow";
export const APP_VERSION = "1.0.0";

// ============================================================
// Example Companies for Home Page
// ============================================================

export const EXAMPLE_COMPANIES = [
  { name: "Apple", symbol: "AAPL", logo: "/logos/apple.svg" },
  { name: "Microsoft", symbol: "MSFT", logo: "/logos/microsoft.svg" },
  { name: "NVIDIA", symbol: "NVDA", logo: "/logos/nvidia.svg" },
  { name: "Amazon", symbol: "AMZN", logo: "/logos/amazon.svg" },
  { name: "Tesla", symbol: "TSLA", logo: "/logos/tesla.svg" },
  { name: "Google", symbol: "GOOGL", logo: "/logos/google.svg" },
  { name: "Meta", symbol: "META", logo: "/logos/meta.svg" },
  { name: "Netflix", symbol: "NFLX", logo: "/logos/netflix.svg" },
] as const;

// ============================================================
// Analysis Step Labels
// ============================================================

export const ANALYSIS_STEPS = [
  {
    id: "financial",
    label: "Financial Analysis",
    description: "Analyzing revenue, profit, EPS, cash flow & valuation",
    icon: "TrendingUp",
  },
  {
    id: "business",
    label: "Business Analysis",
    description: "Evaluating business model, SWOT & competitive advantage",
    icon: "Building2",
  },
  {
    id: "risk",
    label: "Risk Assessment",
    description: "Identifying competition, debt & regulatory risks",
    icon: "ShieldAlert",
  },
  {
    id: "decision",
    label: "Investment Decision",
    description: "Generating AI-powered investment recommendation",
    icon: "BrainCircuit",
  },
] as const;

// ============================================================
// API Endpoints
// ============================================================

export const API_ENDPOINTS = {
  ANALYZE: "/api/analyze",
  REPORT: "/api/report",
} as const;

// ============================================================
// Chart Colors
// ============================================================

export const CHART_COLORS = {
  primary: "#6366f1",
  secondary: "#22d3ee",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#f43f5e",
  muted: "#6b7280",
  gradientStart: "#6366f1",
  gradientEnd: "#8b5cf6",
} as const;
