import React, { useState } from 'react';
import { Cell } from '../types';
import { Calendar } from 'lucide-react';

interface DateCellProps {
  cell: Cell;
  onUpdate: (value: string) => void;
  isSelected: boolean;
  rowHovered: boolean;
  onFocus: () => void;
}

export function DateCell({ 
  cell, 
  onUpdate, 
  isSelected, 
  rowHovered, 
  onFocus 
}: DateCellProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  // Format the date for display
  const formattedDate = React.useMemo(() => {
    if (!cell.content) return '';
    
    try {
      const date = new Date(cell.content);
      return date.toLocaleDateString();
    } catch {
      return cell.content;
    }
  }, [cell.content]);
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(e.target.value);
  };
  
  const handleClick = () => {
    setIsFocused(true);
  };

  return (
    <div
      className={`
        w-full min-h-[2.25rem] h-full px-3 py-1.5 transition-colors relative database-cell-transition
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/10' 
          : isFocused 
            ? 'bg-white dark:bg-gray-900 ring-2 ring-blue-500 ring-inset shadow-sm z-10' 
            : rowHovered 
              ? 'bg-gray-50 dark:bg-gray-800/50' 
              : 'bg-white dark:bg-gray-900'
        }
      `}
    >
      {isFocused ? (
        <div className="flex items-center w-full h-full">
          <input
            type="date"
            value={cell.content || ''}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full h-full bg-transparent focus:outline-none text-gray-900 dark:text-gray-200"
            autoFocus
          />
        </div>
      ) : (
        <div 
          className="w-full h-full cursor-text flex items-center"
          onClick={handleClick}
        >
          {cell.content ? (
            <div className="flex items-center text-gray-900 dark:text-gray-200">
              <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              {formattedDate}
            </div>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              No date
            </span>
          )}
        </div>
      )}
    </div>
  );
}