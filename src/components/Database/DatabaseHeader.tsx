import React, { useState, useEffect, useRef } from 'react';
import { GripVertical, Type, DollarSign, Edit2 } from 'lucide-react';
import { Column } from './types';
import { ColumnPicker } from './ColumnPicker';
import { ColumnSettingsPopover } from './ColumnSettingsPopover';

interface DatabaseHeaderProps {
  columns: Column[];
  onAddColumn: () => void;
  onAddCustomColumn: (column: Omit<Column, 'id'>) => void;
  onUpdateColumn: (columnId: string, updates: Partial<Omit<Column, 'id'>>) => void;
  onDeleteColumn: (columnId: string) => void;
  onReorderColumn?: (dragIndex: number, hoverIndex: number) => void;
  columnWidths: Record<string, number>;
  onResizeStart: (e: React.MouseEvent, columnId: string) => void;
}

export function DatabaseHeader({ 
  columns, 
  onAddColumn, 
  onAddCustomColumn,
  onUpdateColumn,
  onDeleteColumn,
  onReorderColumn,
  columnWidths,
  onResizeStart
}: DatabaseHeaderProps) {
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Focus the input when editing begins
    if (editingColumnId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingColumnId]);
  
  // Start editing a column name
  const handleStartEditing = (columnId: string, columnName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingColumnId(columnId);
    setEditingColumnName(columnName);
  };
  
  // Save column name changes
  const handleSaveColumnName = () => {
    if (editingColumnId) {
      onUpdateColumn(editingColumnId, { name: editingColumnName.trim() || 'Untitled' });
      setEditingColumnId(null);
    }
  };
  
  // Handle keyboard events for column name editing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveColumnName();
    } else if (e.key === 'Escape') {
      setEditingColumnId(null);
    }
  };
  
  // Get icon based on column type
  const getColumnIcon = (column: Column) => {
    switch (column.type) {
      case 'number':
        return <DollarSign className="h-4 w-4 text-gray-500" />;
      case 'text':
      default:
        return <Type className="h-4 w-4 text-gray-500" />;
    }
  };

  // Toggle column settings popover
  const toggleColumnSettings = (columnId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePopoverId(activePopoverId === columnId ? null : columnId);
  };
  
  // Close all popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activePopoverId && 
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.column-header')
      ) {
        setActivePopoverId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopoverId]);
  
  return (
    <div className="flex w-full border-b border-gray-700 bg-gray-900 shadow-sm z-20">
      {/* Checkbox column header */}
      <div className="w-10 flex-shrink-0 border-r border-gray-700" />
      
      {/* Column headers */}
      {columns.map((column) => (
        <div
          key={column.id}
          className="column-header border-r border-gray-700 select-none relative group"
          style={{ 
            width: columnWidths[column.id] || 150, 
            minWidth: 100,
            flexShrink: 0,
            flexGrow: 0
          }}
        >
          {/* Column header (clickable) */}
          <div 
            className={`flex items-center gap-2 w-full px-2 py-2 cursor-pointer transition-colors hover:bg-gray-800 ${
              activePopoverId === column.id ? 'bg-gray-800' : ''
            }`}
            onClick={(e) => toggleColumnSettings(column.id, e)}
          >
            {/* Drag handle */}
            <div className="flex-shrink-0">
              <GripVertical className="h-4 w-4 text-gray-500 cursor-move" />
            </div>
            
            {/* Column type icon */}
            <div className="flex-shrink-0">
              {getColumnIcon(column)}
            </div>
            
            {/* Column name (editable) */}
            {editingColumnId === column.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editingColumnName}
                onChange={(e) => setEditingColumnName(e.target.value)}
                onBlur={handleSaveColumnName}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-gray-800 text-gray-200 px-1 py-0.5 text-sm rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex-1 flex items-center text-sm font-medium text-gray-200">
                <span 
                  className="truncate"
                  onDoubleClick={(e) => handleStartEditing(column.id, column.name, e)}
                >
                  {column.name}
                </span>
                
                {/* Edit button (shows on hover) */}
                <button
                  onClick={(e) => handleStartEditing(column.id, column.name, e)}
                  className="ml-1 p-1 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* Column settings popover */}
          {activePopoverId === column.id && (
            <div ref={popoverRef} onClick={e => e.stopPropagation()}>
              <ColumnSettingsPopover
                column={column}
                onUpdateColumn={onUpdateColumn}
                onDeleteColumn={onDeleteColumn}
                onClose={() => setActivePopoverId(null)}
              />
            </div>
          )}
          
          {/* Resize handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize group z-20"
            onMouseDown={(e) => onResizeStart(e, column.id)}
          >
            <div className="invisible group-hover:visible w-1 h-full bg-blue-500"></div>
          </div>
        </div>
      ))}
      
      {/* Add column button */}
      <div className="border-l border-gray-700">
        <ColumnPicker onAddColumn={onAddCustomColumn} />
      </div>
    </div>
  );
}