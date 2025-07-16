import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Filter, Settings, MoreHorizontal, Download, Copy, Trash2 } from 'lucide-react';
import { DatabaseRow } from './DatabaseRow';
import { useDatabase } from './useDatabase';
import { Column } from './types';
import { DatabaseHeader } from './DatabaseHeader';
import { TableSettingsPanel } from './TableSettingsPanel';
import { FilterPanel, FilterCondition } from './FilterPanel';

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
    deleteTable,
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [tableDensity, setTableDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  
  // Get visible columns (excluding hidden ones)
  const visibleColumns = React.useMemo(() => {
    return columns.filter(col => !hiddenColumns.includes(col.id));
  }, [columns, hiddenColumns]);
  
  // Calculate total width
  const totalTableWidth = React.useMemo(() => {
    let total = 10; // Checkbox column width
    visibleColumns.forEach(col => {
      total += columnWidths[col.id] || 150;
    });
    return total;
  }, [visibleColumns, columnWidths]);
  
  // Initialize column widths
  useEffect(() => {
    if (visibleColumns.length > 0) {
      const initialWidths: Record<string, number> = {};
      visibleColumns.forEach(column => {
        initialWidths[column.id] = columnWidths[column.id] || 150;
      });
      setColumnWidths(initialWidths);
    }
  }, [visibleColumns]);
  
  // Get table density styles
  const getDensityStyles = () => {
    switch (tableDensity) {
      case 'compact':
        return 'min-h-[1.75rem]'; // 28px
      case 'comfortable':
        return 'min-h-[3rem]'; // 48px
      case 'normal':
      default:
        return 'min-h-[2.25rem]'; // 36px
    }
  };
  
  // Handle column visibility toggle
  const handleToggleColumnVisibility = (columnId: string) => {
    setHiddenColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };
  
  // Handle column reordering (placeholder - would need more complex implementation)
  const handleReorderColumns = (dragIndex: number, hoverIndex: number) => {
    // This would require updating the column order in the database
    console.log('Reorder columns:', dragIndex, 'to', hoverIndex);
  };
  
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
    let filteredRows = rows;
    
    // Apply filters first
    if (filters.length > 0) {
      filteredRows = rows.filter(row => {
        return filters.every((filter, index) => {
          const cell = row.cells[filter.columnId];
          const cellValue = cell?.content || '';
          const filterValue = filter.value.toLowerCase();
          const cellValueLower = cellValue.toLowerCase();
          
          let matches = false;
          
          // Apply the filter condition
          switch (filter.operator) {
            case 'equals':
              matches = cellValue === filter.value;
              break;
            case 'not_equals':
              matches = cellValue !== filter.value;
              break;
            case 'contains':
              matches = cellValueLower.includes(filterValue);
              break;
            case 'not_contains':
              matches = !cellValueLower.includes(filterValue);
              break;
            case 'starts_with':
              matches = cellValueLower.startsWith(filterValue);
              break;
            case 'ends_with':
              matches = cellValueLower.endsWith(filterValue);
              break;
            case 'greater_than':
              matches = parseFloat(cellValue) > parseFloat(filter.value);
              break;
            case 'less_than':
              matches = parseFloat(cellValue) < parseFloat(filter.value);
              break;
            case 'greater_equal':
              matches = parseFloat(cellValue) >= parseFloat(filter.value);
              break;
            case 'less_equal':
              matches = parseFloat(cellValue) <= parseFloat(filter.value);
              break;
            case 'after':
              matches = new Date(cellValue) > new Date(filter.value);
              break;
            case 'before':
              matches = new Date(cellValue) < new Date(filter.value);
              break;
            case 'on_or_after':
              matches = new Date(cellValue) >= new Date(filter.value);
              break;
            case 'on_or_before':
              matches = new Date(cellValue) <= new Date(filter.value);
              break;
            case 'is_empty':
              matches = !cellValue || cellValue.trim() === '';
              break;
            case 'is_not_empty':
              matches = cellValue && cellValue.trim() !== '';
              break;
            default:
              matches = true;
          }
          
          // Handle logic operators (AND/OR)
          if (index === 0) {
            return matches;
          } else {
            const previousResult = filters.slice(0, index).every((prevFilter, prevIndex) => {
              // This is a simplified logic - in a real implementation, you'd want more sophisticated logic handling
              return true; // For now, we'll use AND logic between all filters
            });
            
            return filter.logic === 'AND' ? matches : matches;
          }
        });
      });
    }
    
    // Then apply sorting
    if (!sortColumn) return filteredRows;
    
    return [...filteredRows].sort((a, b) => {
      const aValue = a.cells[sortColumn]?.content || '';
      const bValue = b.cells[sortColumn]?.content || '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [rows, sortColumn, sortDirection, filters]);
  
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
  
  // Handle export data
  const handleExportData = () => {
    if (!table) return;
    
    // Create CSV content
    const headers = visibleColumns.map(col => col.name).join(',');
    const csvRows = rows.map(row => 
      visibleColumns.map(col => {
        const cell = row.cells[col.id];
        const content = cell?.content || '';
        // Escape quotes and wrap in quotes if contains comma
        return content.includes(',') || content.includes('"') 
          ? `"${content.replace(/"/g, '""')}"` 
          : content;
      }).join(',')
    );
    
    const csvContent = [headers, ...csvRows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${table.name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowMoreMenu(false);
  };
  
  // Handle duplicate table
  const handleDuplicateTable = async () => {
    if (!table) return;
    
    try {
      // Create a new table with the same name + " (Copy)"
      const newTableId = await createTable(`${table.name} (Copy)`);
      
      // Note: In a full implementation, you would also copy the columns and data
      // For now, this creates an empty table with default columns
      
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Error duplicating table:', error);
    }
  };
  
  // Handle delete table
  const handleDeleteTable = async () => {
    if (!table) return;
    
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the table "${table.name}"? This action cannot be undone and will permanently delete all data in this table.`
    );
    
    if (isConfirmed) {
      try {
        await deleteTable(table.id);
        setShowMoreMenu(false);
      } catch (error) {
        console.error('Error deleting table:', error);
      }
    }
  };
  
  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);
  
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
          <button 
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 ${
              filters.length > 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
            }`}
            onClick={() => setShowFilterPanel(true)}
          >
            <Filter size={16} />
            {filters.length > 0 && (
              <span className="ml-1 text-xs">{filters.length}</span>
            )}
          </button>
          <button 
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            onClick={() => setShowSettingsPanel(true)}
          >
            <Settings size={16} />
          </button>
          
          {/* More menu */}
          <div className="relative" ref={moreMenuRef}>
            <button 
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MoreHorizontal size={16} />
            </button>
            
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Download size={14} />
                  Export as CSV
                </button>
                
                <button
                  onClick={handleDuplicateTable}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Copy size={14} />
                  Duplicate Table
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                
                <button
                  onClick={handleDeleteTable}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={14} />
                  Delete Table
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Scrollable Table Body Area */}
      <div className="flex-1 overflow-auto">
        <div className="relative" style={{ minWidth: `${totalTableWidth}px` }}>
          {/* Table Headers - Sticky in the scrollable area */}
          <div className="sticky top-0 z-10">
            <DatabaseHeader 
              columns={visibleColumns}
              tableId={activeTableId || ''}
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
                  columns={visibleColumns}
                  isSelected={tableSelectedRows.includes(row.id)}
                  onSelect={() => handleToggleRowSelection(row.id)}
                  onCellUpdate={(columnId, value) => handleUpdateCell(row.id, columnId, value)}
                  onCellFocus={(rowId) => handleCellFocus(row.id, rowId)}
                  columnWidths={columnWidths}
                  tableDensity={tableDensity}
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
      
      {/* Settings Panel */}
      <TableSettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        columns={columns}
        onUpdateColumn={handleUpdateColumn}
        onReorderColumns={handleReorderColumns}
        tableDensity={tableDensity}
        onTableDensityChange={setTableDensity}
        hiddenColumns={hiddenColumns}
        onToggleColumnVisibility={handleToggleColumnVisibility}
      />
      
      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        columns={columns}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}