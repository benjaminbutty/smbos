import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, GripVertical, Type, DollarSign, Calendar, ToggleLeft, ListFilter } from 'lucide-react';
import { Column } from './types';
import { COLUMN_TYPES } from './useColumns';

interface TableSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  onUpdateColumn: (columnId: string, updates: Partial<Omit<Column, 'id'>>) => void;
  onReorderColumns?: (dragIndex: number, hoverIndex: number) => void;
  tableDensity: 'compact' | 'normal' | 'comfortable';
  onTableDensityChange: (density: 'compact' | 'normal' | 'comfortable') => void;
  hiddenColumns: string[];
  onToggleColumnVisibility: (columnId: string) => void;
}

export function TableSettingsPanel({
  isOpen,
  onClose,
  columns,
  onUpdateColumn,
  onReorderColumns,
  tableDensity,
  onTableDensityChange,
  hiddenColumns,
  onToggleColumnVisibility
}: TableSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'columns' | 'formatting' | 'display'>('columns');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Get icon for column type
  const getColumnIcon = (type: string) => {
    switch (type) {
      case COLUMN_TYPES.NUMBER:
        return DollarSign;
      case COLUMN_TYPES.SELECT:
        return ListFilter;
      case COLUMN_TYPES.DATE:
        return Calendar;
      case COLUMN_TYPES.BOOLEAN:
        return ToggleLeft;
      case COLUMN_TYPES.TEXT:
      default:
        return Type;
    }
  };
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index && onReorderColumns) {
      onReorderColumns(draggedIndex, index);
      setDraggedIndex(index);
    }
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  // Handle column format change
  const handleFormatChange = (columnId: string, format: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column) {
      onUpdateColumn(columnId, {
        metadata: {
          ...column.metadata,
          format
        }
      });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={panelRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Table Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'columns', label: 'Columns' },
            { id: 'formatting', label: 'Formatting' },
            { id: 'display', label: 'Display' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Columns Tab */}
          {activeTab === 'columns' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Column Visibility & Order
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Show or hide columns and drag to reorder them.
                </p>
                
                <div className="space-y-2">
                  {columns.map((column, index) => {
                    const IconComponent = getColumnIcon(column.type);
                    const isHidden = hiddenColumns.includes(column.id);
                    
                    return (
                      <div
                        key={column.id}
                        className={`flex items-center gap-3 p-3 rounded-md border ${
                          isHidden 
                            ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-60' 
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        }`}
                        draggable={!isHidden}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        {/* Drag handle */}
                        <div className={`cursor-move ${isHidden ? 'cursor-not-allowed' : ''}`}>
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        
                        {/* Column icon */}
                        <div className="flex-shrink-0">
                          <IconComponent className="h-4 w-4 text-gray-500" />
                        </div>
                        
                        {/* Column info */}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {column.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {column.type}
                          </div>
                        </div>
                        
                        {/* Visibility toggle */}
                        <button
                          onClick={() => onToggleColumnVisibility(column.id)}
                          className={`p-1 rounded ${
                            isHidden
                              ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                              : 'text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300'
                          }`}
                        >
                          {isHidden ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Formatting Tab */}
          {activeTab === 'formatting' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Column Formatting
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Customize how data is displayed in each column.
                </p>
                
                <div className="space-y-4">
                  {columns.filter(col => col.type === COLUMN_TYPES.NUMBER || col.type === COLUMN_TYPES.DATE).map((column) => {
                    const IconComponent = getColumnIcon(column.type);
                    const currentFormat = column.metadata?.format || 'plain';
                    
                    return (
                      <div key={column.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                        <div className="flex items-center gap-2 mb-3">
                          <IconComponent className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {column.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            ({column.type})
                          </span>
                        </div>
                        
                        {column.type === COLUMN_TYPES.NUMBER && (
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Number Format
                            </label>
                            <select
                              value={currentFormat}
                              onChange={(e) => handleFormatChange(column.id, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="plain">Plain (1,234)</option>
                              <option value="currency">Currency ($1,234.00)</option>
                              <option value="percent">Percent (12.34%)</option>
                            </select>
                          </div>
                        )}
                        
                        {column.type === COLUMN_TYPES.DATE && (
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Date Format
                            </label>
                            <select
                              value={currentFormat}
                              onChange={(e) => handleFormatChange(column.id, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="short">Short (1/1/2024)</option>
                              <option value="medium">Medium (Jan 1, 2024)</option>
                              <option value="long">Long (January 1, 2024)</option>
                              <option value="iso">ISO (2024-01-01)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {columns.filter(col => col.type === COLUMN_TYPES.NUMBER || col.type === COLUMN_TYPES.DATE).length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No formattable columns found.</p>
                      <p className="text-xs mt-1">Add number or date columns to see formatting options.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Table Density
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Adjust the spacing and size of table rows.
                </p>
                
                <div className="space-y-2">
                  {[
                    { value: 'compact', label: 'Compact', description: 'Tight spacing, more rows visible' },
                    { value: 'normal', label: 'Normal', description: 'Balanced spacing and readability' },
                    { value: 'comfortable', label: 'Comfortable', description: 'Spacious layout, easier to read' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer ${
                        tableDensity === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="density"
                        value={option.value}
                        checked={tableDensity === option.value}
                        onChange={(e) => onTableDensityChange(e.target.value as any)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}