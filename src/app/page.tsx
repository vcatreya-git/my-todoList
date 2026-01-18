'use client';

import FolderList from '@/components/FolderList';
import ChecklistList from '@/components/ChecklistList';
import SearchBar from '@/components/SearchBar';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTodo } from '@/context/TodoContext';

export default function Home() {
  const { selectedFolderId } = useTodo();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[var(--foreground)] hidden sm:block">ToDoList</h1>
            </div>
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="flex h-[calc(100vh-73px)]">
          {/* Sidebar - Folders */}
          <aside
            className={`w-72 border-r border-[var(--border)] flex-shrink-0 ${
              selectedFolderId ? 'hidden md:block' : 'block'
            }`}
          >
            <FolderList />
          </aside>

          {/* Main Content - Checklists */}
          <section
            className={`flex-1 ${
              selectedFolderId ? 'block' : 'hidden md:block'
            }`}
          >
            <ChecklistList />
          </section>
        </div>
      </main>
    </div>
  );
}
