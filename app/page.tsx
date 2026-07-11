import {
  BrainCircuit,
  TrendingUp,
  Shield,
  Newspaper,
  Building2,
  Lightbulb,
  BarChart3,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { Badge } from "@/components/ui/badge";
import { EXAMPLE_COMPANIES } from "@/lib/constants";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Financial Analysis",
    description: "Deep-dive into revenue, profit, EPS, cash flow, and valuation ratios with AI reasoning.",
    color: "text-indigo-400",
    bg: "bg-indigo-600/10",
    border: "border-indigo-500/20",
  },
  {
    icon: Newspaper,
    title: "News Intelligence",
    description: "Real-time news scanning with AI sentiment analysis, key event detection, and narrative building.",
    color: "text-cyan-400",
    bg: "bg-cyan-600/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Building2,
    title: "Business Analysis",
    description: "SWOT analysis, competitive moat assessment, product portfolio evaluation, and market positioning.",
    color: "text-purple-400",
    bg: "bg-purple-600/10",
    border: "border-purple-500/20",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Quantified risk scoring across competition, debt, regulatory, geopolitical, and market dimensions.",
    color: "text-amber-400",
    bg: "bg-amber-600/10",
    border: "border-amber-500/20",
  },
  {
    icon: Lightbulb,
    title: "Investment Decision",
    description: "AI-synthesized INVEST / HOLD / PASS recommendation with confidence score and detailed reasoning.",
    color: "text-emerald-400",
    bg: "bg-emerald-600/10",
    border: "border-emerald-500/20",
  },
  {
    icon: BarChart3,
    title: "Visual Reports",
    description: "Interactive charts, score meters, news cards, and exportable PDF/JSON reports.",
    color: "text-rose-400",
    bg: "bg-rose-600/10",
    border: "border-rose-500/20",
  },
];

const WORKFLOW_STEPS = [
  { step: "01", label: "Enter Company", desc: "Type any public company name" },
  { step: "02", label: "Data Collection", desc: "Real-time financial & news data" },
  { step: "03", label: "AI Analysis", desc: "5 specialized agents run in sequence" },
  { step: "04", label: "Decision", desc: "INVEST / HOLD / PASS with confidence" },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/5 blur-3xl" />
        <div className="absolute top-20 -right-20 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-cyan-600/5 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-600/10 px-4 py-1.5 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            <span className="text-indigo-300 font-medium">
             
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-[1.1]">
          AI Investment{" "}
          <span className="gradient-text">Research Agent</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-slate-400 mb-8 leading-relaxed">
          Enter any public company name and our multi-agent AI system instantly
          conducts analyst-grade research — financial analysis, news sentiment,
          business evaluation, risk assessment, and a final investment recommendation.
        </p>

        {/* Search Bar */}
        <div className="mx-auto max-w-2xl mb-4">
          <SearchBar />
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-600">
          {["5 AI Agents", "Real-time Data", "Free to Use", "No Signup Required"].map(
            (item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-indigo-500" />
                {item}
              </span>
            )
          )}
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-0">
          {WORKFLOW_STEPS.map((item, idx) => (
            <div key={item.step} className="flex items-center">
              <div className="flex flex-col items-center gap-2 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15 border border-indigo-500/20">
                  <span className="text-sm font-black text-indigo-400 font-mono">
                    {item.step}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-200 text-center whitespace-nowrap">
                  {item.label}
                </p>
                <p className="text-xs text-slate-600 text-center max-w-[120px]">
                  {item.desc}
                </p>
              </div>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <ArrowRight className="h-4 w-4 text-slate-700 shrink-0 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Institutional-Grade Research,{" "}
            <span className="gradient-text">Automated</span>
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Our 5-agent LangGraph workflow mirrors how professional investment analysts approach company research.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group rounded-xl border ${feature.border} ${feature.bg} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg} border ${feature.border}`}
                >
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Enterprise AI Stack
                </h3>
                <p className="text-xs text-slate-500">
                  Production-ready multi-agent architecture
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Next.js 15",
                "LangGraph",
                "Groq",
                "LangChain.js",
                "TypeScript",
                "Recharts",
              ].map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "AI Agents", value: "5" },
              { label: "Data Sources", value: "4+" },
              { label: "Analysis Dimensions", value: "20+" },
              { label: "Report Format", value: "JSON + PDF" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="text-center rounded-lg bg-slate-800/40 border border-slate-700/30 py-3 px-4"
              >
                <p className="text-xl font-black gradient-text">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Companies CTA */}
      <section className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-slate-500 mb-3 flex items-center justify-center gap-2">
          <Zap className="h-3.5 w-3.5 text-indigo-400" />
          Popular companies to analyze
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_COMPANIES.map((company) => (
            <Link
              key={company.symbol}
              href={`/result?company=${encodeURIComponent(company.name)}`}
              className="group flex items-center gap-1.5 rounded-full border border-slate-700/50 bg-slate-800/30 px-4 py-2 text-sm text-slate-300 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300"
            >
              <span className="font-mono text-xs text-slate-600 group-hover:text-indigo-500/60">
                {company.symbol}
              </span>
              {company.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
