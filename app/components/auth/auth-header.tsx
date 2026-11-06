'use client';

import Link from 'next/link';
import { useTheme } from '@/app/components/theme-provider';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative text-center mb-8">
      {/* Theme toggle in corner */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute -top-4 right-0 p-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-colors text-sm shadow-sm"
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Brand logo & name */}
      <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
          <span className="text-white font-extrabold text-2xl tracking-tight">T</span>
        </div>
        <div className="text-left">
          <span className="font-extrabold text-2xl tracking-tight text-foreground bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            TaskArena
          </span>
          <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
            Workplace Quest Edition
          </span>
        </div>
      </Link>

      <h1 className="text-2xl font-bold text-foreground tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        {subtitle}
      </p>
    </div>
  );
}

