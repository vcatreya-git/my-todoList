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
import { Plus, ChevronLeft, ClipboardList, X } from 'lucide-react';
import { useTodo } from '@/context/TodoContext';
import ChecklistItem from './ChecklistItem';

export default function ChecklistList() {
  const { folders, selectedFolderId, selectedChecklistId, addChecklist, selectFolder, reorderChecklists } = useTodo();
  const [isAdding, setIsAdding] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  // Filter checklists based on selection
  const displayedChecklists = selectedFolder
    ? selectedChecklistId
      ? selectedFolder.checklists.filter((c) => c.id === selectedChecklistId)
      : selectedFolder.checklists
    : [];

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
    if (over && active.id !== over.id && selectedFolderId) {
      reorderChecklists(selectedFolderId, active.id as string, over.id as string);
    }
  };

  const handleAddChecklist = () => {
    if (newChecklistName.trim() && selectedFolderId) {
      addChecklist(selectedFolderId, newChecklistName.trim());
      setNewChecklistName('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddChecklist();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewChecklistName('');
    }
  };

  if (!selectedFolder) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center px-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[var(--card-hover)] flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-[var(--muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Select a folder
          </h3>
          <p className="text-sm text-[var(--muted)] max-w-xs">
            Choose a folder from the sidebar to view and manage your checklists
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile back button */}
            <button
              onClick={() => selectFolder(null)}
              className="p-1.5 rounded-md hover:bg-[var(--card-hover)] md:hidden transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--muted)]" />
            </button>

            {/* Folder indicator */}
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full ring-2 ring-white/10"
                style={{ backgroundColor: selectedFolder.color }}
              />
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {selectedFolder.name}
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  {selectedFolder.checklists.length} {selectedFolder.checklists.length === 1 ? 'checklist' : 'checklists'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Folder Progress - Circular gauge */}
            {(() => {
              const totalTasks = selectedFolder.checklists.reduce((sum, cl) => sum + cl.tasks.length, 0);
              const completedTasks = selectedFolder.checklists.reduce(
                (sum, cl) => sum + cl.tasks.filter((t) => t.completed).length,
                0
              );
              const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              const circumference = 2 * Math.PI * 18;
              const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

              return (
                <div className="relative w-11 h-11 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="var(--track-empty)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke={selectedFolder.color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-medium text-[var(--muted)]">
                    {progressPercent}%
                  </span>
                </div>
              );
            })()}

            {/* Add button */}
            <button
              onClick={() => setIsAdding(true)}
              className="p-1.5 rounded-md hover:bg-[var(--card-hover)] transition-colors"
              title="Add new checklist"
            >
              <Plus className="w-4 h-4 text-[var(--muted)]" />
            </button>
          </div>
        </div>

        {/* Add checklist form */}
        {isAdding && (
          <div className="mt-4 flex items-center gap-3">
            <input
              type="text"
              value={newChecklistName}
              onChange={(e) => setNewChecklistName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter checklist name..."
              className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--foreground)] text-sm placeholder-[var(--muted)] focus:outline-none focus:border-[var(--border-hover)] transition-all"
              autoFocus
            />
            <button
              onClick={handleAddChecklist}
              disabled={!newChecklistName.trim()}
              className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-md hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewChecklistName('');
              }}
              className="p-2 rounded-md hover:bg-[var(--card-hover)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted)]" />
            </button>
          </div>
        )}
      </div>

      {/* Checklist grid */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4">
        {displayedChecklists.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--card-hover)] flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-[var(--muted)]" />
            </div>
            <p className="text-[var(--foreground)] font-medium mb-1">No checklists yet</p>
            <p className="text-sm text-[var(--muted)]">
              Create your first checklist to start tracking tasks
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayedChecklists.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {displayedChecklists.map((checklist) => (
                  <ChecklistItem
                    key={checklist.id}
                    checklist={checklist}
                    folderId={selectedFolder.id}
                    folderColor={selectedFolder.color}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
