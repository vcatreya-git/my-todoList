export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: Date;
}

export interface Checklist {
  id: string;
  name: string;
  folderId: string;
  tasks: Task[];
  createdAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  checklists: Checklist[];
  createdAt: Date;
}

export interface SearchResult {
  type: 'folder' | 'checklist' | 'task';
  id: string;
  name: string;
  parentId?: string;
  grandParentId?: string;
  color?: string;
}

export type ThemeId = 'dark' | 'light' | 'midnight' | 'forest' | 'sunset';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    background: string;
    foreground: string;
    cardBg: string;
    cardHover: string;
    border: string;
    accent: string;
    accentHover: string;
    danger: string;
    success: string;
    muted: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: '#0f0f0f',
      foreground: '#ededed',
      cardBg: '#1a1a1a',
      cardHover: '#252525',
      border: '#2a2a2a',
      accent: '#3b82f6',
      accentHover: '#2563eb',
      danger: '#ef4444',
      success: '#22c55e',
      muted: '#6b7280',
    },
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      background: '#f5f5f5',
      foreground: '#171717',
      cardBg: '#ffffff',
      cardHover: '#f0f0f0',
      border: '#e5e5e5',
      accent: '#3b82f6',
      accentHover: '#2563eb',
      danger: '#ef4444',
      success: '#22c55e',
      muted: '#6b7280',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      background: '#0f172a',
      foreground: '#e2e8f0',
      cardBg: '#1e293b',
      cardHover: '#334155',
      border: '#334155',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      danger: '#f43f5e',
      success: '#10b981',
      muted: '#64748b',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      background: '#0c1a0f',
      foreground: '#e2f5e6',
      cardBg: '#132517',
      cardHover: '#1a3320',
      border: '#234529',
      accent: '#22c55e',
      accentHover: '#16a34a',
      danger: '#ef4444',
      success: '#4ade80',
      muted: '#6b8a70',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      background: '#1a0f0f',
      foreground: '#fce7e7',
      cardBg: '#2a1515',
      cardHover: '#3a2020',
      border: '#4a2a2a',
      accent: '#f97316',
      accentHover: '#ea580c',
      danger: '#ef4444',
      success: '#22c55e',
      muted: '#8a6b6b',
    },
  },
];

export const FOLDER_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#6b7280', // gray
];
