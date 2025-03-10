import React, { useState, useEffect, useRef } from 'react';
import { X, Type, Hash, Calendar, DollarSign, ToggleLeft, Check } from 'lucide-react';

interface CustomColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateColumn: (column: { name: string; type: string }) => void;
}

type ColumnTypeOption = {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
};

export function CustomColumnDialog({
  isOpen,
  onClose,
  onCreateColumn
}: CustomColumnDialogProps) {
  const [columnName, setColumnName] = useState('');
  const [selectedType, setSelectedType] = useState('text');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const columnTypes: ColumnTypeOption[] = [
    {
      id: 'text',
      name: 'Text',
      icon: Type,
      description: 'Plain text, names, descriptions'
    },
    {
      id: 'number',
      name: 'Number',
      icon: DollarSign,
      description: 'Numeric values, prices, quantities'
    }
  ];
  
  // Focus the input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setColumnName('');
      setSelectedType('text');
    }
  }, [isOpen]);
  
  // Close dialog when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnName.trim()) {
      onCreateColumn({
        name: columnName.trim(),
        type: selectedType
      });
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={dialogRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create new column</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Column name input */}
          <div className="mb-4">
            <label htmlFor="column-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Column name
            </label>
            <input
              ref={inputRef}
              id="column-name"
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Product Name, Price, Status"
              required
            />
          </div>
          
          {/* Column type selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Column type
            </label>
            <div className="grid grid-cols-1 gap-2">
              {columnTypes.map((type) => (
                <div 
                  key={type.id}
                  className={`
                    flex items-center justify-between p-3 border rounded-md cursor-pointer
                    ${selectedType === type.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="flex items-center">
                    <div className={`
                      p-2 rounded-md mr-3
                      ${selectedType === type.id 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }
                    `}>
                      <type.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{type.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{type.description}</div>
                    </div>
                  </div>
                  
                  {selectedType === type.id && (
                    <Check className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
              disabled={!columnName.trim()}
            >
              Create column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}