'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeId, THEMES } from '@/types';

interface ThemeContextType {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'todolist-theme';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark = theme.id === 'dark';

  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  root.style.setProperty('--card-bg', theme.colors.cardBg);
  root.style.setProperty('--card-hover', theme.colors.cardHover);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--accent-hover', theme.colors.accentHover);
  root.style.setProperty('--danger', theme.colors.danger);
  root.style.setProperty('--success', theme.colors.success);
  root.style.setProperty('--muted', theme.colors.muted);

  // Set card-solid and glass colors based on theme
  root.style.setProperty('--card-solid', theme.colors.cardBg);
  root.style.setProperty('--gradient-start', theme.colors.accent);
  root.style.setProperty('--gradient-end', theme.colors.accent);

  // Set glassmorphism and track colors
  if (isDark) {
    root.style.setProperty('--glass-bg', 'rgba(28, 28, 36, 0.9)');
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.05)');
    root.style.setProperty('--glass-shadow', 'rgba(0, 0, 0, 0.3)');
    root.style.setProperty('--track-empty', 'rgba(45, 45, 56, 0.6)');
    root.style.setProperty('--danger-muted', 'rgba(252, 165, 165, 0.15)');
    root.style.setProperty('--success-muted', 'rgba(110, 231, 183, 0.15)');
  } else {
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.9)');
    root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.05)');
    root.style.setProperty('--glass-shadow', 'rgba(0, 0, 0, 0.08)');
    root.style.setProperty('--track-empty', 'rgba(228, 228, 231, 0.8)');
    root.style.setProperty('--danger-muted', 'rgba(220, 38, 38, 0.1)');
    root.style.setProperty('--success-muted', 'rgba(22, 163, 74, 0.1)');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('dark');
  const [isHydrated, setIsHydrated] = useState(false);

  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (stored && THEMES.some((t) => t.id === stored)) {
      setThemeId(stored);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      applyTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  }, [theme, themeId, isHydrated]);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
