'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { useTodo } from '@/context/TodoContext';

interface TaskItemProps {
  task: Task;
  folderId: string;
  checklistId: string;
  folderColor: string;
}

export default function TaskItem({ task, folderId, checklistId, folderColor }: TaskItemProps) {
  const { toggleTask, deleteTask, updateTaskDueDate } = useTodo();
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const isDueToday = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTaskDueDate(folderId, checklistId, task.id, e.target.value || undefined);
    setIsEditingDueDate(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors ${
        isDragging ? 'z-50 shadow-lg bg-[var(--card-bg)]' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-[var(--border)]"
      >
        <svg className="w-3 h-3 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <button
        onClick={() => toggleTask(folderId, checklistId, task.id)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          task.completed
            ? 'border-transparent'
            : 'border-[var(--muted)] hover:border-[var(--accent)]'
        }`}
        style={task.completed ? { backgroundColor: folderColor } : {}}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={`text-sm transition-colors block truncate ${
            task.completed ? 'text-[var(--muted)] line-through' : 'text-[var(--foreground)]'
          }`}
        >
          {task.title}
        </span>

        {task.dueDate && !isEditingDueDate && (
          <button
            onClick={() => setIsEditingDueDate(true)}
            className={`flex items-center gap-1 text-xs mt-0.5 ${
              isOverdue()
                ? 'text-[var(--danger)]'
                : isDueToday()
                ? 'text-[var(--accent)]'
                : 'text-[var(--muted)]'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDueDate(task.dueDate)}
          </button>
        )}
      </div>

      {isEditingDueDate ? (
        <input
          type="date"
          value={task.dueDate || ''}
          onChange={handleDueDateChange}
          onBlur={() => setIsEditingDueDate(false)}
          className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-xs focus:outline-none focus:border-[var(--accent)]"
          autoFocus
        />
      ) : !task.dueDate ? (
        <button
          onClick={() => setIsEditingDueDate(true)}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--border)] transition-all"
          title="Add due date"
        >
          <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      ) : null}

      <button
        onClick={() => deleteTask(folderId, checklistId, task.id)}
        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--border)] transition-all"
        title="Delete task"
      >
        <svg className="w-4 h-4 text-[var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
