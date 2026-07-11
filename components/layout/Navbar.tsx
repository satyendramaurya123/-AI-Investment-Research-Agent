"use client";

import Link from "next/link";
import { BrainCircuit, BookMarked, History, BarChart3, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-110">
            <BrainCircuit className="h-5 w-5 text-white" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse border-2 border-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-white leading-tight tracking-tight">
              InvestIQ
            </span>
            <span className="text-[10px] text-indigo-400 leading-tight font-medium tracking-wider uppercase">
              AI Research Agent
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition-all hover:bg-slate-800/60 hover:text-slate-200"
          >
            <BarChart3 className="h-4 w-4" />
            Analyze
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition-all hover:bg-slate-800/60 hover:text-slate-200"
          >
            <History className="h-4 w-4" />
            History
          </Link>
          <Link
            href="/bookmarks"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition-all hover:bg-slate-800/60 hover:text-slate-200"
          >
            <BookMarked className="h-4 w-4" />
            Bookmarks
          </Link>
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden md:block">
            <Button variant="gradient" size="sm" className="shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="h-3.5 w-3.5" />
              Analyze Now
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/60 bg-slate-950/95 backdrop-blur-xl">
          <div className="flex flex-col gap-1 px-4 py-3">
            {[
              { href: "/", label: "Analyze", icon: BarChart3 },
              { href: "/history", label: "Search History", icon: History },
              { href: "/bookmarks", label: "Bookmarks", icon: BookMarked },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
              >
                <Icon className="h-4 w-4 text-indigo-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
