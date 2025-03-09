import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import { Column, Row, Cell, Table } from './types';

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
  updateColumn: (tableId: string, columnId: string, updates: Partial<Omit<Column, 'id'>>) => Promise<void>;
  deleteColumn: (tableId: string, columnId: string) => Promise<void>;
  
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
      const { data: tablesData, error: tablesError } = await supabase
        .from('database_tables')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (tablesError) throw tablesError;
      
      const tables: Record<string, Table> = {};
      let activeTableId = get().activeTableId;
      
      for (const tableData of tablesData) {
        if (!activeTableId) activeTableId = tableData.id;
        
        const { data: columnsData, error: columnsError } = await supabase
          .from('database_columns')
          .select('*')
          .eq('table_id', tableData.id)
          .order('order', { ascending: true });
          
        if (columnsError) throw columnsError;
        
        const { data: rowsData, error: rowsError } = await supabase
          .from('database_rows')
          .select('*')
          .eq('table_id', tableData.id)
          .order('created_at', { ascending: true });
          
        if (rowsError) throw rowsError;
        
        const rowIds = rowsData.map(row => row.id);
        
        const { data: cellsData, error: cellsError } = await supabase
          .from('database_cells')
          .select('*')
          .in('row_id', rowIds);
          
        if (cellsError) throw cellsError;
        
        const columns = columnsData.map(col => ({
          id: col.id,
          name: col.name,
          type: col.type as 'text' | 'number',
        }));
        
        const rows = rowsData.map(row => {
          const rowCells = cellsData.filter(cell => cell.row_id === row.id);
          const cells: Record<string, Cell> = {};
          
          rowCells.forEach(cell => {
            const column = columnsData.find(col => col.id === cell.column_id);
            cells[cell.column_id] = {
              id: cell.id,
              content: cell.content || '',
              type: column?.type as 'text' | 'number',
            };
          });
          
          return {
            id: row.id,
            cells,
          };
        });
        
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
        }, {} as Record<string, string[]>),
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
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }
  
      const { data: tableData, error: tableError } = await supabase
        .from('database_tables')
        .insert({ name, user_id: userId })
        .select()
        .single();
        
      if (tableError) throw tableError;
      
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
      
      const { data: rowData, error: rowError } = await supabase
        .from('database_rows')
        .insert({ table_id: tableData.id })
        .select()
        .single();
        
      if (rowError) throw rowError;
      
      const cells = columnsData.map(column => ({
        row_id: rowData.id,
        column_id: column.id,
        content: '',
      }));
      
      const { error: cellsError } = await supabase
        .from('database_cells')
        .insert(cells);
        
      if (cellsError) throw cellsError;
      
      const newTable: Table = {
        id: tableData.id,
        name: tableData.name,
        columns: columnsData.map(col => ({
          id: col.id,
          name: col.name,
          type: col.type as 'text' | 'number',
        })),
        rows: [{
          id: rowData.id,
          cells: columnsData.reduce((acc, col) => {
            acc[col.id] = {
              id: `temp-${col.id}`,
              content: '',
              type: col.type as 'text' | 'number',
            };
            return acc;
          }, {} as Record<string, Cell>),
        }],
      };
      
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
      return '';
    }
  },

  setActiveTable: (tableId: string) => {
    if (get().tables[tableId]) {
      set({ activeTableId: tableId });
    }
  },

  renameTable: async (tableId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('database_tables')
        .update({ name })
        .eq('id', tableId);

      if (error) throw error;

      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            name,
          },
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error renaming table:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to rename table' 
      });
    }
  },

  deleteTable: async (tableId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('database_tables')
        .delete()
        .eq('id', tableId);

      if (error) throw error;

      set(state => {
        const { [tableId]: _, ...remainingTables } = state.tables;
        const { [tableId]: __, ...remainingSelectedRows } = state.selectedRows;
        return {
          tables: remainingTables,
          selectedRows: remainingSelectedRows,
          activeTableId: Object.keys(remainingTables)[0] || null,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Error deleting table:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete table' 
      });
    }
  },

  addColumn: async (tableId: string, column?: Omit<Column, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const table = get().tables[tableId];
      if (!table) throw new Error('Table not found');

      const newColumn = {
        table_id: tableId,
        name: column?.name || 'New Column',
        type: column?.type || 'text',
        order: table.columns.length,
      };

      const { data: columnData, error: columnError } = await supabase
        .from('database_columns')
        .insert(newColumn)
        .select()
        .single();

      if (columnError) throw columnError;

      // Create cells for the new column
      const cellInserts = table.rows.map(row => ({
        row_id: row.id,
        column_id: columnData.id,
        content: '',
      }));

      if (cellInserts.length > 0) {
        const { error: cellsError } = await supabase
          .from('database_cells')
          .insert(cellInserts);

        if (cellsError) throw cellsError;
      }

      // Update local state
      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            columns: [...table.columns, {
              id: columnData.id,
              name: columnData.name,
              type: columnData.type as 'text' | 'number',
            }],
            rows: table.rows.map(row => ({
              ...row,
              cells: {
                ...row.cells,
                [columnData.id]: {
                  id: `temp-${columnData.id}-${row.id}`,
                  content: '',
                  type: columnData.type as 'text' | 'number',
                },
              },
            })),
          },
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error adding column:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add column' 
      });
    }
  },

  updateColumn: async (tableId: string, columnId: string, updates: Partial<Omit<Column, 'id'>>) => {
    set({ isLoading: true, error: null });
    try {
      const table = get().tables[tableId];
      if (!table) throw new Error('Table not found');
      
      const column = table.columns.find(col => col.id === columnId);
      if (!column) throw new Error('Column not found');
      
      const { error } = await supabase
        .from('database_columns')
        .update({
          name: updates.name !== undefined ? updates.name : column.name,
          type: updates.type !== undefined ? updates.type : column.type,
        })
        .eq('id', columnId);

      if (error) throw error;
      
      // If type has changed, update all cells of this column
      if (updates.type && updates.type !== column.type) {
        // For simplicity, we're just updating the type in the database
        // In a real implementation, you might need to convert the data
        const rowIds = table.rows.map(row => row.id);
        
        if (rowIds.length > 0) {
          const { data: cellsData } = await supabase
            .from('database_cells')
            .select('id, row_id')
            .eq('column_id', columnId)
            .in('row_id', rowIds);
            
          if (cellsData && cellsData.length > 0) {
            // If we need to transform cell values based on new type,
            // we would do that here
          }
        }
      }

      // Update local state
      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            columns: table.columns.map(col => 
              col.id === columnId 
                ? { ...col, ...updates }
                : col
            ),
            rows: table.rows.map(row => ({
              ...row,
              cells: {
                ...row.cells,
                [columnId]: row.cells[columnId] 
                  ? {
                      ...row.cells[columnId],
                      type: updates.type || row.cells[columnId].type,
                    }
                  : row.cells[columnId],
              },
            })),
          },
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating column:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update column' 
      });
    }
  },

  deleteColumn: async (tableId: string, columnId: string) => {
    set({ isLoading: true, error: null });
    try {
      const table = get().tables[tableId];
      if (!table) throw new Error('Table not found');
      
      // Delete from database - cascade should handle related cells
      const { error } = await supabase
        .from('database_columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      // Update local state
      set(state => {
        const updatedColumns = table.columns.filter(col => col.id !== columnId);
        const updatedRows = table.rows.map(row => {
          const { [columnId]: removedCell, ...remainingCells } = row.cells;
          return {
            ...row,
            cells: remainingCells,
          };
        });
        
        return {
          tables: {
            ...state.tables,
            [tableId]: {
              ...table,
              columns: updatedColumns,
              rows: updatedRows,
            },
          },
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Error deleting column:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete column' 
      });
    }
  },

  addRow: async (tableId: string) => {
    set({ isLoading: true, error: null });
    try {
      const table = get().tables[tableId];
      if (!table) throw new Error('Table not found');

      const { data: rowData, error: rowError } = await supabase
        .from('database_rows')
        .insert({ table_id: tableId })
        .select()
        .single();

      if (rowError) throw rowError;

      const cells = table.columns.map(column => ({
        row_id: rowData.id,
        column_id: column.id,
        content: '',
      }));

      const { error: cellsError } = await supabase
        .from('database_cells')
        .insert(cells);

      if (cellsError) throw cellsError;

      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            rows: [...table.rows, {
              id: rowData.id,
              cells: table.columns.reduce((acc, column) => {
                acc[column.id] = {
                  id: `temp-${column.id}-${rowData.id}`,
                  content: '',
                  type: column.type,
                };
                return acc;
              }, {} as Record<string, Cell>),
            }],
          },
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error adding row:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add row' 
      });
    }
  },

  updateCell: async (tableId: string, rowId: string, columnId: string, value: string) => {
    try {
      const { error } = await supabase
        .from('database_cells')
        .update({ content: value })
        .eq('row_id', rowId)
        .eq('column_id', columnId);

      if (error) throw error;

      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            rows: state.tables[tableId].rows.map(row =>
              row.id === rowId
                ? {
                    ...row,
                    cells: {
                      ...row.cells,
                      [columnId]: {
                        ...row.cells[columnId],
                        content: value,
                      },
                    },
                  }
                : row
            ),
          },
        },
      }));
    } catch (error) {
      console.error('Error updating cell:', error);
      // Don't set global error state for cell updates to avoid disrupting the UI
    }
  },

  toggleRowSelection: (tableId: string, rowId: string) => {
    set(state => {
      const currentSelected = state.selectedRows[tableId] || [];
      const newSelected = currentSelected.includes(rowId)
        ? currentSelected.filter(id => id !== rowId)
        : [...currentSelected, rowId];

      return {
        selectedRows: {
          ...state.selectedRows,
          [tableId]: newSelected,
        },
      };
    });
  },
}));