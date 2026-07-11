"use client";

import { useState, useRef, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXAMPLE_COMPANIES } from "@/lib/constants";
import { sanitizeCompanyName } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  isLoading?: boolean;
  onSubmit?: (company: string) => void;
  compact?: boolean;
}

export default function SearchBar({
  defaultValue = "",
  isLoading = false,
  onSubmit,
  compact = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = sanitizeCompanyName(query);
      if (!trimmed || isLoading) return;

      if (onSubmit) {
        onSubmit(trimmed);
      } else {
        router.push(`/result?company=${encodeURIComponent(trimmed)}`);
      }
    },
    [query, isLoading, onSubmit, router]
  );

  const handleExampleClick = useCallback(
    (name: string) => {
      setQuery(name);
      inputRef.current?.focus();
      if (onSubmit) {
        onSubmit(name);
      } else {
        router.push(`/result?company=${encodeURIComponent(name)}`);
      }
    },
    [onSubmit, router]
  );

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
            focused
              ? "border-indigo-500/60 bg-slate-900/80 shadow-lg shadow-indigo-500/10"
              : "border-slate-700/60 bg-slate-900/50"
          } ${compact ? "rounded-xl" : ""}`}
        >
          {/* Search Icon */}
          <div className="absolute left-4 flex items-center pointer-events-none">
            <Search
              className={`transition-colors duration-200 ${
                focused ? "text-indigo-400" : "text-slate-500"
              } ${compact ? "h-4 w-4" : "h-5 w-5"}`}
            />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={
              compact
                ? "Search company..."
                : "Enter company name (e.g. Apple, Tesla, NVIDIA...)"
            }
            className={`w-full bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none ${
              compact
                ? "h-10 pl-10 pr-28 text-sm"
                : "h-14 pl-12 pr-32 text-base"
            }`}
            disabled={isLoading}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />

          {/* Submit Button */}
          <div className={`absolute right-2 ${compact ? "" : "right-2"}`}>
            <Button
              type="submit"
              variant="gradient"
              size={compact ? "sm" : "default"}
              loading={isLoading}
              disabled={!query.trim() || isLoading}
              className={compact ? "h-7 px-3 text-xs" : "h-10 px-5"}
            >
              {isLoading ? (
                "Analyzing..."
              ) : (
                <>
                  Analyze
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Quick Example Buttons */}
      {!compact && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <BrainCircuit className="h-3.5 w-3.5 text-indigo-500" />
            Try:
          </span>
          {EXAMPLE_COMPANIES.map((company) => (
            <button
              key={company.symbol}
              onClick={() => handleExampleClick(company.name)}
              disabled={isLoading}
              className="group flex items-center gap-1.5 rounded-full border border-slate-700/50 bg-slate-800/40 px-3 py-1 text-xs text-slate-400 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-mono text-[10px] text-slate-600 group-hover:text-indigo-500/60">
                {company.symbol}
              </span>
              {company.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
