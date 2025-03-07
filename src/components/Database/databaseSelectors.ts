import { useDatabase } from './useDatabase';
import { Column } from './types';

// Hook to get active table data
export function useActiveTable() {
  const { 
    tables, 
    activeTableId, 
    selectedRows,
    addColumn,
    addRow,
    updateCell,
    toggleRowSelection 
  } = useDatabase();
  
  // Check if activeTableId exists and there's a corresponding table
  const hasActiveTable = Boolean(activeTableId && tables[activeTableId]);
  const table = activeTableId ? tables[activeTableId] : null;
  const tableSelectedRows = activeTableId && selectedRows[activeTableId] ? selectedRows[activeTableId] : [];
  
  // Default empty data to prevent undefined errors
  return {
    table,
    columns: hasActiveTable ? table.columns : [],
    rows: hasActiveTable ? table.rows : [],
    selectedRows: tableSelectedRows,
    addColumn: () => {
      if (activeTableId) addColumn(activeTableId);
    },
    addCustomColumn: (column: Omit<Column, 'id'>) => {
      if (activeTableId) addColumn(activeTableId, column);
    },
    addRow: () => {
      if (activeTableId) addRow(activeTableId);
    },
    updateCell: (rowId: string, columnId: string, value: string) => {
      if (activeTableId) updateCell(activeTableId, rowId, columnId, value);
    },
    toggleRowSelection: (rowId: string) => {
      if (activeTableId) toggleRowSelection(activeTableId, rowId);
    },
  };
}