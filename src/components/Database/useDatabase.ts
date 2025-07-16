import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import { Column, Row, Cell, Table } from './types';
import { Block, createTextBlock } from '../../types/blocks';

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
  addColumn: (tableId: string, columnData?: Partial<Omit<Column, 'id'>>) => Promise<void>;
  updateColumn: (tableId: string, columnId: string, updates: Partial<Omit<Column, 'id'>>) => Promise<void>;
  deleteColumn: (tableId: string, columnId: string) => Promise<void>;
  
  // Row operations  
  addRow: (tableId: string) => Promise<void>;
  deleteRow: (tableId: string, rowId: string) => Promise<void>;
  deleteMultipleRows: (tableId: string, rowIds: string[]) => Promise<void>;
  updateCell: (tableId: string, rowId: string, columnId: string, value: string) => Promise<void>;
  toggleRowSelection: (tableId: string, rowId: string) => void;
}

export const useDatabase = create<DatabaseState>((set, get) => ({
  tables: {},
  activeTableId: null,
  pages: {},
  activePageId: null,
  selectedRows: {},
  isLoading: false,
  error: null,
  
  fetchUserTables: async () => {
    set({ isLoading: true, error: null });
    try {
      // First check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('Authentication error: ' + authError.message);
      if (!user) throw new Error('No authenticated user found');

      // Fetch pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (pagesError) throw pagesError;
      if (!pagesData) throw new Error('No pages data received');

      // Fetch tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('database_tables')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (tablesError) throw tablesError;
      if (!tablesData) throw new Error('No tables data received');
      
      const tables: Record<string, Table> = {};
      const pages: Record<string, Page> = {};
      const currentState = get();
      let activeTableId = currentState.activeTableId;
      let activePageId = currentState.activePageId;
      
      // Process pages
      if (pagesData.length > 0) {
        for (const pageData of pagesData) {
          // Parse blocks from content, ensuring we have at least one text block
          let blocks: Block[] = [];
          try {
            if (pageData.content && Array.isArray(pageData.content)) {
              blocks = pageData.content;
            } else if (pageData.content && typeof pageData.content === 'object') {
              // Legacy content - convert to single text block
              blocks = [createTextBlock(pageData.content)];
            }
          } catch (error) {
            console.warn('Failed to parse page blocks:', error);
          }
          
          // Ensure we always have at least one text block
          if (blocks.length === 0) {
            blocks = [createTextBlock()];
          }
          
          pages[pageData.id] = {
            id: pageData.id,
            name: pageData.name,
            user_id: pageData.user_id,
            created_at: pageData.created_at,
            updated_at: pageData.updated_at,
            blocks: blocks
          };
        }
      }
      
      // If we have tables, process them
      if (tablesData.length > 0) {
        for (const tableData of tablesData) {
          // Fetch columns for this table
          const { data: columnsData, error: columnsError } = await supabase
            .from('database_columns')
            .select('*')
            .eq('table_id', tableData.id)
            .order('order', { ascending: true });
            
          if (columnsError) throw new Error(`Error fetching columns: ${columnsError.message}`);
          if (!columnsData) throw new Error('No columns data received');
          
          // Fetch rows for this table
          const { data: rowsData, error: rowsError } = await supabase
            .from('database_rows')
            .select('*')
            .eq('table_id', tableData.id)
            .order('created_at', { ascending: true });
            
          if (rowsError) throw new Error(`Error fetching rows: ${rowsError.message}`);
          if (!rowsData) throw new Error('No rows data received');
          
          // If we have rows, fetch their cells
          let cellsData = [];
          if (rowsData.length > 0) {
            const rowIds = rowsData.map(row => row.id);
            const { data: cells, error: cellsError } = await supabase
              .from('database_cells')
              .select('*')
              .in('row_id', rowIds);
              
            if (cellsError) throw new Error(`Error fetching cells: ${cellsError.message}`);
            if (!cells) throw new Error('No cells data received');
            
            cellsData = cells;
          }
          
          // Process columns with proper error handling for metadata
          const columns = columnsData.map(col => {
            let metadata = {};
            if (col.metadata) {
              try {
                metadata = typeof col.metadata === 'string' 
                  ? JSON.parse(col.metadata) 
                  : col.metadata;
              } catch (err) {
                console.warn(`Failed to parse metadata for column ${col.id}:`, err);
              }
            }
            
            return {
              id: col.id,
              name: col.name,
              type: col.type as 'text' | 'number',
              metadata
            };
          });
          
          // Process rows and their cells
          const rows = rowsData.map(row => {
            const rowCells = cellsData.filter(cell => cell.row_id === row.id);
            const cells: Record<string, Cell> = {};
            
            rowCells.forEach(cell => {
              const column = columnsData.find(col => col.id === cell.column_id);
              if (column) {
                cells[cell.column_id] = {
                  id: cell.id,
                  content: cell.content || '',
                  type: column.type as 'text' | 'number',
                };
              }
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
      }
      
      // Determine active item with proper priority logic
      // 1. Try to maintain current active table if it still exists
      if (activeTableId && !tables[activeTableId]) {
        activeTableId = null;
      }
      
      // 2. Try to maintain current active page if it still exists
      if (activePageId && !pages[activePageId]) {
        activePageId = null;
      }
      
      // 3. If no active item, set defaults
      if (!activeTableId && !activePageId) {
        // First try to activate the first table
        const firstTableId = Object.keys(tables)[0];
        if (firstTableId) {
          activeTableId = firstTableId;
        } else {
          // If no tables, try to activate the first page
          const firstPageId = Object.keys(pages)[0];
          if (firstPageId) {
            activePageId = firstPageId;
          }
        }
      }
      
      set({ 
        tables, 
        pages,
        activeTableId, 
        activePageId,
        isLoading: false,
        error: null,
        selectedRows: Object.keys(tables).reduce((acc, tableId) => {
          acc[tableId] = [];
          return acc;
        }, {} as Record<string, string[]>),
      });
      
    } catch (error) {
      console.error('Error fetching tables:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load tables',
        tables: {},
        activeTableId: null,
        selectedRows: {}
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
          metadata: {}
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
      set({ activeTableId: tableId, activePageId: null });
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

  createPage: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }
  
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .insert({ 
          name, 
          user_id: userId,
          content: [createTextBlock()]
        })
        .select()
        .single();
        
      if (pageError) throw pageError;
      
      const newPage: Page = {
        id: pageData.id,
        name: pageData.name,
        user_id: pageData.user_id,
        created_at: pageData.created_at,
        updated_at: pageData.updated_at,
        blocks: [createTextBlock()]
      };
      
      set(state => ({
        pages: {
          ...state.pages,
          [pageData.id]: newPage,
        },
        activePageId: pageData.id,
        activeTableId: null,
        isLoading: false,
      }));
      
      return pageData.id;
      
    } catch (error) {
      console.error('Error creating page:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to create page' 
      });
      return '';
    }
  },

  setActivePage: (pageId: string) => {
    if (get().pages[pageId]) {
      set({ activePageId: pageId, activeTableId: null });
    }
  },

  renamePage: async (pageId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('pages')
        .update({ name })
        .eq('id', pageId);

      if (error) throw error;

      set(state => ({
        pages: {
          ...state.pages,
          [pageId]: {
            ...state.pages[pageId],
            name,
          },
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error renaming page:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to rename page' 
      });
    }
  },

  deletePage: async (pageId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      set(state => {
        const { [pageId]: _, ...remainingPages } = state.pages;
        return {
          pages: remainingPages,
          activePageId: state.activePageId === pageId 
            ? (Object.keys(remainingPages)[0] || null) 
            : state.activePageId,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Error deleting page:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete page' 
      });
    }
  },

  addColumn: async (tableId: string, columnData?: Partial<Omit<Column, 'id'>>) => {
    set({ isLoading: true, error: null });
    try {
      const table = get().tables[tableId];
      if (!table) {
        throw new Error('Table not found');
      }

      // Prepare the column data
      const newColumn = {
        table_id: tableId,
        name: columnData?.name || 'New Column',
        type: columnData?.type || 'text',
        order: table.columns.length,
        metadata: columnData?.metadata ? JSON.stringify(columnData.metadata) : '{}'
      };

      // Insert the column in the database
      const { data: columnResponse, error: columnError } = await supabase
        .from('database_columns')
        .insert(newColumn)
        .select()
        .single();

      if (columnError) {
        throw new Error(`Failed to create column: ${columnError.message}`);
      }

      if (!columnResponse) {
        throw new Error('No response received when creating column');
      }

      // Create cells for the new column
      const cellInserts = table.rows.map(row => ({
        row_id: row.id,
        column_id: columnResponse.id,
        content: '',
      }));

      if (cellInserts.length > 0) {
        const { error: cellsError } = await supabase
          .from('database_cells')
          .insert(cellInserts);

        if (cellsError) {
          throw new Error(`Failed to create cells: ${cellsError.message}`);
        }
      }

      // Parse metadata
      let metadata = {};
      try {
        if (columnResponse.metadata) {
          metadata = typeof columnResponse.metadata === 'string' 
            ? JSON.parse(columnResponse.metadata) 
            : columnResponse.metadata;
        }
      } catch (err) {
        console.warn('Failed to parse column metadata:', err);
      }

      // Update local state
      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            columns: [...table.columns, {
              id: columnResponse.id,
              name: columnResponse.name,
              type: columnResponse.type,
              metadata
            }],
            rows: table.rows.map(row => ({
              ...row,
              cells: {
                ...row.cells,
                [columnResponse.id]: {
                  id: `temp-${columnResponse.id}-${row.id}`,
                  content: '',
                  type: columnResponse.type,
                  metadata
                },
              },
            })),
          },
        },
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error adding column:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error; // Re-throw the error to be handled by the caller
    }
  },
  
  updateColumn: async (tableId: string, columnId: string, updates: Partial<Omit<Column, 'id'>>) => {
    set({ isLoading: true, error: null });
    try {
      const table = get().tables[tableId];
      if (!table) throw new Error('Table not found');
      
      const column = table.columns.find(col => col.id === columnId);
      if (!column) throw new Error('Column not found');
      
      // Prepare updates, including metadata if present
      const updateData: any = {
        name: updates.name !== undefined ? updates.name : column.name,
        type: updates.type !== undefined ? updates.type : column.type,
      };
      
      // If metadata is provided, stringify it for storage
      if (updates.metadata) {
        updateData.metadata = JSON.stringify(updates.metadata);
      }
      
      const { error } = await supabase
        .from('database_columns')
        .update(updateData)
        .eq('id', columnId);

      if (error) throw error;
      
      // Calculate new metadata by merging existing with updates
      const newMetadata = updates.metadata 
        ? { ...(column.metadata || {}), ...updates.metadata }
        : column.metadata;

      // Update local state
      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            columns: table.columns.map(col => 
              col.id === columnId 
                ? { ...col, ...updates, metadata: newMetadata }
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
                      metadata: newMetadata
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

  deleteRow: async (tableId: string, rowId: string) => {
    set({ isLoading: true, error: null });
    try {
      const table = get().tables[tableId];
      if (!table) throw new Error('Table not found');
      
      // Delete from database - cascade should handle related cells
      const { error } = await supabase
        .from('database_rows')
        .delete()
        .eq('id', rowId);

      if (error) throw error;

      // Update local state
      set(state => {
        // Remove the deleted row
        const updatedRows = table.rows.filter(row => row.id !== rowId);
        
        // Remove the row from selected rows
        const updatedSelectedRows = { 
          ...state.selectedRows,
          [tableId]: (state.selectedRows[tableId] || []).filter(id => id !== rowId)
        };
        
        return {
          tables: {
            ...state.tables,
            [tableId]: {
              ...table,
              rows: updatedRows,
            }
          },
          selectedRows: updatedSelectedRows,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Error deleting row:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete row' 
      });
    }
  },

  deleteMultipleRows: async (tableId: string, rowIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const table = get().tables[tableId];
      if (!table) throw new Error('Table not found');
      
      if (rowIds.length === 0) return;
      
      // Delete all rows in a single operation
      const { error } = await supabase
        .from('database_rows')
        .delete()
        .eq('table_id', tableId)
        .in('id', rowIds);
        
      if (error) throw error;
      
      // Update local state
      set(state => {
        // Filter out all deleted rows
        const updatedRows = table.rows.filter(row => !rowIds.includes(row.id));
        
        // Clear selection for this table
        return {
          tables: {
            ...state.tables,
            [tableId]: {
              ...table,
              rows: updatedRows,
            }
          },
          selectedRows: {
            ...state.selectedRows,
            [tableId]: []
          },
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Error deleting multiple rows:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete rows' 
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

  updatePageBlocks: async (pageId: string, blocks: Block[]) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ 
          content: blocks,
          updated_at: new Date().toISOString()
        })
        .eq('id', pageId);

      if (error) throw error;

      // Update local state
      set(state => ({
        pages: {
          ...state.pages,
          [pageId]: {
            ...state.pages[pageId],
            blocks: blocks,
            updated_at: new Date().toISOString()
          },
        },
      }));
    } catch (error) {
      console.error('Error updating page blocks:', error);
      // Don't set global error state for content updates to avoid disrupting the editing experience
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