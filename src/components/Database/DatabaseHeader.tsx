import React from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { Column } from './types';

interface DatabaseHeaderProps {
  columns: Column[];
  onAddColumn: () => void;
}

export function DatabaseHeader({ columns, onAddColumn }: DatabaseHeaderProps) {
  return (
    <div className="flex border-b border-gray-700 bg-gray-900">
      <div className="w-10 flex-shrink-0 border-r border-gray-700" />
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex items-center gap-2 border-r border-gray-700 px-2 py-2 min-w-[150px] select-none cursor-pointer hover:bg-gray-800"
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-200">{column.name}</span>
        </div>
      ))}
      <button
        onClick={onAddColumn}
        className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">New Column</span>
      </button>
    </div>
  );
}