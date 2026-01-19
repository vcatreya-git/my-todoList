'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Folder, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTodo } from '@/context/TodoContext';
import FolderItem from './FolderItem';
import ColorPicker from './ColorPicker';
import ThemeSwitcher from './ThemeSwitcher';
import { FOLDER_COLORS } from '@/types';

interface FolderListProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function FolderList({ isCollapsed, onToggleCollapse }: FolderListProps) {
  const { folders, addFolder, reorderFolders } = useTodo();
  const [isAdding, setIsAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[8]);
  const [isHovered, setIsHovered] = useState(false);

  // Sidebar is expanded if not collapsed OR if hovered while collapsed
  const isExpanded = !isCollapsed || isHovered;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderFolders(active.id as string, over.id as string);
    }
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim(), selectedColor);
      setNewFolderName('');
      setSelectedColor(FOLDER_COLORS[8]);
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddFolder();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewFolderName('');
    }
  };

  // Determine actual width based on collapsed and hovered state
  const sidebarWidth = isCollapsed && !isHovered ? 'w-16' : 'w-72';
  const isOverlay = isCollapsed && isHovered;

  return (
    <div
      className={`h-full flex flex-col relative transition-all duration-300 ease-in-out ${sidebarWidth} ${
        isOverlay
          ? 'absolute left-0 top-0 z-50 shadow-2xl bg-[var(--background)] border-r border-[var(--border)]'
          : 'glass'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className={`px-3 py-4 border-b border-white/5 transition-all duration-300`}>
        <div className="flex items-center justify-between">
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Folders
                </span>
                <span className="px-1.5 py-0.5 text-xs font-medium text-[var(--muted)] bg-white/5 rounded">
                  {folders.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsAdding(true)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors group"
                  title="Add new folder"
                >
                  <Plus className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Folder className="w-5 h-5 text-[var(--muted)]" />
            </div>
          )}
        </div>

        {/* Add folder form */}
        {isAdding && isExpanded && (
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Folder name"
                className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-sm placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all"
                autoFocus
              />
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewFolderName('');
                }}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4 text-[var(--muted)]" />
              </button>
            </div>
            <div className="mb-3">
              <ColorPicker
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
              />
            </div>
            <button
              onClick={handleAddFolder}
              disabled={!newFolderName.trim()}
              className="w-full px-4 py-2 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Create Folder
            </button>
          </div>
        )}
      </div>

      {/* Folder list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {folders.length === 0 ? (
          <div className={`text-center py-12 ${isExpanded ? 'px-4' : 'px-1'}`}>
            {isExpanded ? (
              <>
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 flex items-center justify-center">
                  <Folder className="w-6 h-6 text-[var(--muted)]" />
                </div>
                <p className="text-[var(--foreground)] font-medium mb-1 text-sm">No folders yet</p>
                <p className="text-xs text-[var(--muted)]">
                  Create your first folder to get started
                </p>
              </>
            ) : (
              <div className="w-8 h-8 mx-auto rounded-lg bg-white/5 flex items-center justify-center">
                <Plus className="w-4 h-4 text-[var(--muted)]" />
              </div>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={folders.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {folders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    isCollapsed={!isExpanded}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer with Theme Switcher and Collapse Toggle */}
      <div className="px-2 py-3 border-t border-white/5 space-y-2">
        {/* Theme Switcher */}
        <div className={`${isExpanded ? '' : 'flex justify-center'}`}>
          <ThemeSwitcher isCompact={!isExpanded} />
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-all group ${
            !isExpanded ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Pin sidebar open' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 group-hover:text-[var(--accent)] transition-colors" />
          ) : (
            <ChevronLeft className="w-4 h-4 group-hover:text-[var(--accent)] transition-colors" />
          )}
          {isExpanded && (
            <span className="text-sm">{isCollapsed ? 'Pin sidebar' : 'Collapse'}</span>
          )}
        </button>
      </div>
    </div>
  );
}
