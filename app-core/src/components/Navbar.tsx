'use client';

import React from 'react';
import { MockUser } from '@/lib/mock-session';
import { UserCheck, BookOpen, Wallet } from 'lucide-react';

interface NavbarProps {
  currentUser: MockUser;
  onUserChange?: (user: MockUser) => void;
  title?: string;
  subtitle?: string;
}

export function Navbar({
  currentUser,
  title = 'Coconut Lab',
  subtitle = 'Clean Architecture Workbench',
}: NavbarProps) {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80"
      suppressHydrationWarning
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        suppressHydrationWarning
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3" suppressHydrationWarning>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                Live TC
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions: Session Role & Docs Link */}
        <div className="flex items-center gap-3">
          {/* Docs Portal Link (Consistently Port 7001) */}
          <a
            href="http://localhost:7001"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200 dark:border-slate-800 transition-colors"
            title="Open Docusaurus Living SSOT on port 7001"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Living Docs (7001)</span>
          </a>

          {/* Single Simulated User Static Badge (100% SSOT Compliant) */}
          <div
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs"
            title={`${currentUser.name} (${currentUser.email})`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              Simulated User:
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {currentUser.name}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
