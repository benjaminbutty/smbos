// src/components/Database/useDatabase.ts
import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import { Column, Row, Cell } from './types';

export interface DatabaseState {
  tables: Record<string, Table>;
  activeTableId: string | null;
  selectedRows: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
  
  // Initial data loading
  fetchUserTables: () => Promise<void>;
  
  // Table operations
  createTable: (name: string) => Promise<string>; 
  renameTable: (tableId: string, name: string) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
  setActiveTable: (tableId: string) => void;
  
  // Column operations
  addColumn: (tableId: string, column?: Omit<Column, 'id'>) => Promise<void>;
  
  // Row operations  
  addRow: (tableId: string) => Promise<void>;
  updateCell: (tableId: string, rowId: string, columnId: string, value: string) => Promise<void>;
  toggleRowSelection: (tableId: string, rowId: string) => void;
}

export const useDatabase = create<DatabaseState>((set, get) => ({
  tables: {},
  activeTableId: null,
  selectedRows: {},
  isLoading: false,
  error: null,
  
  fetchUserTables: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('database_tables')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (tablesError) throw tablesError;
      
      const tables: Record<string, Table> = {};
      let activeTableId = null;
      
      // Process each table
      for (const tableData of tablesData) {
        // Set the first table as active if none is active
        if (!activeTableId) activeTableId = tableData.id;
        
        // Fetch columns for this table
        const { data: columnsData, error: columnsError } = await supabase
          .from('database_columns')
          .select('*')
          .eq('table_id', tableData.id)
          .order('order', { ascending: true });
          
        if (columnsError) throw columnsError;
        
        // Fetch rows for this table
        const { data: rowsData, error: rowsError } = await supabase
          .from('database_rows')
          .select('*')
          .eq('table_id', tableData.id)
          .order('created_at', { ascending: true });
          
        if (rowsError) throw rowsError;
        
        // Get all row IDs to fetch cells
        const rowIds = rowsData.map(row => row.id);
        
        // Fetch cells for all rows in this table
        const { data: cellsData, error: cellsError } = await supabase
          .from('database_cells')
          .select('*')
          .in('row_id', rowIds);
          
        if (cellsError) throw cellsError;
        
        // Process data into our format
        const columns = columnsData.map(col => ({
          id: col.id,
          name: col.name,
          type: col.type,
        }));
        
        const rows = rowsData.map(row => {
          // Get cells for this row
          const rowCells = cellsData.filter(cell => cell.row_id === row.id);
          
          // Convert to our cell format
          const cells: Record<string, Cell> = {};
          rowCells.forEach(cell => {
            const column = columnsData.find(col => col.id === cell.column_id);
            cells[cell.column_id] = {
              id: cell.id,
              content: cell.content,
              type: column ? column.type : 'text',
            };
          });
          
          return {
            id: row.id,
            cells,
          };
        });
        
        // Add this table to our tables object
        tables[tableData.id] = {
          id: tableData.id,
          name: tableData.name,
          columns,
          rows,
        };
      }
      
      set({ 
        tables, 
        activeTableId, 
        isLoading: false,
        selectedRows: Object.keys(tables).reduce((acc, tableId) => {
          acc[tableId] = [];
          return acc;
        }, {}),
      });
      
    } catch (error) {
      console.error('Error fetching tables:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load tables' 
      });
    }
  },
  
  createTable: async (name) => {
    set({ isLoading: true, error: null });
    try {
      // Create table in Supabase
      const { data: tableData, error: tableError } = await supabase
        .from('database_tables')
        .insert({ name, user_id: (await supabase.auth.getUser()).data.user?.id })
        .select()
        .single();
        
      if (tableError) throw tableError;
      
      // Create default columns
      const defaultColumns = [
        { table_id: tableData.id, name: 'Name', type: 'text', order: 0 },
        { table_id: tableData.id, name: 'Type', type: 'text', order: 1 },
        { table_id: tableData.id, name: 'Status', type: 'text', order: 2 },
      ];
      
      const { data: columnsData, error: columnsError } = await supabase
        .from('database_columns')
        .insert(defaultColumns)
        .select();
        
      if (columnsError) throw columnsError;
      
      // Create a default row
      const { data: rowData, error: rowError } = await supabase
        .from('database_rows')
        .insert({ table_id: tableData.id })
        .select()
        .single();
        
      if (rowError) throw rowError;
      
      // Create empty cells for each column
      const cells = columnsData.map(column => ({
        row_id: rowData.id,
        column_id: column.id,
        content: '',
      }));
      
      const { error: cellsError } = await supabase
        .from('database_cells')
        .insert(cells);
        
      if (cellsError) throw cellsError;
      
      // Format data for our frontend state
      const columns = columnsData.map(col => ({
        id: col.id,
        name: col.name,
        type: col.type as 'text' | 'number',
      }));
      
      const cellsObject: Record<string, Cell> = {};
      columnsData.forEach((col, index) => {
        cellsObject[col.id] = {
          id: cells[index].id || `temp-${index}`,
          content: '',
          type: col.type as 'text' | 'number',
        };
      });
      
      const newTable: Table = {
        id: tableData.id,
        name: tableData.name,
        columns,
        rows: [
          {
            id: rowData.id,
            cells: cellsObject,
          },
        ],
      };
      
      // Update our state
      set(state => ({
        tables: {
          ...state.tables,
          [tableData.id]: newTable,
        },
        activeTableId: tableData.id,
        selectedRows: {
          ...state.selectedRows,
          [tableData.id]: [],
        },
        isLoading: false,
      }));
      
      return tableData.id;
      
    } catch (error) {
      console.error('Error creating table:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to create table' 
      });
      return ''; // Return empty string if failed
    }
  },
  
  // Other methods would follow a similar pattern
  // ...
}));