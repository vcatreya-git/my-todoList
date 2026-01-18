'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Folder, Checklist, Task, SearchResult } from '@/types';

interface TodoContextType {
  folders: Folder[];
  selectedFolderId: string | null;
  selectedChecklistId: string | null;
  searchQuery: string;
  searchResults: SearchResult[];

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

const STORAGE_KEY = 'todolist-data';

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFolders(parsed);
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever folders change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
    }
  }, [folders, isHydrated]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    folders.forEach((folder) => {
      if (folder.name.toLowerCase().includes(query)) {
        results.push({
          type: 'folder',
          id: folder.id,
          name: folder.name,
          color: folder.color,
        });
      }

      folder.checklists.forEach((checklist) => {
        if (checklist.name.toLowerCase().includes(query)) {
          results.push({
            type: 'checklist',
            id: checklist.id,
            name: checklist.name,
            parentId: folder.id,
            color: folder.color,
          });
        }

        checklist.tasks.forEach((task) => {
          if (task.title.toLowerCase().includes(query)) {
            results.push({
              type: 'task',
              id: task.id,
              name: task.title,
              parentId: checklist.id,
              grandParentId: folder.id,
              color: folder.color,
            });
          }
        });
      });
    });

    setSearchResults(results);
  }, [searchQuery, folders]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Helper function to reorder array
  const arrayMove = <T,>(array: T[], from: number, to: number): T[] => {
    const newArray = [...array];
    const [removed] = newArray.splice(from, 1);
    newArray.splice(to, 0, removed);
    return newArray;
  };

  // Folder operations
  const addFolder = useCallback((name: string, color: string) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      color,
      checklists: [],
      createdAt: new Date(),
    };
    setFolders((prev) => [...prev, newFolder]);
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (selectedFolderId === id) {
      setSelectedFolderId(null);
      setSelectedChecklistId(null);
    }
  }, [selectedFolderId]);

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name } : f))
    );
  }, []);

  const updateFolderColor = useCallback((id: string, color: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, color } : f))
    );
  }, []);

  const selectFolder = useCallback((id: string | null) => {
    setSelectedFolderId(id);
    setSelectedChecklistId(null);
  }, []);

  const reorderFolders = useCallback((activeId: string, overId: string) => {
    setFolders((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === activeId);
      const newIndex = prev.findIndex((f) => f.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  // Checklist operations
  const addChecklist = useCallback((folderId: string, name: string) => {
    const newChecklist: Checklist = {
      id: generateId(),
      name,
      folderId,
      tasks: [],
      createdAt: new Date(),
    };
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, checklists: [...f.checklists, newChecklist] }
          : f
      )
    );
  }, []);

  const deleteChecklist = useCallback((folderId: string, checklistId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, checklists: f.checklists.filter((c) => c.id !== checklistId) }
          : f
      )
    );
    if (selectedChecklistId === checklistId) {
      setSelectedChecklistId(null);
    }
  }, [selectedChecklistId]);

  const renameChecklist = useCallback((folderId: string, checklistId: string, name: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              checklists: f.checklists.map((c) =>
                c.id === checklistId ? { ...c, name } : c
              ),
            }
          : f
      )
    );
  }, []);

  const selectChecklist = useCallback((id: string | null) => {
    setSelectedChecklistId(id);
  }, []);

  const reorderChecklists = useCallback((folderId: string, activeId: string, overId: string) => {
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id !== folderId) return f;
        const oldIndex = f.checklists.findIndex((c) => c.id === activeId);
        const newIndex = f.checklists.findIndex((c) => c.id === overId);
        if (oldIndex === -1 || newIndex === -1) return f;
        return { ...f, checklists: arrayMove(f.checklists, oldIndex, newIndex) };
      })
    );
  }, []);

  // Task operations
  const addTask = useCallback((folderId: string, checklistId: string, title: string, dueDate?: string) => {
    const newTask: Task = {
      id: generateId(),
      title,
      completed: false,
      dueDate,
      createdAt: new Date(),
    };
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              checklists: f.checklists.map((c) =>
                c.id === checklistId ? { ...c, tasks: [...c.tasks, newTask] } : c
              ),
            }
          : f
      )
    );
  }, []);

  const deleteTask = useCallback((folderId: string, checklistId: string, taskId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              checklists: f.checklists.map((c) =>
                c.id === checklistId
                  ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }
                  : c
              ),
            }
          : f
      )
    );
  }, []);

  const toggleTask = useCallback((folderId: string, checklistId: string, taskId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              checklists: f.checklists.map((c) =>
                c.id === checklistId
                  ? {
                      ...c,
                      tasks: c.tasks.map((t) =>
                        t.id === taskId ? { ...t, completed: !t.completed } : t
                      ),
                    }
                  : c
              ),
            }
          : f
      )
    );
  }, []);

  const updateTaskDueDate = useCallback((folderId: string, checklistId: string, taskId: string, dueDate: string | undefined) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              checklists: f.checklists.map((c) =>
                c.id === checklistId
                  ? {
                      ...c,
                      tasks: c.tasks.map((t) =>
                        t.id === taskId ? { ...t, dueDate } : t
                      ),
                    }
                  : c
              ),
            }
          : f
      )
    );
  }, []);

  const reorderTasks = useCallback((folderId: string, checklistId: string, activeId: string, overId: string) => {
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id !== folderId) return f;
        return {
          ...f,
          checklists: f.checklists.map((c) => {
            if (c.id !== checklistId) return c;
            const oldIndex = c.tasks.findIndex((t) => t.id === activeId);
            const newIndex = c.tasks.findIndex((t) => t.id === overId);
            if (oldIndex === -1 || newIndex === -1) return c;
            return { ...c, tasks: arrayMove(c.tasks, oldIndex, newIndex) };
          }),
        };
      })
    );
  }, []);

  return (
    <TodoContext.Provider
      value={{
        folders,
        selectedFolderId,
        selectedChecklistId,
        searchQuery,
        searchResults,
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
