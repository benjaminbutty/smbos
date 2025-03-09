import React, { useState, useEffect } from 'react';
import { Type, DollarSign, Trash2 } from 'lucide-react';
import { Column } from './types';

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
  
  useEffect(() => {
    setColumnName(column.name);
    setColumnType(column.type);
  }, [column]);
  
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateColumn(column.id, {
      name: columnName,
      type: columnType,
    });
    onClose();
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setColumnName(e.target.value);
  };
  
  const handleTypeChange = (type: 'text' | 'number', e: React.MouseEvent) => {
    e.stopPropagation();
    setColumnType(type);
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
            <button
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                columnType === 'text' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={(e) => handleTypeChange('text', e)}
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
              onClick={(e) => handleTypeChange('number', e)}
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
  );
}