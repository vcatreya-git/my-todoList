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
import { useTodo } from '@/context/TodoContext';
import ChecklistItem from './ChecklistItem';

export default function ChecklistList() {
  const { folders, selectedFolderId, addChecklist, selectFolder, reorderChecklists } = useTodo();
  const [isAdding, setIsAdding] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

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
      <div className="h-full flex items-center justify-center text-[var(--muted)]">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg">Select a folder</p>
          <p className="text-sm mt-1">Choose a folder to view its checklists</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => selectFolder(null)}
            className="p-1 rounded hover:bg-[var(--card-hover)] md:hidden"
          >
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            className="w-4 h-4 rounded-sm flex-shrink-0"
            style={{ backgroundColor: selectedFolder.color }}
          />
          <h2 className="text-lg font-semibold text-[var(--foreground)] flex-1">{selectedFolder.name}</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="p-2 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--card-hover)] transition-colors"
            title="Add new checklist"
          >
            <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {isAdding && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newChecklistName}
              onChange={(e) => setNewChecklistName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Checklist name"
              className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
              autoFocus
            />
            <button
              onClick={handleAddChecklist}
              className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewChecklistName('');
              }}
              className="px-4 py-2 bg-[var(--border)] hover:bg-[var(--card-hover)] text-[var(--foreground)] rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedFolder.checklists.length === 0 ? (
          <div className="text-center py-8 text-[var(--muted)]">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No checklists yet</p>
            <p className="text-sm mt-1">Click + to create one</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedFolder.checklists.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {selectedFolder.checklists.map((checklist) => (
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
