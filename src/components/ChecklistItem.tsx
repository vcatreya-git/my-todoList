'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { Checklist } from '@/types';
import { useTodo } from '@/context/TodoContext';
import TaskItem from './TaskItem';

interface ChecklistItemProps {
  checklist: Checklist;
  folderId: string;
  folderColor: string;
}

export default function ChecklistItem({ checklist, folderId, folderColor }: ChecklistItemProps) {
  const { deleteChecklist, renameChecklist, addTask, selectedChecklistId, selectChecklist, reorderTasks } = useTodo();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(checklist.name);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: checklist.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const taskSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTaskDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTasks(folderId, checklist.id, active.id as string, over.id as string);
    }
  };

  const isSelected = selectedChecklistId === checklist.id;
  const completedCount = checklist.tasks.filter((t) => t.completed).length;
  const totalCount = checklist.tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRename = () => {
    if (editName.trim() && editName !== checklist.name) {
      renameChecklist(folderId, checklist.id, editName.trim());
    }
    setIsEditing(false);
    setEditName(checklist.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(checklist.name);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete "${checklist.name}" and all its tasks?`)) {
      deleteChecklist(folderId, checklist.id);
    }
    setShowMenu(false);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(folderId, checklist.id, newTaskTitle.trim(), newTaskDueDate || undefined);
      setNewTaskTitle('');
      setNewTaskDueDate('');
    }
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskTitle('');
      setNewTaskDueDate('');
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      setIsExpanded(!isExpanded);
      selectChecklist(checklist.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border transition-colors ${
        isSelected ? 'border-[var(--accent)] bg-[var(--card-bg)]' : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--card-hover)]'
      } ${isDragging ? 'z-50 shadow-lg' : ''}`}
    >
      <div
        className="p-3 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-[var(--card-hover)]"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded hover:bg-[var(--card-hover)]"
          >
            <svg
              className={`w-4 h-4 text-[var(--muted)] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              className="flex-1 px-2 py-1 bg-[var(--background)] border border-[var(--accent)] rounded text-[var(--foreground)] text-sm focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-[var(--foreground)] font-medium">{checklist.name}</span>
          )}

          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--muted)]">
              {completedCount}/{totalCount}
            </span>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded hover:bg-[var(--card-hover)]"
              >
                <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 w-36 bg-[var(--card-hover)] border border-[var(--border)] rounded-lg shadow-lg z-10"
                >
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--border)] rounded-t-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Rename
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--border)] rounded-b-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="mt-2 ml-14">
            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: folderColor }}
              />
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-[var(--border)]">
          <div className="pt-3 space-y-2">
            {/* Add task button/input at the top */}
            {isAddingTask ? (
              <div className="space-y-2 mb-2 p-3 bg-[var(--card-hover)] rounded-lg">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleTaskKeyDown}
                  placeholder="Task title"
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-sm placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTask}
                    className="flex-1 px-3 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskTitle('');
                      setNewTaskDueDate('');
                    }}
                    className="flex-1 px-3 py-2 bg-[var(--border)] hover:bg-[var(--card-hover)] text-[var(--foreground)] text-sm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTask(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] rounded-lg transition-colors mb-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add task
              </button>
            )}

            {/* Tasks: unfinished first, then completed at bottom */}
            {checklist.tasks.length > 0 ? (
              <DndContext
                sensors={taskSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTaskDragEnd}
              >
                <SortableContext
                  items={[
                    ...checklist.tasks.filter((t) => !t.completed).map((t) => t.id),
                    ...checklist.tasks.filter((t) => t.completed).map((t) => t.id),
                  ]}
                  strategy={verticalListSortingStrategy}
                >
                  {/* Unfinished tasks first */}
                  {checklist.tasks
                    .filter((task) => !task.completed)
                    .map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        folderId={folderId}
                        checklistId={checklist.id}
                        folderColor={folderColor}
                      />
                    ))}
                  {/* Completed tasks at the bottom */}
                  {checklist.tasks
                    .filter((task) => task.completed)
                    .map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        folderId={folderId}
                        checklistId={checklist.id}
                        folderColor={folderColor}
                      />
                    ))}
                </SortableContext>
              </DndContext>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
