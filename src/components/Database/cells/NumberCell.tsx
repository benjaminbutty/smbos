import React, { useState, useEffect } from 'react';
import { Cell } from '../types';

interface NumberCellProps {
  cell: Cell;
  onUpdate: (value: string) => void;
  isSelected: boolean;
  rowHovered: boolean;
  onFocus: () => void;
  format?: 'plain' | 'currency' | 'percent';
}

export function NumberCell({ 
  cell, 
  onUpdate, 
  isSelected, 
  rowHovered, 
  onFocus,
  format = 'plain'
}: NumberCellProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(cell.content || '');
  
  // Update input value when cell content changes
  useEffect(() => {
    setInputValue(cell.content || '');
  }, [cell.content]);
  
  // Format the displayed value based on the format type
  const formattedValue = React.useMemo(() => {
    if (!cell.content) return '';
    
    const numValue = parseFloat(cell.content);
    if (isNaN(numValue)) return cell.content;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2
        }).format(numValue);
      
      case 'percent':
        return new Intl.NumberFormat('en-US', { 
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(numValue / 100);
      
      case 'plain':
      default:
        return new Intl.NumberFormat('en-US').format(numValue);
    }
  }, [cell.content, format]);
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    // Only update if value has changed
    if (inputValue !== cell.content) {
      onUpdate(inputValue);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  // Handle cell click when not focused
  const handleCellClick = () => {
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
      {/* Show input when focused */}
      {isFocused ? (
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full h-full bg-transparent text-right focus:outline-none text-gray-900 dark:text-gray-200"
          autoFocus
        />
      ) : (
        <div 
          className="w-full h-full cursor-text flex items-center justify-end"
          onClick={handleCellClick}
        >
          {cell.content ? (
            <span className="text-gray-900 dark:text-gray-200">{formattedValue}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500"></span>
          )}
        </div>
      )}
    </div>
  );
}