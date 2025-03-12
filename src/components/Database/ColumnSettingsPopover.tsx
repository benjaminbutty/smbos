// src/components/Database/ColumnSettingsPopover.tsx
import React, { useState, useEffect } from 'react';
import { Type, DollarSign, Calendar, ToggleLeft, ListFilter, X, Trash2, Plus } from 'lucide-react';
import { Column } from './types';
import { COLUMN_TYPES } from './useColumns';

interface ColumnSettingsPopoverProps {
  column: Column;
  onUpdateColumn: (columnId: string, updates: Partial<Omit<Column, 'id'>>) => void;
  onDeleteColumn: (columnId: string) => void;
  onClose: () => void;
}

export function ColumnSettingsPopover({ 
  column, 
  onUpdateColumn, 
  onDeleteColumn,
  onClose
}: ColumnSettingsPopoverProps) {
  const [columnName, setColumnName] = useState(column.name);
  const [columnType, setColumnType] = useState(column.type);
  const [selectOptions, setSelectOptions] = useState<string[]>(column.metadata?.options || []);
  const [newOption, setNewOption] = useState('');
  
  useEffect(() => {
    setColumnName(column.name);
    setColumnType(column.type);
    setSelectOptions(column.metadata?.options || []);
  }, [column]);
  
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updates: Partial<Omit<Column, 'id'>> = {
      name: columnName,
      type: columnType as any, // Cast for type compatibility
    };
    
    // Add metadata for select columns
    if (columnType === COLUMN_TYPES.SELECT) {
      updates.metadata = {
        ...column.metadata,
        options: selectOptions
      };
    }
    
    onUpdateColumn(column.id, updates);
    onClose();
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setColumnName(e.target.value);
  };
  
  const handleTypeChange = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setColumnType(type as any); // Cast for type compatibility
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Confirm before deleting
    if (window.confirm(`Are you sure you want to delete the "${column.name}" column? This action cannot be undone.`)) {
      onDeleteColumn(column.id);
      onClose();
    }
  };
  
  const handlePopoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleAddOption = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newOption.trim() && !selectOptions.includes(newOption.trim())) {
      setSelectOptions([...selectOptions, newOption.trim()]);
      setNewOption('');
    }
  };
  
  const handleRemoveOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectOptions(selectOptions.filter(opt => opt !== option));
  };
  
  // Handle Enter key for adding options
  const handleOptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newOption.trim() && !selectOptions.includes(newOption.trim())) {
        setSelectOptions([...selectOptions, newOption.trim()]);
        setNewOption('');
      }
    }
  };
  
  // Get icon component for column type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case COLUMN_TYPES.TEXT:
        return Type;
      case COLUMN_TYPES.NUMBER:
        return DollarSign;
      case COLUMN_TYPES.SELECT:
        return ListFilter;
      case COLUMN_TYPES.DATE:
        return Calendar;
      case COLUMN_TYPES.BOOLEAN:
        return ToggleLeft;
      default:
        return Type;
    }
  };
  
  return (
    <div 
      className="absolute z-20 top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
      onClick={handlePopoverClick}
    >
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
            onClick={e => e.stopPropagation()}
            className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        {/* Column type */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(COLUMN_TYPES).map(type => {
              const TypeIcon = getTypeIcon(type);
              
              return (
                <button
                  key={type}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                    columnType === type 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={(e) => handleTypeChange(type, e)}
                >
                  <TypeIcon className="h-3.5 w-3.5" />
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* For Select type, show options manager */}
        {columnType === COLUMN_TYPES.SELECT && (
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              Options
            </label>
            
            <div className="flex gap-1 mb-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={handleOptionKeyDown}
                className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Add option..."
              />
              <button
                type="button"
                onClick={handleAddOption}
                disabled={!newOption.trim()}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            
            {selectOptions.length > 0 ? (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectOptions.map((option) => (
                  <div 
                    key={option}
                    className="flex items-center justify-between px-2 py-1 bg-gray-700 rounded text-sm"
                  >
                    <span className="text-gray-200">{option}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveOption(option, e)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Add options for this column.
              </p>
            )}
          </div>
        )}
        
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
            disabled={!columnName.trim() || (columnType === COLUMN_TYPES.SELECT && selectOptions.length === 0)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}