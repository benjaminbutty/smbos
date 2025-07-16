import { Block } from '../../types/blocks';

// Update types.ts to expand column types
export interface Column {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  // Add metadata field for additional type-specific settings
  metadata?: {
    options?: string[]; // For select fields
    format?: string; // For date/number fields
    // Other type-specific settings
  };
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
  pages: Record<string, Page>;
  activePageId: string | null;
  selectedRows: Record<string, string[]>; // tableId -> rowIds[]
  
  // Table operations
  createTable: (name: string) => string; // returns new table id
  setActiveTable: (tableId: string) => void;
  renameTable: (tableId: string, name: string) => void;
  
  // Column operations
  addColumn: (tableId: string) => void;
  addCustomColumn: (tableId: string, column: Omit<Column, 'id'>) => void;
  
  // Page operations
  createPage: (name: string) => Promise<string>;
  renamePage: (pageId: string, name: string) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  setActivePage: (pageId: string) => void;
  updatePageContent: (pageId: string, content: any) => Promise<void>;
  
  // Row operations
  addRow: (tableId: string) => void;
  deleteRow: (tableId: string, rowId: string) => Promise<void>;
  deleteMultipleRows: (tableId: string, rowIds: string[]) => Promise<void>;
  updateCell: (tableId: string, rowId: string, columnId: string, value: string) => void;
  toggleRowSelection: (tableId: string, rowId: string) => void;

    // Data loading
  fetchUserTables: () => Promise<void>;
}

export interface Page {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  blocks: Block[]; // Array of block objects
}
