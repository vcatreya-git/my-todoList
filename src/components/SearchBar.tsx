'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Folder, ClipboardList, CheckCircle2 } from 'lucide-react';
import { useTodo } from '@/context/TodoContext';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, searchResults, selectFolder, selectChecklist } = useTodo();
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: typeof searchResults[0]) => {
    if (result.type === 'folder') {
      selectFolder(result.id);
    } else if (result.type === 'checklist') {
      selectFolder(result.parentId || null);
      selectChecklist(result.id);
    } else if (result.type === 'task') {
      selectFolder(result.grandParentId || null);
      selectChecklist(result.parentId || null);
    }
    setSearchQuery('');
    setIsFocused(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-4 h-4" />;
      case 'checklist':
        return <ClipboardList className="w-4 h-4" />;
      case 'task':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'folder':
        return 'Folder';
      case 'checklist':
        return 'Checklist';
      case 'task':
        return 'Task';
      default:
        return '';
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search..."
          className="w-full pl-11 pr-10 py-2 bg-white/5 border border-transparent rounded-xl text-[var(--foreground)] text-sm placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/30 focus:bg-white/[0.07] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[var(--muted)]" />
          </button>
        )}
      </div>

      {isFocused && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card-solid)] border border-[var(--border)] rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-50" />
              <p className="text-[var(--foreground)] font-medium">No results found</p>
              <p className="text-sm text-[var(--muted)] mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 ring-2 ring-white/10"
                    style={{ backgroundColor: result.color }}
                  />
                  <span className="text-[var(--muted)]">{getTypeIcon(result.type)}</span>
                  <span className="flex-1 text-[var(--foreground)] text-sm truncate">{result.name}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] bg-white/5 px-2 py-1 rounded-md">
                    {getTypeLabel(result.type)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
