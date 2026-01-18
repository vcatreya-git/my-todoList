'use client';

import React from 'react';
import { FOLDER_COLORS } from '@/types';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FOLDER_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onColorSelect(color)}
          className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
            selectedColor === color ? 'ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--card-bg)]' : ''
          }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
}
