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
import { GripVertical, ChevronRight, MoreVertical, Plus, Pencil, Trash2, Calendar, X } from 'lucide-react';
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
  const addTaskRef = useRef<HTMLDivElement>(null);

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
      if (addTaskRef.current && !addTaskRef.current.contains(event.target as Node)) {
        setIsAddingTask(false);
        setNewTaskTitle('');
        setNewTaskDueDate('');
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
      className={`rounded-xl border transition-all duration-200 hover-lift ${
        isSelected
          ? 'border-[var(--accent)]/30 bg-[var(--card-solid)] shadow-lg shadow-[var(--accent)]/5'
          : 'border-[var(--border)] bg-[var(--card-solid)] hover:border-white/10'
      } ${isDragging ? 'z-50 shadow-2xl' : ''}`}
    >
      {/* Header */}
      <div
        className="px-5 py-3.5 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center gap-4">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4 text-[var(--muted)]" />
          </div>

          {/* Expand arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronRight
              className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>

          {/* Checklist name */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleRename}
                className="w-full px-3 py-1 bg-[var(--background)] border border-[var(--accent)] rounded-lg text-[var(--foreground)] text-sm focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-[var(--foreground)] font-medium block truncate">
                {checklist.name}
              </span>
            )}
          </div>

          {/* Task count badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--muted)] bg-white/5 px-2 py-1 rounded-md">
              {completedCount}/{totalCount}
            </span>

            {/* Menu */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-[var(--muted)]" />
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 w-40 bg-[var(--card-solid)] border border-[var(--border)] rounded-xl shadow-xl z-10 overflow-hidden"
                >
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
                  <div className="h-px bg-[var(--border)]" />
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar - always show track, folder color fill */}
        <div className="mt-3 ml-8">
          <div className="h-1.5 rounded-full overflow-hidden progress-track">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: progress > 0 ? folderColor : 'transparent'
              }}
            />
          </div>
        </div>
      </div>

      {/* Expanded tasks section */}
      {isExpanded && (
        <div className="px-5 pb-4 border-t border-[var(--border)]">
          <div className="pt-4 space-y-1">
            {/* Add task button/form */}
            {isAddingTask ? (
              <div ref={addTaskRef} className="mb-3 p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleTaskKeyDown}
                  placeholder="What needs to be done?"
                  className="w-full px-0 py-1 bg-transparent text-[var(--foreground)] text-sm placeholder-[var(--muted)] focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                  <button
                    onClick={() => {
                      const input = document.getElementById('task-date-input') as HTMLInputElement;
                      input?.showPicker?.();
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {newTaskDueDate || 'Add date'}
                  </button>
                  <input
                    id="task-date-input"
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsAddingTask(false);
                        setNewTaskTitle('');
                        setNewTaskDueDate('');
                      }}
                      className="px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddTask}
                      disabled={!newTaskTitle.trim()}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTask(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 rounded-xl transition-all mb-2"
              >
                <Plus className="w-4 h-4" />
                Add task
              </button>
            )}

            {/* Tasks list */}
            {checklist.tasks.length > 0 && (
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
                  {/* Active tasks */}
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

                  {/* Completed tasks */}
                  {checklist.tasks.filter((t) => t.completed).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                      <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2 px-4">
                        Completed
                      </p>
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
                    </div>
                  )}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
