'use client';

import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import FolderList from '@/components/FolderList';
import ChecklistList from '@/components/ChecklistList';
import SearchBar from '@/components/SearchBar';

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--gradient-start)]/20">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">
                  TaskList
                </h1>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider -mt-0.5">
                  Pro Dashboard
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Sidebar + Main panel layout */}
      <div className="flex h-[calc(100vh-57px)] relative">
        {/* Sidebar container - the FolderList controls its own width */}
        <div className="relative flex-shrink-0">
          <FolderList
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-hidden border-l border-[var(--border)]">
          <ChecklistList />
        </main>
      </div>
    </div>
  );
}
