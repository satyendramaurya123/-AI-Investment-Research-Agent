"use client";

import Image from "next/image";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Globe,
  Users,
  Share2,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatPercent,
  isBookmarked,
  addBookmark,
  removeBookmark,
  generateSearchId,
} from "@/lib/utils";
import type { AnalysisResult } from "@/types";

interface CompanyHeaderProps {
  result: AnalysisResult;
  onShare?: () => void;
}

export default function CompanyHeader({ result, onShare }: CompanyHeaderProps) {
  const [imgError, setImgError] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(result.symbol));

  const isPositive = result.change >= 0;

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(result.symbol);
      setBookmarked(false);
    } else {
      addBookmark({
        id: generateSearchId(),
        company: result.company,
        symbol: result.symbol,
        decision: result.decision,
        overallScore: result.overallScore,
        confidence: result.confidence,
        analyzedAt: result.analyzedAt,
        logo: result.logo,
      });
      setBookmarked(true);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-6 shadow-2xl">
      {/* Top Row: Logo + Name + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-slate-700/40 overflow-hidden shadow-lg">
            {!imgError && result.logo ? (
              <Image
                src={result.logo}
                alt={result.company}
                width={56}
                height={56}
                className="object-contain p-1"
                onError={() => setImgError(true)}
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30">
                <span className="text-xl font-black text-white/80">
                  {result.symbol.substring(0, 2)}
                </span>
              </div>
            )}
          </div>

          {/* Name + Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-white leading-tight">
                {result.company}
              </h1>
              <Badge variant="secondary" className="font-mono text-xs">
                {result.symbol}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {result.exchange}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {result.sector && result.sector !== "N/A" && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {result.sector}
                </span>
              )}
              {result.industry && result.industry !== "N/A" && (
                <span className="text-xs text-slate-500">
                  · {result.industry}
                </span>
              )}
              {result.headquarters && result.headquarters !== "N/A" && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {result.headquarters}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBookmark}
            className={bookmarked ? "text-amber-400 border-amber-500/40" : ""}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <BookmarkPlus className="h-4 w-4" />
            )}
            {bookmarked ? "Saved" : "Save"}
          </Button>
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Price Row */}
      {result.currentPrice > 0 && (
        <div className="mt-4 flex flex-wrap items-end gap-6">
          {/* Current Price */}
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Current Price</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">
                {formatCurrency(result.currentPrice, result.currency, false)}
              </span>
              <div
                className={`flex items-center gap-0.5 rounded-md px-2 py-0.5 text-sm font-semibold ${
                  isPositive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {formatPercent(result.changePercent)}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            {[
              { label: "Market Cap", value: formatCurrency(result.marketCap) },
              { label: "Revenue", value: formatCurrency(result.revenue) },
              {
                label: "P/E Ratio",
                value: result.pe ? `${result.pe.toFixed(1)}x` : "N/A",
              },
              {
                label: "52-Week Range",
                value:
                  result.high52Week && result.low52Week
                    ? `$${result.low52Week.toFixed(0)} - $${result.high52Week.toFixed(0)}`
                    : "N/A",
              },
              { label: "EPS", value: result.eps ? `$${result.eps.toFixed(2)}` : "N/A" },
              {
                label: "Gross Margin",
                value: result.grossMargin
                  ? `${result.grossMargin.toFixed(1)}%`
                  : "N/A",
              },
              {
                label: "Net Margin",
                value: result.netMargin
                  ? `${result.netMargin.toFixed(1)}%`
                  : "N/A",
              },
              {
                label: "Free Cash Flow",
                value: result.freeCashFlow
                  ? formatCurrency(result.freeCashFlow)
                  : "N/A",
              },
            ].map(({ label, value }) => (
              <div key={label} className="min-w-0">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider truncate">
                  {label}
                </p>
                <p className="text-sm font-semibold text-slate-200 truncate">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CEO & Website */}
      {(result.ceo !== "N/A" || result.website) && (
        <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800/60">
          {result.ceo !== "N/A" && (
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-600" />
              CEO:{" "}
              <span className="text-slate-300 font-medium">{result.ceo}</span>
            </span>
          )}
          {result.website && (
            <a
              href={result.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors"
            >
              <Globe className="h-3 w-3" />
              {result.website.replace(/https?:\/\/www\.?/, "")}
            </a>
          )}
          <span className="text-xs text-slate-600 ml-auto">
            Analyzed: {new Date(result.analyzedAt).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
