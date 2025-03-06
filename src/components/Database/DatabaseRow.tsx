import React from 'react';
import { Check } from 'lucide-react';
import { DatabaseCell } from './DatabaseCell';
import { Row, Column } from './types';

interface DatabaseRowProps {
  row: Row;
  columns: Column[];
  isSelected: boolean;
  onSelect: () => void;
  onCellUpdate: (columnId: string, value: string) => void;
  onCellFocus: (rowId: string, columnId: string) => void;
}

export function DatabaseRow({
  row,
  columns,
  isSelected,
  onSelect,
  onCellUpdate,
  onCellFocus,
}: DatabaseRowProps) {
  return (
    <div className={`flex border-b border-gray-700 group ${isSelected ? 'bg-gray-700/25' : ''}`}>
      <div
        className="w-10 flex-shrink-0 border-r border-gray-700 flex items-center justify-center"
        onClick={onSelect}
      >
        <div
          className={`w-4 h-4 rounded border ${
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-600 group-hover:border-gray-500'
          } flex items-center justify-center cursor-pointer`}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
      </div>
      {columns.map((column) => (
        <div
          key={column.id}
          className="border-r border-gray-700 min-w-[150px]"
        >
          <DatabaseCell
            cell={row.cells[column.id]}
            onUpdate={(value) => onCellUpdate(column.id, value)}
            isSelected={isSelected}
            onFocus={() => onCellFocus(row.id, column.id)}
          />
        </div>
      ))}
    </div>
  );
}