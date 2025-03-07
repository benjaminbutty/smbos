import React from 'react';
import { Check } from 'lucide-react';
import { Row, Column } from './types';
import { DatabaseCell } from './DatabaseCell';

interface DatabaseRowProps {
  row: Row;
  columns: Column[];
  isSelected: boolean;
  onSelect: () => void;
  onCellUpdate: (columnId: string, value: string) => void;
  onCellFocus: (rowId: string, columnId: string) => void;
  columnWidths: Record<string, number>;
}

export function DatabaseRow({
  row,
  columns,
  isSelected,
  onSelect,
  onCellUpdate,
  onCellFocus,
  columnWidths,
}: DatabaseRowProps) {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <div 
      className={`flex border-b border-gray-200 dark:border-gray-700 group transition-colors
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : hovered ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-10 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center"
        onClick={onSelect}
      >
        <div
          className={`w-4 h-4 rounded ${
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'border border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
          } flex items-center justify-center cursor-pointer transition-colors`}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
      </div>
      
      {columns.map((column) => (
        <div
          key={column.id}
          className="border-r border-gray-200 dark:border-gray-700"
          style={{ width: columnWidths[column.id] || 150, minWidth: 100 }}
        >
          <DatabaseCell
            cell={row.cells[column.id]}
            onUpdate={(value) => onCellUpdate(column.id, value)}
            isSelected={isSelected}
            rowHovered={hovered}
            onFocus={() => onCellFocus(row.id, column.id)}
          />
        </div>
      ))}
    </div>
  );
}