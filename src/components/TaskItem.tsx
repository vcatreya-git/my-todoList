'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, X, Check } from 'lucide-react';
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
      className={`group flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-150 ${
        isDragging ? 'z-50 shadow-lg bg-[var(--card-solid)]' : 'hover:bg-white/[0.02]'
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
      >
        <GripVertical className="w-3 h-3 text-[var(--muted)]" />
      </div>

      {/* Checkbox */}
      <button
        onClick={() => toggleTask(folderId, checklistId, task.id)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
          task.completed
            ? 'border-transparent'
            : 'border-[var(--muted)]/50 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10'
        }`}
        style={task.completed ? { backgroundColor: folderColor } : undefined}
      >
        {task.completed && (
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm transition-all duration-200 block truncate ${
            task.completed
              ? 'text-[var(--muted)] line-through'
              : 'text-[var(--foreground)]'
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Due date */}
      {task.dueDate && !isEditingDueDate && (
        <button
          onClick={() => setIsEditingDueDate(true)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            isOverdue()
              ? 'text-[var(--danger)] bg-[var(--danger-muted)]'
              : isDueToday()
              ? 'text-[var(--accent)] bg-[var(--accent)]/10'
              : 'text-[var(--muted)] hover:bg-white/5'
          }`}
        >
          <Calendar className="w-3 h-3" />
          {formatDueDate(task.dueDate)}
        </button>
      )}

      {/* Date picker (hidden) */}
      {isEditingDueDate && (
        <input
          type="date"
          value={task.dueDate || ''}
          onChange={handleDueDateChange}
          onBlur={() => setIsEditingDueDate(false)}
          className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-xs focus:outline-none focus:border-[var(--accent)]"
          autoFocus
        />
      )}

      {/* Add date button (when no date) */}
      {!task.dueDate && !isEditingDueDate && (
        <button
          onClick={() => setIsEditingDueDate(true)}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
          title="Add due date"
        >
          <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
        </button>
      )}

      {/* Delete button */}
      <button
        onClick={() => deleteTask(folderId, checklistId, task.id)}
        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--danger-muted)] transition-all"
        title="Delete task"
      >
        <X className="w-3.5 h-3.5 text-[var(--danger)]" />
      </button>
    </div>
  );
}
