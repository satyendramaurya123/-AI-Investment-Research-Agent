"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  BookMarked,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  Clock,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHistory, getBookmarks, clearHistory } from "@/lib/utils";
import type { SearchHistoryItem, InvestmentDecision } from "@/types";

function DecisionBadge({ decision }: { decision: InvestmentDecision }) {
  const config = {
    invest: { variant: "invest" as const, icon: TrendingUp },
    hold: { variant: "hold" as const, icon: Minus },
    pass: { variant: "pass" as const, icon: TrendingDown },
  };
  const { variant, icon: Icon } = config[decision];
  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-2.5 w-2.5" />
      {decision}
    </Badge>
  );
}

export default function Sidebar() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<SearchHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"history" | "bookmarks">("history");

  useEffect(() => {
    setHistory(getHistory());
    setBookmarks(getBookmarks());

    // Refresh when localStorage changes
    const handleStorageChange = () => {
      setHistory(getHistory());
      setBookmarks(getBookmarks());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const items = activeTab === "history" ? history : bookmarks;

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-slate-800/60 bg-slate-950/50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full p-4">
        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-slate-900/60 border border-slate-800/60 p-0.5 mb-4">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
              activeTab === "history"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Clock className="h-3 w-3" />
            History
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
              activeTab === "bookmarks"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Bookmark className="h-3 w-3" />
            Saved
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {activeTab === "history" ? (
              <History className="h-4 w-4 text-indigo-400" />
            ) : (
              <BookMarked className="h-4 w-4 text-indigo-400" />
            )}
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {activeTab === "history" ? "Recent Searches" : "Bookmarked"}
            </span>
            {items.length > 0 && (
              <span className="rounded-full bg-indigo-600/20 border border-indigo-500/30 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400">
                {items.length}
              </span>
            )}
          </div>
          {activeTab === "history" && items.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClearHistory}
              className="h-6 w-6 text-slate-600 hover:text-rose-400"
              title="Clear history"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              {activeTab === "history" ? (
                <History className="h-8 w-8 text-slate-700" />
              ) : (
                <BookMarked className="h-8 w-8 text-slate-700" />
              )}
              <p className="text-xs text-slate-600">
                {activeTab === "history"
                  ? "No recent searches yet"
                  : "No bookmarks saved yet"}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/result?company=${encodeURIComponent(item.company)}`}
                className="group flex flex-col gap-1 rounded-lg p-2.5 border border-transparent hover:border-slate-700/60 hover:bg-slate-800/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white truncate flex-1 mr-2">
                    {item.company}
                  </span>
                  <DecisionBadge decision={item.decision} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    {item.symbol}
                  </span>
                  <span className="text-xs text-slate-600">
                    {item.overallScore}/100
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
