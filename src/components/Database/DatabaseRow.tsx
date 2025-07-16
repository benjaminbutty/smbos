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
  tableDensity: 'compact' | 'normal' | 'comfortable';
}

export function DatabaseRow({
  row,
  columns,
  isSelected,
  onSelect,
  onCellUpdate,
  onCellFocus,
  columnWidths,
  tableDensity,
}: DatabaseRowProps) {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <div 
      className="flex w-full border-b border-gray-200 dark:border-gray-700 group transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: isSelected ? '#111827' : hovered ? '#1e293b' : '#111827' }}
    >
      {/* Checkbox cell */}
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
      
      {/* Data cells */}
      {columns.map((column) => (
        <div
          key={column.id}
          className="border-r border-gray-200 dark:border-gray-700"
          style={{ 
            width: columnWidths[column.id] || 150, 
            minWidth: 100,
            flexShrink: 0,
            flexGrow: 0
          }}
        >
          <DatabaseCell
            cell={row.cells[column.id] || { 
              id: `temp-${column.id}-${row.id}`, 
              content: '', 
              type: column.type 
            }}
            onUpdate={(value) => onCellUpdate(column.id, value)}
            isSelected={isSelected}
            rowHovered={hovered}
            onFocus={() => onCellFocus(row.id, column.id)}
            tableDensity={tableDensity}
          />
        </div>
      ))}
    </div>
  );
}