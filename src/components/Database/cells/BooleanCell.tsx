import React from 'react';
import { Cell } from '../types';
import { Check, X } from 'lucide-react';

interface BooleanCellProps {
  cell: Cell;
  onUpdate: (value: string) => void;
  isSelected: boolean;
  rowHovered: boolean;
  onFocus: () => void;
  tableDensity: 'compact' | 'normal' | 'comfortable';
}

export function BooleanCell({ 
  cell, 
  onUpdate, 
  isSelected, 
  rowHovered, 
  onFocus,
  tableDensity
}: BooleanCellProps) {
  // Convert string value to boolean
  const isChecked = cell.content === 'true';
  
  // Get table density styles
  const getDensityStyles = () => {
    switch (tableDensity) {
      case 'compact':
        return 'min-h-[1.75rem]'; // 28px
      case 'comfortable':
        return 'min-h-[3rem]'; // 48px
      case 'normal':
      default:
        return 'min-h-[2.25rem]'; // 36px
    }
  };
  
  const toggleValue = () => {
    onFocus();
    onUpdate(isChecked ? 'false' : 'true');
  };

  return (
    <div
      className={`
        w-full ${getDensityStyles()} h-full px-3 py-1.5 flex items-center justify-center transition-colors relative database-cell-transition
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/10' 
          : rowHovered 
            ? 'bg-gray-50 dark:bg-gray-800/50' 
            : 'bg-white dark:bg-gray-900'
        }
      `}
      onClick={toggleValue}
    >
      <div className={`
        w-6 h-6 rounded-md flex items-center justify-center cursor-pointer
        ${isChecked 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }
      `}>
        {isChecked 
          ? <Check className="h-4 w-4" />
          : <X className="h-4 w-4" />
        }
      </div>
    </div>
  );
}