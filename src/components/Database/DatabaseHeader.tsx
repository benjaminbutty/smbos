import React from 'react';
import { GripVertical } from 'lucide-react';
import { Column } from './types';
import { ColumnPicker } from './ColumnPicker';

interface DatabaseHeaderProps {
  columns: Column[];
  onAddColumn: () => void;
  onAddCustomColumn: (column: Omit<Column, 'id'>) => void;
}

export function DatabaseHeader({ columns, onAddColumn, onAddCustomColumn }: DatabaseHeaderProps) {
  return (
    <div className="flex border-b border-gray-700 bg-gray-900 shadow-sm">
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
      <div className="ml-auto">
        <ColumnPicker onAddColumn={onAddCustomColumn} />
      </div>
    </div>
  );
}