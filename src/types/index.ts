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
    id: 'light',
    name: 'Light',
    colors: {
      background: '#ffffff',
      foreground: '#37352f',
      cardBg: '#fbfbfa',
      cardHover: '#f1f1ef',
      border: '#e9e9e7',
      accent: '#2383e2',
      accentHover: '#1a6fc2',
      danger: '#e03e3e',
      success: '#0f9b58',
      muted: '#9b9a97',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: '#191919',
      foreground: '#ffffffcf',
      cardBg: '#252525',
      cardHover: '#2f2f2f',
      border: '#373737',
      accent: '#2383e2',
      accentHover: '#1a6fc2',
      danger: '#ff6b6b',
      success: '#4cc38a',
      muted: '#9b9a97',
    },
  },
];

// Raw Supabase row shapes (snake_case, flat)
export interface DbFolder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
}

export interface DbChecklist {
  id: string;
  user_id: string;
  folder_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface DbTask {
  id: string;
  user_id: string;
  checklist_id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  position: number;
  created_at: string;
}

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
