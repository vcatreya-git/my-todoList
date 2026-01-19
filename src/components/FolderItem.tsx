'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronRight, MoreVertical, Pencil, Palette, Trash2 } from 'lucide-react';
import { Folder } from '@/types';
import { useTodo } from '@/context/TodoContext';
import ColorPicker from './ColorPicker';

interface FolderItemProps {
  folder: Folder;
  isCollapsed?: boolean;
}

export default function FolderItem({ folder, isCollapsed = false }: FolderItemProps) {
  const {
    selectedFolderId,
    selectedChecklistId,
    selectFolder,
    selectChecklist,
    deleteFolder,
    renameFolder,
    updateFolderColor
  } = useTodo();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedFolderId === folder.id;
  const checklistCount = folder.checklists.length;
  const taskCount = folder.checklists.reduce((sum, cl) => sum + cl.tasks.length, 0);
  const completedCount = folder.checklists.reduce(
    (sum, cl) => sum + cl.tasks.filter((t) => t.completed).length,
    0
  );
  const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-expand when folder is selected
  useEffect(() => {
    if (isSelected && folder.checklists.length > 0) {
      setIsExpanded(true);
    }
  }, [isSelected, folder.checklists.length]);

  const handleRename = () => {
    if (editName.trim() && editName !== folder.name) {
      renameFolder(folder.id, editName.trim());
    }
    setIsEditing(false);
    setEditName(folder.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(folder.name);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete "${folder.name}" and all its checklists?`)) {
      deleteFolder(folder.id);
    }
    setShowMenu(false);
  };

  const handleColorChange = (color: string) => {
    updateFolderColor(folder.id, color);
    setShowColorPicker(false);
    setShowMenu(false);
  };

  const handleFolderClick = () => {
    if (!isEditing) {
      selectFolder(folder.id);
      selectChecklist(null); // Show all checklists
      setIsExpanded(true);
    }
  };

  const handleChecklistClick = (e: React.MouseEvent, checklistId: string) => {
    e.stopPropagation();
    selectFolder(folder.id);
    selectChecklist(checklistId); // Show only this checklist
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Collapsed view - show only color indicator
  if (isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`rounded-lg transition-all duration-200 ${isDragging ? 'z-50 shadow-xl' : ''}`}
      >
        <button
          onClick={handleFolderClick}
          className={`w-full flex justify-center py-2.5 rounded-lg cursor-pointer transition-all ${
            isSelected && !selectedChecklistId
              ? 'bg-white/5'
              : 'hover:bg-white/[0.03]'
          }`}
          title={folder.name}
        >
          <div
            className="w-3 h-3 rounded-full ring-2 ring-offset-1 ring-offset-[var(--background)]"
            style={{ backgroundColor: folder.color, boxShadow: isSelected ? `0 0 8px ${folder.color}` : 'none' }}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg transition-all duration-200 ${isDragging ? 'z-50 shadow-xl' : ''}`}
    >
      {/* Folder Header */}
      <div
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
          isSelected && !selectedChecklistId
            ? 'bg-white/5 border border-white/10'
            : 'hover:bg-white/[0.03] border border-transparent'
        }`}
        onClick={handleFolderClick}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 text-[var(--muted)]" />
        </div>

        {/* Expand arrow */}
        {folder.checklists.length > 0 && (
          <button
            onClick={handleToggleExpand}
            className="p-0.5 rounded hover:bg-white/5 transition-colors"
          >
            <ChevronRight
              className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>
        )}

        {/* Folder color indicator */}
        <div
          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
          style={{ backgroundColor: folder.color }}
        />

        {/* Folder name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              className="w-full px-2 py-0.5 bg-[var(--background)] border border-[var(--accent)] rounded text-[var(--foreground)] text-sm focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm text-[var(--foreground)] truncate font-medium block">
              {folder.name}
            </span>
          )}
        </div>

        {/* Stats */}
        <span className="text-[10px] text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity">
          {completedCount}/{taskCount}
        </span>

        {/* Progress indicator */}
        {taskCount > 0 && (
          <div className="w-6 h-6 relative flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="var(--track-empty)"
                strokeWidth="2.5"
              />
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke={folder.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${progress * 0.565} 100`}
                className="transition-all duration-300"
              />
            </svg>
          </div>
        )}

        {/* Menu button */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
          >
            <MoreVertical className="w-4 h-4 text-[var(--muted)]" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 w-44 bg-[var(--card-solid)] border border-[var(--border)] rounded-xl shadow-xl z-20 overflow-hidden"
            >
              {showColorPicker ? (
                <div className="p-3">
                  <p className="text-xs text-[var(--muted)] mb-2 font-medium">Choose color</p>
                  <ColorPicker
                    selectedColor={folder.color}
                    onColorSelect={handleColorChange}
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-[var(--muted)]" />
                    Rename
                  </button>
                  <button
                    onClick={() => setShowColorPicker(true)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors"
                  >
                    <Palette className="w-4 h-4 text-[var(--muted)]" />
                    Change color
                  </button>
                  <div className="h-px bg-[var(--border)] my-1" />
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nested Checklists */}
      {isExpanded && folder.checklists.length > 0 && (
        <div className="ml-6 pl-4 border-l border-[var(--border)] mt-1 space-y-0.5">
          {folder.checklists.map((checklist) => {
            const clCompleted = checklist.tasks.filter((t) => t.completed).length;
            const clTotal = checklist.tasks.length;
            const isChecklistSelected = selectedChecklistId === checklist.id;

            return (
              <button
                key={checklist.id}
                onClick={(e) => handleChecklistClick(e, checklist.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left transition-all ${
                  isChecklistSelected
                    ? 'bg-white/5 text-[var(--foreground)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/[0.02]'
                }`}
              >
                <span className="flex-1 text-sm truncate">{checklist.name}</span>
                <span className="text-[10px] opacity-60">
                  {clCompleted}/{clTotal}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
