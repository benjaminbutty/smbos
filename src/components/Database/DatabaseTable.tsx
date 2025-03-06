import React, { useState } from 'react';
import { DatabaseHeader } from './DatabaseHeader';
import { DatabaseRow } from './DatabaseRow';
import { useDatabase } from './useDatabase';
import { Column } from './types';

export function DatabaseTable() {
  const {
    columns,
    rows,
    addColumn,
    addRow,
    updateCell,
    selectedRows,
    toggleRowSelection,
    addCustomColumn,
  } = useDatabase();
  const [focusedCell, setFocusedCell] = useState<{ rowId: string; columnId: string } | null>(null);

  const handleAddCustomColumn = (column: Omit<Column, 'id'>) => {
    addCustomColumn(column);
  };

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
        {rows.map((row) => (
          <DatabaseRow
            key={row.id}
            row={row}
            columns={columns}
            isSelected={selectedRows.includes(row.id)}
            onSelect={() => toggleRowSelection(row.id)}
            onCellUpdate={(columnId, value) => updateCell(row.id, columnId, value)}
            onCellFocus={(rowId, columnId) => setFocusedCell({ rowId, columnId })}
          />
        ))}
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