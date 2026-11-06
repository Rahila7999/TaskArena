'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, ChevronDown, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';
import { UserAvatar } from './ui/user-avatar';

export function Header() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: '/login' });
  };

  const userName = session?.user?.name || 'Warrior';
  const userEmail = session?.user?.email || '';
  const userAvatar = session?.user?.avatar || session?.user?.image || '';
  const userRole = session?.user?.role || 'Employee';
  const userLevel = session?.user?.level || 1;

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-foreground">
              Good day, {userName} 👋
            </h2>
            <p className="text-xs text-muted-foreground">Ready to conquer today&apos;s quests?</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>

          {/* User Profile Menu or Guest Auth Links */}
          {status === 'authenticated' && session?.user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-muted/60 hover:bg-muted border border-border transition-all cursor-pointer"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <UserAvatar name={userName} avatar={userAvatar} size="sm" />
                <span className="text-xs font-semibold text-foreground hidden sm:block max-w-[120px] truncate">
                  {userName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* User info summary */}
                  <div className="p-3 border-b border-border/80 mb-1">
                    <p className="text-sm font-bold text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {userRole}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Level {userLevel}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                    role="menuitem"
                  >
                    <User className="w-4 h-4 text-blue-500" />
                    <span>My Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-60"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : status === 'unauthenticated' ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition-all"
              >
                Join Arena
              </Link>
            </div>
          ) : (
            /* Loading placeholder */
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          )}
        </div>
      </div>

      {/* Notifications Drawer */}
      {notificationsOpen && (
        <div className="absolute right-6 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl p-4 z-40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
            <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              Live Quests
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-muted/60 border border-border/60">
              <p className="text-xs font-semibold text-foreground">Quest completed! 🎉</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Hinglish: Task complete ho gaya! +50 XP gained</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/60 border border-border/60">
              <p className="text-xs font-semibold text-foreground">Streak Alert 🔥</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Keep pushing! Your daily streak is active</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
