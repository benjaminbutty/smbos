import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, Filter, Settings, MoreHorizontal } from 'lucide-react';
import { DatabaseRow } from './DatabaseRow';
import { useActiveTable } from './databaseSelectors';
import { Column } from './types';

interface ColumnResizeData {
  columnId: string;
  startX: number;
  startWidth: number;
}

export function DatabaseTable() {
  const {
    columns,
    rows,
    selectedRows,
    addColumn,
    addCustomColumn,
    addRow,
    updateCell,
    toggleRowSelection,
    table
  } = useActiveTable();
  
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [resizing, setResizing] = useState<ColumnResizeData | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Handle column sorting
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };
  
  // Handle column resize
  const handleResizeStart = (e: React.MouseEvent, columnId: string) => {
    // Get current width of column
    const currentWidth = columnWidths[columnId] || 150;
    
    setResizing({
      columnId,
      startX: e.clientX,
      startWidth: currentWidth
    });
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    
    e.preventDefault();
  };
  
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;
    
    const diff = e.clientX - resizing.startX;
    const newWidth = Math.max(100, resizing.startWidth + diff);
    
    setColumnWidths(prev => ({
      ...prev,
      [resizing.columnId]: newWidth
    }));
  }, [resizing]);
  
  const handleResizeEnd = useCallback(() => {
    setResizing(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);
  
  // Clean up event listeners on unmount
  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);
  
  // Get sorted rows
  const sortedRows = React.useMemo(() => {
    if (!sortColumn) return rows;
    
    return [...rows].sort((a, b) => {
      const aValue = a.cells[sortColumn]?.content || '';
      const bValue = b.cells[sortColumn]?.content || '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [rows, sortColumn, sortDirection]);
  
  // Handle adding a new column
  const handleAddColumn = () => {
    addCustomColumn({ name: 'New Column', type: 'text' });
  };
  
  if (!table) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400">Select a table to view data</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="w-full h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      ref={tableRef}
    >
      {/* Table Header Controls */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {table.name}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {rows.length} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
            <Filter size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
            <Settings size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
      
      {/* Table Header */}
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="flex">
          {/* Checkbox column */}
          <div className="w-10 flex-shrink-0 p-2 border-r border-gray-200 dark:border-gray-700">
            <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"></div>
          </div>
          
          {/* Column headers */}
          {columns.map((column) => (
            <div
              key={column.id}
              className="border-r border-gray-200 dark:border-gray-700 relative"
              style={{ width: columnWidths[column.id] || 150, minWidth: 100 }}
            >
              <div 
                className="flex items-center justify-between px-3 py-2 select-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort(column.id)}
              >
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {column.name}
                </span>
                <div className="flex items-center text-gray-400">
                  {sortColumn === column.id && (
                    sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </div>
              
              {/* Resize handle */}
              <div
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize group"
                onMouseDown={(e) => handleResizeStart(e, column.id)}
              >
                <div className="invisible group-hover:visible w-1 h-full bg-blue-500"></div>
              </div>
            </div>
          ))}
          
          {/* Add column button */}
          <div className="px-3 py-2 flex items-center">
            <button
              onClick={handleAddColumn}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        {sortedRows.length > 0 ? (
          sortedRows.map((row) => (
            <DatabaseRow
              key={row.id}
              row={row}
              columns={columns}
              isSelected={selectedRows?.includes(row.id) || false}
              onSelect={() => toggleRowSelection(row.id)}
              onCellUpdate={(columnId, value) => updateCell(row.id, columnId, value)}
              onCellFocus={() => {}}
              columnWidths={columnWidths}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p>No data yet. Add a new row to get started.</p>
          </div>
        )}
      </div>
      
      {/* Table Footer */}
      <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <button
          onClick={addRow}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-500"
        >
          <Plus size={14} />
          <span>New Row</span>
        </button>
        
        <div className="text-xs text-gray-500">
          {selectedRows?.length || 0} of {rows.length} selected
        </div>
      </div>
    </div>
  );
}