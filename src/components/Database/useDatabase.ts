import { create } from 'zustand';
import { DatabaseState, Column } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useDatabase = create<DatabaseState>((set) => ({
  columns: [
    { id: 'name', name: 'Name', type: 'text' },
    { id: 'type', name: 'Type', type: 'text' },
    { id: 'status', name: 'Status', type: 'text' },
  ],
  rows: [
    {
      id: 'row1',
      cells: {
        name: { id: 'cell1', content: 'Project Alpha', type: 'text' },
        type: { id: 'cell2', content: 'Development', type: 'text' },
        status: { id: 'cell3', content: 'In Progress', type: 'text' },
      },
    },
  ],
  selectedRows: [],

  addColumn: () =>
    set((state) => {
      const newColumn = {
        id: generateId(),
        name: 'New Column',
        type: 'text' as const,
      };

      const updatedRows = state.rows.map((row) => ({
        ...row,
        cells: {
          ...row.cells,
          [newColumn.id]: {
            id: generateId(),
            content: '',
            type: 'text',
          },
        },
      }));

      return {
        columns: [...state.columns, newColumn],
        rows: updatedRows,
      };
    }),

  addCustomColumn: (column) =>
    set((state) => {
      const newColumn = {
        id: generateId(),
        name: column.name,
        type: column.type,
      };

      const updatedRows = state.rows.map((row) => ({
        ...row,
        cells: {
          ...row.cells,
          [newColumn.id]: {
            id: generateId(),
            content: '',
            type: column.type,
          },
        },
      }));

      return {
        columns: [...state.columns, newColumn],
        rows: updatedRows,
      };
    }),

  addRow: () =>
    set((state) => {
      const newCells = state.columns.reduce(
        (acc, column) => ({
          ...acc,
          [column.id]: {
            id: generateId(),
            content: '',
            type: column.type,
          },
        }),
        {}
      );

      return {
        rows: [
          ...state.rows,
          {
            id: generateId(),
            cells: newCells,
          },
        ],
      };
    }),

  updateCell: (rowId, columnId, value) =>
    set((state) => ({
      rows: state.rows.map((row) =>
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
    })),

  toggleRowSelection: (rowId) =>
    set((state) => ({
      selectedRows: state.selectedRows.includes(rowId)
        ? state.selectedRows.filter((id) => id !== rowId)
        : [...state.selectedRows, rowId],
    })),
}));