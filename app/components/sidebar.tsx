'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { useTheme } from './theme-provider';
import { UserAvatar } from './ui/user-avatar';

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
  const { data: session } = useSession();

  const userName = session?.user?.name || 'Warrior';
  const userAvatar = session?.user?.avatar || session?.user?.image || '';
  const userRole = session?.user?.role || 'TaskArena Member';

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
          {session?.user ? (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 border border-border/60">
              <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer">
                <UserAvatar name={userName} avatar={userAvatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-blue-400 transition-colors">
                    {userName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{userRole}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border/60">
              <Link
                href="/login"
                className="text-xs font-semibold text-blue-500 hover:underline"
              >
                Log in to TaskArena
              </Link>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-xs"
                title="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          )}
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
