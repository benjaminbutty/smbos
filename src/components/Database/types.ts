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

export interface DatabaseState {
  columns: Column[];
  rows: Row[];
  selectedRows: string[];
  addColumn: () => void;
  addRow: () => void;
  updateCell: (rowId: string, columnId: string, value: string) => void;
  toggleRowSelection: (rowId: string) => void;
}