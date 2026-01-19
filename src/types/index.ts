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

export type ThemeId = 'dark' | 'light';

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
      background: '#13131a',
      foreground: '#e4e4e7',
      cardBg: '#1c1c24',
      cardHover: '#25252e',
      border: '#2d2d38',
      accent: '#818cf8',
      accentHover: '#6366f1',
      danger: '#fca5a5',
      success: '#6ee7b7',
      muted: '#9ca3af',
    },
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      background: '#fafafa',
      foreground: '#27272a',
      cardBg: '#ffffff',
      cardHover: '#f4f4f5',
      border: '#e4e4e7',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      danger: '#dc2626',
      success: '#16a34a',
      muted: '#71717a',
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
