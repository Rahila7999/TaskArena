'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './theme-provider';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Projects', href: '/projects', icon: '📁' },
  { name: 'My Tasks', href: '/tasks', icon: '✅' },
  { name: 'Calendar', href: '/calendar', icon: '📅' },
  { name: 'Sprints', href: '/sprints', icon: '⚡' },
  { name: 'Team', href: '/team', icon: '👥' },
  { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
  { name: 'Achievements', href: '/achievements', icon: '🎖️' },
  { name: 'Rewards', href: '/rewards', icon: '🎁' },
  { name: 'Challenges', href: '/challenges', icon: '🎯' },
  { name: 'Notifications', href: '/notifications', icon: '🔔' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: '🛡️' },
  { name: 'Users', href: '/admin/users', icon: '👤' },
  { name: 'Projects', href: '/admin/projects', icon: '📁' },
  { name: 'Achievements', href: '/admin/achievements', icon: '🎖️' },
  { name: 'Rewards', href: '/admin/rewards', icon: '🎁' },
  { name: 'Challenges', href: '/admin/challenges', icon: '🎯' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      <aside className={`
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-40 w-[280px] bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen
      `}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">TaskArena</h1>
              <p className="text-xs text-muted-foreground">Professional Edition</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Main
            </h3>
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Admin
            </h3>
            <div className="space-y-1">
              {adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Alex Rivera</p>
              <p className="text-xs text-muted-foreground">Product Manager</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
