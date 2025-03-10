import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Filter, Settings, MoreHorizontal } from 'lucide-react';
import { DatabaseRow } from './DatabaseRow';
import { useDatabase } from './useDatabase';
import { Column } from './types';
import { Trash2 } from 'lucide-react';
import { DatabaseHeader } from './DatabaseHeader';

interface ColumnResizeData {
  columnId: string;
  startX: number;
  startWidth: number;
}

export function DatabaseTable() {
  const {
    tables,
    activeTableId,
    selectedRows,
    addColumn,
    updateColumn,
    deleteColumn,
    addRow,
    deleteRow,
    deleteMultipleRows,
    updateCell,
    toggleRowSelection,
    isLoading,
  } = useDatabase();

  // Get active table data
  const table = activeTableId ? tables[activeTableId] : null;
  const columns = table?.columns || [];
  const rows = table?.rows || [];
  const tableSelectedRows = activeTableId && selectedRows[activeTableId] ? selectedRows[activeTableId] : [];
  
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [resizing, setResizing] = useState<ColumnResizeData | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [selectedCellPosition, setSelectedCellPosition] = useState<{rowId: string; columnId: string} | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Calculate total width
  const totalTableWidth = React.useMemo(() => {
    let total = 10; // Checkbox column width
    columns.forEach(col => {
      total += columnWidths[col.id] || 150;
    });
    return total;
  }, [columns, columnWidths]);
  
  // Initialize column widths
  useEffect(() => {
    if (columns.length > 0) {
      const initialWidths: Record<string, number> = {};
      columns.forEach(column => {
        initialWidths[column.id] = columnWidths[column.id] || 150;
      });
      setColumnWidths(initialWidths);
    }
  }, [columns]);
  
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
  
  // Handle adding a column
  const handleAddColumn = () => {
    if (activeTableId) {
      addColumn(activeTableId);
    }
  };

  // Handle adding a custom column
  const handleAddCustomColumn = (column: Omit<Column, 'id'>) => {
    if (activeTableId) {
      addColumn(activeTableId, column);
    }
  };
  
  // Handle updating a column
  const handleUpdateColumn = (columnId: string, updates: Partial<Omit<Column, 'id'>>) => {
    if (activeTableId) {
      updateColumn(activeTableId, columnId, updates);
    }
  };
  
  // Handle deleting a column
  const handleDeleteColumn = (columnId: string) => {
    if (activeTableId) {
      deleteColumn(activeTableId, columnId);
    }
  };
  
  // Handle updating a cell
  const handleUpdateCell = (rowId: string, columnId: string, value: string) => {
    if (activeTableId) {
      updateCell(activeTableId, rowId, columnId, value);
    }
  };
  
  // Handle cell focus
  const handleCellFocus = (rowId: string, columnId: string) => {
    setSelectedCellPosition({ rowId, columnId });
  };
  
  // Handle adding a row
  const handleAddRow = () => {
    if (activeTableId) {
      addRow(activeTableId);
    }
  };
  
  // Handle row selection
  const handleToggleRowSelection = (rowId: string) => {
    if (activeTableId) {
      toggleRowSelection(activeTableId, rowId);
    }
  };
  
  // Handle deleting selected rows
  const handleDeleteSelectedRows = () => {
    if (activeTableId && tableSelectedRows.length > 0) {
      // Confirm deletion
      const isConfirmed = window.confirm(
        `Are you sure you want to delete ${tableSelectedRows.length > 1 ? 'these records' : 'this record'}? This action cannot be undone.`
      );
      
      if (isConfirmed) {
        // Use the new function to delete multiple rows at once
        if (tableSelectedRows.length > 1) {
          deleteMultipleRows(activeTableId, tableSelectedRows);
        } else {
          // For a single row, use the existing function
          deleteRow(activeTableId, tableSelectedRows[0]);
        }
      }
    }
  };
  
  if (!table) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400">Select a table to view data</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
            onClick={() => addRow(activeTableId || '')}
          >
            Create New Table
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden"
      ref={tableRef}
    >
      {/* Table Header Controls - Sticky */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {table.name}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {rows.length} {rows.length === 1 ? 'item' : 'items'}
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
      
      {/* Scrollable Table Body Area */}
      <div className="flex-1 overflow-auto">
        <div className="relative" style={{ minWidth: `${totalTableWidth}px` }}>
          {/* Table Headers - Sticky in the scrollable area */}
          <div className="sticky top-0 z-10">
            <DatabaseHeader 
              columns={columns}
              onAddColumn={handleAddColumn}
              onAddCustomColumn={handleAddCustomColumn}
              onUpdateColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
              columnWidths={columnWidths}
              onResizeStart={handleResizeStart}
            />
          </div>
          
          {/* Table Body */}
          <div className="flex flex-col w-full">
            {sortedRows.length > 0 ? (
              sortedRows.map((row) => (
                <DatabaseRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  isSelected={tableSelectedRows.includes(row.id)}
                  onSelect={() => handleToggleRowSelection(row.id)}
                  onCellUpdate={(columnId, value) => handleUpdateCell(row.id, columnId, value)}
                  onCellFocus={(rowId) => handleCellFocus(row.id, rowId)}
                  columnWidths={columnWidths}
                />
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 w-full">
                <p>No data yet. Add a new row to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Table Footer - Sticky */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center sticky bottom-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            <Plus size={14} />
            <span>New Row</span>
          </button>
          
          {tableSelectedRows.length > 0 && (
            <button
              onClick={handleDeleteSelectedRows}
              className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
            >
              <Trash2 size={14} />
              <span>Delete {tableSelectedRows.length > 1 ? `(${tableSelectedRows.length})` : ''}</span>
            </button>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {tableSelectedRows.length > 0 ? `${tableSelectedRows.length} of ${rows.length} selected` : `${rows.length} ${rows.length === 1 ? 'row' : 'rows'}`}
        </div>
      </div>
    </div>
  );
}