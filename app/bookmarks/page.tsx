"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookMarked,
  Trash2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getBookmarks,
  removeBookmark,
  formatDate,
} from "@/lib/utils";
import type { SearchHistoryItem, InvestmentDecision } from "@/types";
import ScoreMeter from "@/components/ScoreMeter";

const DECISION_ICONS = {
  invest: TrendingUp,
  hold: Minus,
  pass: TrendingDown,
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleRemove = (symbol: string) => {
    removeBookmark(symbol);
    setBookmarks(getBookmarks());
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Bookmarks</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {bookmarks.length} saved{" "}
            {bookmarks.length === 1 ? "analysis" : "analyses"}
          </p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <Card variant="glass">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <BookMarked className="h-12 w-12 text-slate-700" />
            <p className="text-slate-500">No bookmarks saved yet</p>
            <p className="text-xs text-slate-600">
              Click the bookmark icon on any result page to save it here
            </p>
            <Link href="/">
              <Button variant="gradient">Analyze a Company</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((item) => {
            const Icon =
              DECISION_ICONS[item.decision as InvestmentDecision] ?? Minus;

            return (
              <Card
                key={item.id}
                variant="glass"
                className="hover:border-indigo-500/30 transition-all duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <ScoreMeter score={item.overallScore} size="sm" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-200 truncate">
                          {item.company}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs shrink-0"
                        >
                          {item.symbol}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge
                          variant={
                            item.decision as "invest" | "hold" | "pass"
                          }
                          className="flex items-center gap-1"
                        >
                          <Icon className="h-2.5 w-2.5" />
                          {item.decision.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {item.confidence}% confidence
                        </span>
                        <span className="text-xs text-slate-600">
                          {formatDate(item.analyzedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemove(item.symbol)}
                        className="text-slate-600 hover:text-rose-400"
                        title="Remove bookmark"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Link
                        href={`/result?company=${encodeURIComponent(
                          item.company
                        )}`}
                      >
                        <Button variant="ghost" size="icon-sm">
                          <ArrowRight className="h-4 w-4 text-slate-500 hover:text-indigo-400 transition-colors" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
