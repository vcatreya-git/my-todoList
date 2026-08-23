'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Menu, LogOut } from 'lucide-react';
import FolderList from '@/components/FolderList';
import ChecklistList from '@/components/ChecklistList';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/context/AuthContext';
import { useTodo } from '@/context/TodoContext';

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { isLoading: dataLoading, selectedFolderId } = useTodo();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Auto-close mobile sidebar when a folder is selected
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [selectedFolderId]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--foreground)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--foreground)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--muted)]">Loading your tasks…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)] border-b border-[var(--border)] h-[57px]">
        <div className="relative px-4 h-full flex items-center">

          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-md hover:bg-[var(--card-hover)] transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-[var(--muted)]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[var(--foreground)] rounded-md flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4 text-[var(--background)]" />
              </div>
              <span className="hidden sm:block text-sm font-semibold text-[var(--foreground)] tracking-tight">
                TaskList
              </span>
            </div>
          </div>

          {/* Center: search — absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-xs sm:max-w-sm px-4">
            <SearchBar />
          </div>

          {/* Right: logout pinned to right */}
          <div className="ml-auto flex-shrink-0">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors text-sm"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main layout */}
      <div className="flex h-[calc(100vh-57px)] relative">

        {/* Sidebar wrapper — fixed overlay on mobile, static in flow on desktop */}
        <div
          className={[
            'fixed top-[57px] bottom-0 left-0 z-50',
            'md:static md:top-auto md:bottom-auto md:left-auto md:z-auto md:flex-shrink-0',
            'transform transition-transform duration-300 ease-in-out',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          ].join(' ')}
        >
          <FolderList
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-hidden border-l border-[var(--border)] min-w-0">
          <ChecklistList />
        </main>
      </div>
    </div>
  );
}
