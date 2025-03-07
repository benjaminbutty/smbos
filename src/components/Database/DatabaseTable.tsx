import React, { useState, useEffect } from 'react';
import { DatabaseHeader } from './DatabaseHeader';
import { DatabaseRow } from './DatabaseRow';
import { useActiveTable } from './databaseSelectors';
import { useDatabase } from './useDatabase';
import { Column } from './types';

interface DatabaseTableProps {
  tableName?: string;
}

export function DatabaseTable({ tableName }: DatabaseTableProps) {
  const { fetchUserTables, isLoading, error } = useDatabase();
  
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
  
  const [focusedCell, setFocusedCell] = useState<{ rowId: string; columnId: string } | null>(null);

  // Fetch tables when component mounts
  useEffect(() => {
    fetchUserTables();
  }, [fetchUserTables]);

  const handleAddCustomColumn = (column: Omit<Column, 'id'>) => {
    addCustomColumn(column);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex-1 flex items-center justify-center bg-gray-900 text-gray-400 rounded-lg">
        <div className="text-center p-8">
          <p className="text-xl mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full flex-1 flex items-center justify-center bg-gray-900 text-red-400 rounded-lg">
        <div className="text-center p-8">
          <p className="text-xl mb-4">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // If no active table or table not properly loaded, show empty state
  if (!table || !columns || columns.length === 0) {
    return (
      <div className="w-full h-full flex-1 flex items-center justify-center bg-gray-900 text-gray-400 rounded-lg">
        <div className="text-center p-8">
          <p className="text-xl mb-4">No table selected</p>
          <p>Select a table from the sidebar or create a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
      <div className="sticky top-0 z-10">
        <DatabaseHeader 
          columns={columns} 
          onAddColumn={addColumn} 
          onAddCustomColumn={handleAddCustomColumn} 
        />
      </div>
      <div className="flex-1 overflow-auto">
        {rows && rows.length > 0 ? (
          rows.map((row) => (
            <DatabaseRow
              key={row.id}
              row={row}
              columns={columns}
              isSelected={selectedRows?.includes(row.id) || false}
              onSelect={() => toggleRowSelection(row.id)}
              onCellUpdate={(columnId, value) => updateCell(row.id, columnId, value)}
              onCellFocus={(rowId, columnId) => setFocusedCell({ rowId, columnId })}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p>No data yet. Add a new row to get started.</p>
          </div>
        )}
      </div>
      <div className="sticky bottom-0 border-t border-gray-700 p-2 bg-gray-900">
        <button
          onClick={addRow}
          className="text-gray-400 hover:text-gray-200 text-sm px-3 py-2 rounded hover:bg-gray-800"
        >
          + New Row
        </button>
      </div>
    </div>
  );
}