export interface Column {
  id: string;
  name: string;
  type: 'text' | 'number';
}

export interface Cell {
  id: string;
  content: string;
  type: Column['type'];
}

export interface Row {
  id: string;
  cells: Record<string, Cell>;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  rows: Row[];
}

export interface DatabaseState {
  tables: Record<string, Table>;
  activeTableId: string | null;
  selectedRows: Record<string, string[]>; // tableId -> rowIds[]
  
  // Table operations
  createTable: (name: string) => string; // returns new table id
  setActiveTable: (tableId: string) => void;
  renameTable: (tableId: string, name: string) => void;
  
  // Column operations
  addColumn: (tableId: string) => void;
  addCustomColumn: (tableId: string, column: Omit<Column, 'id'>) => void;
  
  // Row operations
  addRow: (tableId: string) => void;
  updateCell: (tableId: string, rowId: string, columnId: string, value: string) => void;
  toggleRowSelection: (tableId: string, rowId: string) => void;
}