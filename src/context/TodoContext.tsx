'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Folder, Checklist, Task, SearchResult, DbFolder, DbChecklist, DbTask } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase';

interface TodoContextType {
  folders: Folder[];
  selectedFolderId: string | null;
  selectedChecklistId: string | null;
  searchQuery: string;
  searchResults: SearchResult[];
  isLoading: boolean;
  mutationError: string | null;

  // Folder operations
  addFolder: (name: string, color: string) => void;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  updateFolderColor: (id: string, color: string) => void;
  selectFolder: (id: string | null) => void;
  reorderFolders: (activeId: string, overId: string) => void;

  // Checklist operations
  addChecklist: (folderId: string, name: string) => void;
  deleteChecklist: (folderId: string, checklistId: string) => void;
  renameChecklist: (folderId: string, checklistId: string, name: string) => void;
  selectChecklist: (id: string | null) => void;
  reorderChecklists: (folderId: string, activeId: string, overId: string) => void;

  // Task operations
  addTask: (folderId: string, checklistId: string, title: string, dueDate?: string) => void;
  deleteTask: (folderId: string, checklistId: string, taskId: string) => void;
  toggleTask: (folderId: string, checklistId: string, taskId: string) => void;
  updateTaskDueDate: (folderId: string, checklistId: string, taskId: string, dueDate: string | undefined) => void;
  reorderTasks: (folderId: string, checklistId: string, activeId: string, overId: string) => void;

  // Search
  setSearchQuery: (query: string) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildTree(dbFolders: DbFolder[], dbChecklists: DbChecklist[], dbTasks: DbTask[]): Folder[] {
  const tasksByChecklist = new Map<string, Task[]>();
  for (const t of dbTasks) {
    const arr = tasksByChecklist.get(t.checklist_id) ?? [];
    arr.push({
      id: t.id,
      title: t.title,
      completed: t.completed,
      dueDate: t.due_date ?? undefined,
      createdAt: new Date(t.created_at),
    });
    tasksByChecklist.set(t.checklist_id, arr);
  }

  const checklistsByFolder = new Map<string, Checklist[]>();
  for (const c of dbChecklists) {
    const arr = checklistsByFolder.get(c.folder_id) ?? [];
    arr.push({
      id: c.id,
      name: c.name,
      folderId: c.folder_id,
      tasks: tasksByChecklist.get(c.id) ?? [],
      createdAt: new Date(c.created_at),
    });
    checklistsByFolder.set(c.folder_id, arr);
  }

  return dbFolders.map((f) => ({
    id: f.id,
    name: f.name,
    color: f.color,
    checklists: checklistsByFolder.get(f.id) ?? [],
    createdAt: new Date(f.created_at),
  }));
}

async function migrateLocalStorageData(
  supabase: SupabaseClient,
  userId: string,
  localFolders: Folder[]
) {
  const folderRows: DbFolder[] = [];
  const checklistRows: DbChecklist[] = [];
  const taskRows: DbTask[] = [];

  for (let fi = 0; fi < localFolders.length; fi++) {
    const folder = localFolders[fi];
    const folderId = crypto.randomUUID();
    folderRows.push({
      id: folderId,
      user_id: userId,
      name: folder.name,
      color: folder.color,
      position: fi,
      created_at: folder.createdAt instanceof Date ? folder.createdAt.toISOString() : String(folder.createdAt),
    });

    for (let ci = 0; ci < folder.checklists.length; ci++) {
      const checklist = folder.checklists[ci];
      const checklistId = crypto.randomUUID();
      checklistRows.push({
        id: checklistId,
        user_id: userId,
        folder_id: folderId,
        name: checklist.name,
        position: ci,
        created_at: checklist.createdAt instanceof Date ? checklist.createdAt.toISOString() : String(checklist.createdAt),
      });

      for (let ti = 0; ti < checklist.tasks.length; ti++) {
        const task = checklist.tasks[ti];
        taskRows.push({
          id: crypto.randomUUID(),
          user_id: userId,
          checklist_id: checklistId,
          title: task.title,
          completed: task.completed,
          due_date: task.dueDate ?? null,
          position: ti,
          created_at: task.createdAt instanceof Date ? task.createdAt.toISOString() : String(task.createdAt),
        });
      }
    }
  }

  if (folderRows.length > 0) await supabase.from('folders').insert(folderRows);
  if (checklistRows.length > 0) await supabase.from('checklists').insert(checklistRows);
  if (taskRows.length > 0) await supabase.from('tasks').insert(taskRows);
}

const arrayMove = <T,>(array: T[], from: number, to: number): T[] => {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { user } = useAuth();
  const supabase = createClient();

  // Keep a ref to folders so reorder callbacks can read the latest value after setFolders
  const foldersRef = useRef<Folder[]>(folders);
  useEffect(() => { foldersRef.current = folders; }, [folders]);

  // ── Load data from Supabase on auth change ──────────────────────────────
  useEffect(() => {
    if (!user) {
      setFolders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    async function loadData() {
      const [foldersRes, checklistsRes, tasksRes] = await Promise.all([
        supabase.from('folders').select('*').eq('user_id', user!.id).order('position'),
        supabase.from('checklists').select('*').eq('user_id', user!.id).order('position'),
        supabase.from('tasks').select('*').eq('user_id', user!.id).order('position'),
      ]);

      if (foldersRes.error || checklistsRes.error || tasksRes.error) {
        setMutationError('Failed to load data. Please refresh.');
        setIsLoading(false);
        return;
      }

      // First-time user: migrate localStorage data if any
      if (foldersRes.data.length === 0) {
        const stored = localStorage.getItem('todolist-data');
        if (stored) {
          try {
            const localFolders: Folder[] = JSON.parse(stored);
            if (localFolders.length > 0) {
              await migrateLocalStorageData(supabase, user!.id, localFolders);
              // Re-fetch after migration
              const [f2, c2, t2] = await Promise.all([
                supabase.from('folders').select('*').eq('user_id', user!.id).order('position'),
                supabase.from('checklists').select('*').eq('user_id', user!.id).order('position'),
                supabase.from('tasks').select('*').eq('user_id', user!.id).order('position'),
              ]);
              if (!f2.error && !c2.error && !t2.error) {
                setFolders(buildTree(f2.data, c2.data, t2.data));
                localStorage.removeItem('todolist-data');
                setIsLoading(false);
                return;
              }
            }
          } catch (e) {
            console.error('Migration failed:', e);
          }
        }
      }

      setFolders(buildTree(foldersRes.data, checklistsRes.data, tasksRes.data));
      setIsLoading(false);
    }

    loadData();
  }, [user?.id]);

  // ── Search ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    folders.forEach((folder) => {
      if (folder.name.toLowerCase().includes(query)) {
        results.push({ type: 'folder', id: folder.id, name: folder.name, color: folder.color });
      }
      folder.checklists.forEach((checklist) => {
        if (checklist.name.toLowerCase().includes(query)) {
          results.push({ type: 'checklist', id: checklist.id, name: checklist.name, parentId: folder.id, color: folder.color });
        }
        checklist.tasks.forEach((task) => {
          if (task.title.toLowerCase().includes(query)) {
            results.push({ type: 'task', id: task.id, name: task.title, parentId: checklist.id, grandParentId: folder.id, color: folder.color });
          }
        });
      });
    });

    setSearchResults(results);
  }, [searchQuery, folders]);

  // ── Folder operations ──────────────────────────────────────────────────
  const addFolder = useCallback((name: string, color: string) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const position = foldersRef.current.length;
    const newFolder: Folder = { id, name, color, checklists: [], createdAt: new Date() };
    setFolders((prev) => [...prev, newFolder]);
    supabase.from('folders').insert({ id, user_id: user.id, name, color, position }).then(({ error }) => {
      if (error) {
        setFolders((prev) => prev.filter((f) => f.id !== id));
        setMutationError('Failed to create folder');
      }
    });
  }, [user]);

  const deleteFolder = useCallback((id: string) => {
    if (!user) return;
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setSelectedFolderId((prev) => prev === id ? null : prev);
    setSelectedChecklistId(null);
    supabase.from('folders').delete().eq('id', id).then(({ error }) => {
      if (error) setMutationError('Failed to delete folder');
    });
  }, [user]);

  const renameFolder = useCallback((id: string, name: string) => {
    if (!user) return;
    setFolders((prev) => prev.map((f) => f.id === id ? { ...f, name } : f));
    supabase.from('folders').update({ name }).eq('id', id).then(({ error }) => {
      if (error) setMutationError('Failed to rename folder');
    });
  }, [user]);

  const updateFolderColor = useCallback((id: string, color: string) => {
    if (!user) return;
    setFolders((prev) => prev.map((f) => f.id === id ? { ...f, color } : f));
    supabase.from('folders').update({ color }).eq('id', id).then(({ error }) => {
      if (error) setMutationError('Failed to update folder color');
    });
  }, [user]);

  const selectFolder = useCallback((id: string | null) => {
    setSelectedFolderId(id);
    setSelectedChecklistId(null);
  }, []);

  const reorderFolders = useCallback((activeId: string, overId: string) => {
    if (!user) return;
    setFolders((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === activeId);
      const newIndex = prev.findIndex((f) => f.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
    // Sync positions after React state update settles
    setTimeout(() => {
      const updates = foldersRef.current.map((f, i) => ({
        id: f.id, user_id: user.id, name: f.name, color: f.color, position: i,
        created_at: f.createdAt instanceof Date ? f.createdAt.toISOString() : String(f.createdAt),
      }));
      supabase.from('folders').upsert(updates).then(({ error }) => {
        if (error) setMutationError('Failed to save folder order');
      });
    }, 0);
  }, [user]);

  // ── Checklist operations ───────────────────────────────────────────────
  const addChecklist = useCallback((folderId: string, name: string) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const folder = foldersRef.current.find((f) => f.id === folderId);
    const position = folder ? folder.checklists.length : 0;
    const newChecklist: Checklist = { id, name, folderId, tasks: [], createdAt: new Date() };
    setFolders((prev) => prev.map((f) =>
      f.id === folderId ? { ...f, checklists: [...f.checklists, newChecklist] } : f
    ));
    supabase.from('checklists').insert({ id, user_id: user.id, folder_id: folderId, name, position }).then(({ error }) => {
      if (error) {
        setFolders((prev) => prev.map((f) =>
          f.id === folderId ? { ...f, checklists: f.checklists.filter((c) => c.id !== id) } : f
        ));
        setMutationError('Failed to create checklist');
      }
    });
  }, [user]);

  const deleteChecklist = useCallback((folderId: string, checklistId: string) => {
    if (!user) return;
    setFolders((prev) => prev.map((f) =>
      f.id === folderId ? { ...f, checklists: f.checklists.filter((c) => c.id !== checklistId) } : f
    ));
    setSelectedChecklistId((prev) => prev === checklistId ? null : prev);
    supabase.from('checklists').delete().eq('id', checklistId).then(({ error }) => {
      if (error) setMutationError('Failed to delete checklist');
    });
  }, [user]);

  const renameChecklist = useCallback((folderId: string, checklistId: string, name: string) => {
    if (!user) return;
    setFolders((prev) => prev.map((f) =>
      f.id === folderId ? { ...f, checklists: f.checklists.map((c) => c.id === checklistId ? { ...c, name } : c) } : f
    ));
    supabase.from('checklists').update({ name }).eq('id', checklistId).then(({ error }) => {
      if (error) setMutationError('Failed to rename checklist');
    });
  }, [user]);

  const selectChecklist = useCallback((id: string | null) => {
    setSelectedChecklistId(id);
  }, []);

  const reorderChecklists = useCallback((folderId: string, activeId: string, overId: string) => {
    if (!user) return;
    setFolders((prev) => prev.map((f) => {
      if (f.id !== folderId) return f;
      const oldIndex = f.checklists.findIndex((c) => c.id === activeId);
      const newIndex = f.checklists.findIndex((c) => c.id === overId);
      if (oldIndex === -1 || newIndex === -1) return f;
      return { ...f, checklists: arrayMove(f.checklists, oldIndex, newIndex) };
    }));
    setTimeout(() => {
      const folder = foldersRef.current.find((f) => f.id === folderId);
      if (!folder) return;
      const updates = folder.checklists.map((c, i) => ({
        id: c.id, user_id: user.id, folder_id: folderId, name: c.name, position: i,
        created_at: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
      }));
      supabase.from('checklists').upsert(updates).then(({ error }) => {
        if (error) setMutationError('Failed to save checklist order');
      });
    }, 0);
  }, [user]);

  // ── Task operations ────────────────────────────────────────────────────
  const addTask = useCallback((folderId: string, checklistId: string, title: string, dueDate?: string) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const folder = foldersRef.current.find((f) => f.id === folderId);
    const checklist = folder?.checklists.find((c) => c.id === checklistId);
    const position = checklist ? checklist.tasks.length : 0;
    const newTask: Task = { id, title, completed: false, dueDate, createdAt: new Date() };
    setFolders((prev) => prev.map((f) =>
      f.id === folderId ? {
        ...f, checklists: f.checklists.map((c) =>
          c.id === checklistId ? { ...c, tasks: [...c.tasks, newTask] } : c
        )
      } : f
    ));
    supabase.from('tasks').insert({
      id, user_id: user.id, checklist_id: checklistId, title,
      completed: false, due_date: dueDate ?? null, position,
    }).then(({ error }) => {
      if (error) {
        setFolders((prev) => prev.map((f) =>
          f.id === folderId ? {
            ...f, checklists: f.checklists.map((c) =>
              c.id === checklistId ? { ...c, tasks: c.tasks.filter((t) => t.id !== id) } : c
            )
          } : f
        ));
        setMutationError('Failed to create task');
      }
    });
  }, [user]);

  const deleteTask = useCallback((folderId: string, checklistId: string, taskId: string) => {
    if (!user) return;
    setFolders((prev) => prev.map((f) =>
      f.id === folderId ? {
        ...f, checklists: f.checklists.map((c) =>
          c.id === checklistId ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) } : c
        )
      } : f
    ));
    supabase.from('tasks').delete().eq('id', taskId).then(({ error }) => {
      if (error) setMutationError('Failed to delete task');
    });
  }, [user]);

  const toggleTask = useCallback((folderId: string, checklistId: string, taskId: string) => {
    if (!user) return;
    let newCompleted = false;
    setFolders((prev) => prev.map((f) =>
      f.id === folderId ? {
        ...f, checklists: f.checklists.map((c) =>
          c.id === checklistId ? {
            ...c, tasks: c.tasks.map((t) => {
              if (t.id === taskId) { newCompleted = !t.completed; return { ...t, completed: !t.completed }; }
              return t;
            })
          } : c
        )
      } : f
    ));
    supabase.from('tasks').update({ completed: newCompleted }).eq('id', taskId).then(({ error }) => {
      if (error) setMutationError('Failed to update task');
    });
  }, [user]);

  const updateTaskDueDate = useCallback((folderId: string, checklistId: string, taskId: string, dueDate: string | undefined) => {
    if (!user) return;
    setFolders((prev) => prev.map((f) =>
      f.id === folderId ? {
        ...f, checklists: f.checklists.map((c) =>
          c.id === checklistId ? {
            ...c, tasks: c.tasks.map((t) => t.id === taskId ? { ...t, dueDate } : t)
          } : c
        )
      } : f
    ));
    supabase.from('tasks').update({ due_date: dueDate ?? null }).eq('id', taskId).then(({ error }) => {
      if (error) setMutationError('Failed to update task due date');
    });
  }, [user]);

  const reorderTasks = useCallback((folderId: string, checklistId: string, activeId: string, overId: string) => {
    if (!user) return;
    setFolders((prev) => prev.map((f) => {
      if (f.id !== folderId) return f;
      return {
        ...f, checklists: f.checklists.map((c) => {
          if (c.id !== checklistId) return c;
          const oldIndex = c.tasks.findIndex((t) => t.id === activeId);
          const newIndex = c.tasks.findIndex((t) => t.id === overId);
          if (oldIndex === -1 || newIndex === -1) return c;
          return { ...c, tasks: arrayMove(c.tasks, oldIndex, newIndex) };
        }),
      };
    }));
    setTimeout(() => {
      const folder = foldersRef.current.find((f) => f.id === folderId);
      const checklist = folder?.checklists.find((c) => c.id === checklistId);
      if (!checklist) return;
      const updates = checklist.tasks.map((t, i) => ({
        id: t.id, user_id: user.id, checklist_id: checklistId, title: t.title,
        completed: t.completed, due_date: t.dueDate ?? null, position: i,
        created_at: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
      }));
      supabase.from('tasks').upsert(updates).then(({ error }) => {
        if (error) setMutationError('Failed to save task order');
      });
    }, 0);
  }, [user]);

  return (
    <TodoContext.Provider
      value={{
        folders,
        selectedFolderId,
        selectedChecklistId,
        searchQuery,
        searchResults,
        isLoading,
        mutationError,
        addFolder,
        deleteFolder,
        renameFolder,
        updateFolderColor,
        selectFolder,
        reorderFolders,
        addChecklist,
        deleteChecklist,
        renameChecklist,
        selectChecklist,
        reorderChecklists,
        addTask,
        deleteTask,
        toggleTask,
        updateTaskDueDate,
        reorderTasks,
        setSearchQuery,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
}
