import React, { useState } from 'react';
import { DatabaseHeader } from './DatabaseHeader';
import { DatabaseRow } from './DatabaseRow';
import { useDatabase } from './useDatabase';

export function DatabaseTable() {
  const {
    columns,
    rows,
    addColumn,
    addRow,
    updateCell,
    selectedRows,
    toggleRowSelection,
  } = useDatabase();
  const [focusedCell, setFocusedCell] = useState<{ rowId: string; columnId: string } | null>(null);

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
      <DatabaseHeader columns={columns} onAddColumn={addColumn} />
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
      <div className="border-t border-gray-700 p-2">
        <button
          onClick={addRow}
          className="text-gray-400 hover:text-gray-200 text-sm px-2 py-1 rounded hover:bg-gray-800"
        >
          + New Row
        </button>
      </div>
    </div>
  );
}