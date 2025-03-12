import React, { useState } from 'react';
import { Cell } from '../types';
import { Check, ChevronDown } from 'lucide-react';

interface SelectCellProps {
  cell: Cell;
  onUpdate: (value: string) => void;
  isSelected: boolean;
  rowHovered: boolean;
  onFocus: () => void;
  options?: string[];
}

export function SelectCell({ 
  cell, 
  onUpdate, 
  isSelected, 
  rowHovered, 
  onFocus,
  options = []
}: SelectCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownRef, setDropdownRef] = useState<HTMLDivElement | null>(null);
  
  // Get options from metadata or use default empty array
  const cellOptions = options.length > 0 
    ? options 
    : cell.metadata?.options || [];
  
  const handleSelect = (option: string) => {
    onUpdate(option);
    setIsOpen(false);
  };
  
  const toggleDropdown = () => {
    if (!isOpen) {
      onFocus();
    }
    setIsOpen(!isOpen);
  };
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, dropdownRef]);
  
  // Get status color based on value
  const getStatusColor = (value: string) => {
    const lowerValue = value.toLowerCase();
    
    if (['completed', 'done', 'active', 'approved'].includes(lowerValue)) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
    
    if (['in progress', 'pending', 'review'].includes(lowerValue)) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
    
    if (['canceled', 'failed', 'inactive', 'rejected'].includes(lowerValue)) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
    
    if (['waiting', 'hold', 'draft'].includes(lowerValue)) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div
      ref={setDropdownRef}
      className={`
        w-full min-h-[2.25rem] h-full px-3 py-1.5 transition-colors relative database-cell-transition
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/10' 
          : isOpen 
            ? 'bg-white dark:bg-gray-900 ring-2 ring-blue-500 ring-inset shadow-sm z-10' 
            : rowHovered 
              ? 'bg-gray-50 dark:bg-gray-800/50' 
              : 'bg-white dark:bg-gray-900'
        }
      `}
    >
      <div 
        className="w-full h-full flex items-center cursor-pointer"
        onClick={toggleDropdown}
      >
        {cell.content ? (
          <span 
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(cell.content)}`}
          >
            {cell.content}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">Select...</span>
        )}
        <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
      </div>
      
      {/* Dropdown menu */}
      {isOpen && cellOptions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 max-h-48 overflow-y-auto">
          {cellOptions.map((option) => (
            <div
              key={option}
              className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
              onClick={() => handleSelect(option)}
            >
              <span 
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(option)}`}
              >
                {option}
              </span>
              {cell.content === option && (
                <Check className="ml-auto h-4 w-4 text-blue-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}