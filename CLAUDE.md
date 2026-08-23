# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js + Turbopack) at http://localhost:3000
npm run build    # Production build — run this to verify no TypeScript/lint errors
npm run lint     # ESLint check
npm run start    # Serve production build
```

No test suite exists. Use `npm run build` to validate changes compile cleanly.

If the dev server is already running on port 3000, kill it first: `pkill -f "next dev"`

## Environment

Requires a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture

### Data model (three levels deep)
`Folder → Checklist → Task` — the entire tree is stored in Supabase and held in React state as a nested object tree. `src/types/index.ts` defines both the app-side interfaces (`Folder`, `Checklist`, `Task`) and the flat Supabase row shapes (`DbFolder`, `DbChecklist`, `DbTask`).

### State management
All data mutations flow through `TodoContext` (`src/context/TodoContext.tsx`). The pattern throughout is **optimistic update → fire Supabase mutation → rollback on error**. A `foldersRef` is kept in sync with state so reorder callbacks (which use `setTimeout`) can read the latest positions without stale closure issues.

On first login, if Supabase has no data for the user, `TodoContext` checks `localStorage` for legacy data and migrates it to Supabase automatically.

### Context providers (in layout wrapping order)
`ThemeProvider → AuthProvider → TodoProvider`

- `AuthContext`: wraps Supabase auth, exposes `user`, `signInWithEmail`, `signUpWithEmail`, `signInWithMagicLink`, `signOut`
- `ThemeContext`: reads/writes theme to `localStorage`, applies CSS custom properties directly to `:root` via `applyTheme()`
- `TodoContext`: loads data from Supabase on auth change, exposes all CRUD operations

### Routing
- `/` — landing page (marketing)
- `/login` — sign-in / sign-up / magic-link tabs
- `/dashboard` — main app (auth-guarded; redirects to `/login` if no user)

### Styling system
Tailwind CSS v4 with `@import "tailwindcss"` (not the v3 plugin syntax). Custom properties are defined in `globals.css` under `:root` and exposed to Tailwind via `@theme inline`. **Never use hardcoded colors or `bg-white/5` opacity hacks** — always use semantic variables like `var(--card-hover)`, `var(--border)`, `var(--foreground)` so light and dark themes both work.

Theme palette (Notion-inspired):
- Light: `--background: #ffffff`, `--background-secondary: #f7f6f3`, `--foreground: #37352f`, `--card-hover: #f1f1ef`, `--accent: #2383e2`
- Dark: `--background: #191919`, `--foreground: #ffffffcf`, `--card-hover: #2f2f2f`

Primary action buttons use `bg-[var(--foreground)] text-[var(--background)]` (charcoal on light, near-white on dark) — **not** `bg-[var(--accent)]` blue.

### Fonts
Inter (weights 300–700) and JetBrains Mono loaded via `next/font/google` with CSS variables `--font-inter` and `--font-jetbrains-mono`. The `@theme inline` block maps these to `--font-sans` and `--font-mono`. Body must have `font-sans` class for Tailwind to apply Inter.

### Drag and drop
`@dnd-kit/core` + `@dnd-kit/sortable` handles reordering at all three levels. Each `DndContext` is scoped: folder-level DnD lives in `FolderList`, checklist-level in `ChecklistList`, task-level inside `ChecklistItem`. After drag ends, positions are synced to Supabase via `upsert`.

### Mobile layout
Dashboard uses a CSS transform slide-in sidebar: `fixed top-[57px] bottom-0 left-0 z-50` on mobile, `md:static` on desktop. The `mobileSidebarOpen` state in `dashboard/page.tsx` controls a `-translate-x-full` / `translate-x-0` toggle with a backdrop overlay.

### Date picker
Date inputs use `<label>` wrapping `<input type="date" className="sr-only">` — **not** `showPicker()` or `getElementById`. The label acts as the visible trigger; clicking it natively opens the date picker.
