'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './theme-provider';

export function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-foreground">
              Good morning 👋
            </h2>
            <p className="text-sm text-muted-foreground">Ready to conquer today&apos;s quests?</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            🔔
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors hidden sm:block"
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <Link
            href="/profile"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold"
          >
            A
          </Link>
        </div>
      </div>

      {notificationsOpen && (
        <div className="absolute right-6 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl p-4">
          <h3 className="font-semibold mb-3">Notifications</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Quest completed!</p>
              <p className="text-xs text-muted-foreground">Daily coding challenge finished</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">New achievement unlocked</p>
              <p className="text-xs text-muted-foreground">Early bird streak - 7 days</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
