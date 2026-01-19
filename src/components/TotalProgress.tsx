'use client';

import { useTodo } from '@/context/TodoContext';

interface TotalProgressProps {
  size?: number;
  strokeWidth?: number;
}

export default function TotalProgress({ size = 72, strokeWidth = 5 }: TotalProgressProps) {
  const { folders } = useTodo();

  // Calculate total progress across all folders
  const stats = folders.reduce(
    (acc, folder) => {
      folder.checklists.forEach((checklist) => {
        acc.total += checklist.tasks.length;
        acc.completed += checklist.tasks.filter((t) => t.completed).length;
      });
      return acc;
    },
    { total: 0, completed: 0 }
  );

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--track-empty)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc with gradient */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--gradient-start)" />
              <stop offset="50%" stopColor="var(--gradient-mid)" />
              <stop offset="100%" stopColor="var(--gradient-end)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
          Total Progress
        </span>
        <span className="text-sm text-[var(--foreground)]">
          {stats.completed}/{stats.total} tasks
        </span>
      </div>
    </div>
  );
}
