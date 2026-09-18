'use client';

import { useState, useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted] = useState(() => typeof window !== 'undefined');

  useEffect(() => {
    const savedTheme = localStorage.getItem('taskarena-theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  if (!mounted) {
    return <div>{children}</div>;
  }

  return <div>{children}</div>;
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const savedTheme = localStorage.getItem('taskarena-theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (systemPrefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskarena-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
}
