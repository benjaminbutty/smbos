import React, { useState, useRef, useEffect } from 'react';
import { Settings, Type, Hash, Calendar, DollarSign, Trash2, ToggleLeft, ChevronDown } from 'lucide-react';
import { Column } from './types';

interface ColumnSettingsPopoverProps {
  column: Column;
  onUpdateColumn: (columnId: string, updates: Partial<Omit<Column, 'id'>>) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function ColumnSettingsPopover({ 
  column, 
  onUpdateColumn, 
  onDeleteColumn 
}: ColumnSettingsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const [columnType, setColumnType] = useState(column.type);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setColumnName(column.name);
    setColumnType(column.type);
  }, [column]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const handleSave = () => {
    onUpdateColumn(column.id, {
      name: columnName,
      type: columnType,
    });
    setIsOpen(false);
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColumnName(e.target.value);
  };
  
  const handleTypeChange = (type: 'text' | 'number') => {
    setColumnType(type);
  };
  
  const handleDelete = () => {
    // Confirm before deleting
    if (window.confirm(`Are you sure you want to delete the "${column.name}" column? This action cannot be undone.`)) {
      onDeleteColumn(column.id);
      setIsOpen(false);
    }
  };
  
  // Get icon based on column type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <DollarSign className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'boolean':
        return <ToggleLeft className="h-4 w-4" />;
      case 'id':
        return <Hash className="h-4 w-4" />;
      case 'text':
      default:
        return <Type className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-300 rounded"
        title="Column settings"
      >
        <Settings className="h-3.5 w-3.5" />
      </button>
      
      {isOpen && (
        <div className="absolute z-20 top-full right-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-200 mb-3">Column Settings</h3>
            
            {/* Column name */}
            <div className="mb-3">
              <label htmlFor="column-name" className="block text-xs text-gray-400 mb-1">
                Name
              </label>
              <input
                id="column-name"
                type="text"
                value={columnName}
                onChange={handleNameChange}
                className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            {/* Column type */}
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                    columnType === 'text' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => handleTypeChange('text')}
                >
                  <Type className="h-3.5 w-3.5" />
                  <span>Text</span>
                </button>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                    columnType === 'number' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => handleTypeChange('number')}
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Number</span>
                </button>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between mt-4">
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-900/30"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </button>
              
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}