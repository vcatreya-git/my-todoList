'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Palette, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeSwitcherProps {
  isCompact?: boolean;
}

export default function ThemeSwitcher({ isCompact = false }: ThemeSwitcherProps) {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl hover:bg-white/5 transition-colors ${
          isCompact ? 'p-2 justify-center w-full' : 'px-3 py-2'
        }`}
        title="Change theme"
      >
        <Palette className="w-4 h-4 text-[var(--muted)]" />
        {!isCompact && (
          <>
            <span className="text-sm text-[var(--foreground)] flex-1">{theme.name}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {isOpen && (
        <div className={`absolute ${isCompact ? 'left-full ml-2 bottom-0' : 'left-0 bottom-full mb-2'} w-52 bg-[var(--card-solid)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden`}>
          <div className="p-2">
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Select Theme
            </p>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  theme.id === t.id
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'hover:bg-white/5 text-[var(--foreground)]'
                }`}
              >
                <div className="flex gap-0.5">
                  <div
                    className="w-3 h-3 rounded-full ring-1 ring-white/10"
                    style={{ backgroundColor: t.colors.background }}
                  />
                  <div
                    className="w-3 h-3 rounded-full ring-1 ring-white/10 -ml-1"
                    style={{ backgroundColor: t.colors.accent }}
                  />
                  <div
                    className="w-3 h-3 rounded-full ring-1 ring-white/10 -ml-1"
                    style={{ backgroundColor: t.colors.cardBg }}
                  />
                </div>
                <span className="flex-1 text-sm font-medium">{t.name}</span>
                {theme.id === t.id && (
                  <Check className="w-4 h-4 text-[var(--accent)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
