import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Filter, Settings, MoreHorizontal } from 'lucide-react';
import { DatabaseRow } from './DatabaseRow';
import { useDatabase } from './useDatabase';
import { Column } from './types';
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
    updateCell,
    toggleRowSelection,
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
  
  if (!table) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400">Select a table to view data</p>
          <button 
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-blue-500"
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
      
      <div className="overflow-auto flex-1">
        <div className="relative" style={{ minWidth: `${totalTableWidth}px` }}>
          {/* Table Headers */}
          <DatabaseHeader 
            columns={columns}
            onAddColumn={handleAddColumn}
            onAddCustomColumn={handleAddCustomColumn}
            onUpdateColumn={handleUpdateColumn}
            onDeleteColumn={handleDeleteColumn}
            columnWidths={columnWidths}
            onResizeStart={handleResizeStart}
          />
          
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
                  onCellFocus={(columnId) => handleCellFocus(row.id, columnId)}
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
      
      {/* Table Footer */}
      <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <button
          onClick={handleAddRow}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
        >
          <Plus size={14} />
          <span>New Row</span>
        </button>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {tableSelectedRows.length} of {rows.length} selected
        </div>
      </div>
    </div>
  );
}