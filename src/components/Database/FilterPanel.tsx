import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Filter, Trash2 } from 'lucide-react';
import { Column } from './types';
import { COLUMN_TYPES } from './useColumns';

export interface FilterCondition {
  id: string;
  columnId: string;
  operator: string;
  value: string;
  logic: 'AND' | 'OR';
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
}

// Define operators for different column types
const getOperatorsForType = (type: string) => {
  const baseOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' }
  ];

  switch (type) {
    case COLUMN_TYPES.TEXT:
      return [
        ...baseOperators,
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does not contain' },
        { value: 'starts_with', label: 'Starts with' },
        { value: 'ends_with', label: 'Ends with' }
      ];
    
    case COLUMN_TYPES.NUMBER:
      return [
        ...baseOperators,
        { value: 'greater_than', label: 'Greater than' },
        { value: 'less_than', label: 'Less than' },
        { value: 'greater_equal', label: 'Greater than or equal' },
        { value: 'less_equal', label: 'Less than or equal' }
      ];
    
    case COLUMN_TYPES.DATE:
      return [
        ...baseOperators,
        { value: 'after', label: 'After' },
        { value: 'before', label: 'Before' },
        { value: 'on_or_after', label: 'On or after' },
        { value: 'on_or_before', label: 'On or before' }
      ];
    
    case COLUMN_TYPES.SELECT:
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'is_empty', label: 'Is empty' },
        { value: 'is_not_empty', label: 'Is not empty' }
      ];
    
    case COLUMN_TYPES.BOOLEAN:
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' }
      ];
    
    default:
      return baseOperators;
  }
};

// Check if operator needs a value input
const operatorNeedsValue = (operator: string) => {
  return !['is_empty', 'is_not_empty'].includes(operator);
};

export function FilterPanel({ 
  isOpen, 
  onClose, 
  columns, 
  filters, 
  onFiltersChange 
}: FilterPanelProps) {
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
  
  // Add a new filter condition
  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      columnId: columns[0]?.id || '',
      operator: 'contains',
      value: '',
      logic: 'AND'
    };
    
    onFiltersChange([...filters, newFilter]);
  };
  
  // Remove a filter condition
  const removeFilter = (filterId: string) => {
    onFiltersChange(filters.filter(f => f.id !== filterId));
  };
  
  // Update a filter condition
  const updateFilter = (filterId: string, updates: Partial<FilterCondition>) => {
    onFiltersChange(filters.map(f => 
      f.id === filterId ? { ...f, ...updates } : f
    ));
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange([]);
  };
  
  // Get input type based on column type
  const getInputType = (columnType: string) => {
    switch (columnType) {
      case COLUMN_TYPES.NUMBER:
        return 'number';
      case COLUMN_TYPES.DATE:
        return 'date';
      default:
        return 'text';
    }
  };
  
  // Get select options for select columns
  const getSelectOptions = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    return column?.metadata?.options || [];
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={panelRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Data</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filters.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No filters applied. Add a filter to start filtering your data.
              </p>
              <button
                onClick={addFilter}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                Add Filter
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filters.map((filter, index) => {
                const column = columns.find(c => c.id === filter.columnId);
                const operators = column ? getOperatorsForType(column.type) : [];
                const needsValue = operatorNeedsValue(filter.operator);
                const selectOptions = column?.type === COLUMN_TYPES.SELECT ? getSelectOptions(filter.columnId) : [];
                
                return (
                  <div key={filter.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    {/* Logic operator (AND/OR) - only show for filters after the first */}
                    {index > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Where</span>
                          <select
                            value={filter.logic}
                            onChange={(e) => updateFilter(filter.id, { logic: e.target.value as 'AND' | 'OR' })}
                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      {/* Column selection */}
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Column
                        </label>
                        <select
                          value={filter.columnId}
                          onChange={(e) => updateFilter(filter.id, { 
                            columnId: e.target.value,
                            operator: 'contains', // Reset operator when column changes
                            value: '' // Reset value when column changes
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {columns.map(column => (
                            <option key={column.id} value={column.id}>
                              {column.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Operator selection */}
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Condition
                        </label>
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(filter.id, { 
                            operator: e.target.value,
                            value: operatorNeedsValue(e.target.value) ? filter.value : ''
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {operators.map(op => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Value input */}
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Value
                        </label>
                        {needsValue ? (
                          column?.type === COLUMN_TYPES.SELECT ? (
                            <select
                              value={filter.value}
                              onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select option...</option>
                              {selectOptions.map(option => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : column?.type === COLUMN_TYPES.BOOLEAN ? (
                            <select
                              value={filter.value}
                              onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <input
                              type={getInputType(column?.type || 'text')}
                              value={filter.value}
                              onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Enter value..."
                            />
                          )
                        ) : (
                          <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                            No value needed
                          </div>
                        )}
                      </div>
                      
                      {/* Remove button */}
                      <div>
                        <button
                          onClick={() => removeFilter(filter.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                          title="Remove filter"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Add filter button */}
              <button
                onClick={addFilter}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Plus className="h-4 w-4" />
                Add Another Filter
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {filters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
            >
              Apply Filters ({filters.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}