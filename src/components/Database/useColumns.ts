// src/components/Database/useColumns.ts
import { useState, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { Column } from './types';

// Import the predefined attributes - moved from ColumnPicker to make it more accessible
export const COLUMN_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  DATE: 'date',
  BOOLEAN: 'boolean'
} as const;

// Definition of a predefined attribute template
export interface AttributeTemplate {
  id: string;
  name: string;
  type: string;
  icon: React.ElementType;
  category: string;
  metadata?: {
    options?: string[];
    format?: string;
    default?: any;
  };
}

// Expanded predefined attributes with more types and metadata
export const PREDEFINED_ATTRIBUTES: AttributeTemplate[] = [
  // Text attributes
  { id: 'name', name: 'Name', type: COLUMN_TYPES.TEXT, icon: null, category: 'common' },
  { id: 'description', name: 'Description', type: COLUMN_TYPES.TEXT, icon: null, category: 'common' },
  { id: 'email', name: 'Email', type: COLUMN_TYPES.TEXT, icon: null, category: 'contact' },
  { id: 'phone', name: 'Phone', type: COLUMN_TYPES.TEXT, icon: null, category: 'contact' },
  
  // Number attributes
  { id: 'price', name: 'Price', type: COLUMN_TYPES.NUMBER, icon: null, category: 'product',
    metadata: { format: 'currency' }
  },
  { id: 'stockLevel', name: 'Stock Level', type: COLUMN_TYPES.NUMBER, icon: null, category: 'product' },
  { id: 'discount', name: 'Discount', type: COLUMN_TYPES.NUMBER, icon: null, category: 'product',
    metadata: { format: 'percent' }
  },
  
  // Select attributes
  { id: 'status', name: 'Status', type: COLUMN_TYPES.SELECT, icon: null, category: 'common',
    metadata: { 
      options: ['New', 'In Progress', 'Completed', 'Canceled'] 
    }
  },
  
  // Date attributes
  { id: 'createdAt', name: 'Created at', type: COLUMN_TYPES.DATE, icon: null, category: 'system' },
  { id: 'updatedAt', name: 'Updated at', type: COLUMN_TYPES.DATE, icon: null, category: 'system' },
  { id: 'dueDate', name: 'Due date', type: COLUMN_TYPES.DATE, icon: null, category: 'common' },
  
  // Boolean attributes
  { id: 'active', name: 'Active', type: COLUMN_TYPES.BOOLEAN, icon: null, category: 'common' },
];

// Group attributes by category for better organization
export const ATTRIBUTE_CATEGORIES = {
  common: 'Common Fields',
  product: 'Product Attributes',
  contact: 'Contact Information',
  system: 'System Fields'
};

export function useColumns(tableId?: string | null) {
  const { 
    tables, 
    activeTableId,
    addColumn: addColumnToTable, 
    updateColumn: updateColumnInTable,
    deleteColumn: deleteColumnFromTable
  } = useDatabase();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current table ID - either from props or from active table
  const currentTableId = tableId || activeTableId;
  const currentTable = currentTableId ? tables[currentTableId] : null;
  const columns = currentTable?.columns || [];
  

  // Add a column from a predefined attribute template
  const addPredefinedColumn = useCallback(async (attribute: AttributeTemplate) => {
    if (!currentTableId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Adding predefined column:', attribute);
      
      // Prepare metadata based on the column type
      let metadata: any = {};
      
      // Add specific metadata for different column types
      if (attribute.type === COLUMN_TYPES.SELECT && attribute.metadata?.options) {
        metadata.options = attribute.metadata.options;
      } else if (attribute.type === COLUMN_TYPES.NUMBER && attribute.metadata?.format) {
        metadata.format = attribute.metadata.format;
      }
      
      // Use the original type directly - no conversion needed
      const columnData = {
        name: attribute.name,
        type: attribute.type, // Use the type directly
        metadata: attribute.metadata || {}
      };
      
      console.log('Column data to add:', columnData);
      
      await addColumnToTable(currentTableId, columnData);
    } catch (err) {
      console.error('Error in addPredefinedColumn:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentTableId, addColumnToTable]);
  
  // Add a custom column with user-defined properties
  const addCustomColumn = useCallback(async (columnData: Omit<Column, 'id'>) => {
    if (!currentTableId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Adding custom column:', columnData);
      
      // No type conversion needed - use the type directly
      await addColumnToTable(currentTableId, columnData);
    } catch (err) {
      console.error('Error in addCustomColumn:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentTableId, addColumnToTable]);
  
  // Update a column's properties
  const updateColumn = useCallback(async (columnId: string, updates: Partial<Omit<Column, 'id'>>) => {
    if (!currentTableId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateColumnInTable(currentTableId, columnId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update column');
    } finally {
      setIsLoading(false);
    }
  }, [currentTableId, updateColumnInTable]);
  
  // Delete a column
  const deleteColumn = useCallback(async (columnId: string) => {
    if (!currentTableId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteColumnFromTable(currentTableId, columnId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete column');
    } finally {
      setIsLoading(false);
    }
  }, [currentTableId, deleteColumnFromTable]);
  
  // Get a predefined attribute by ID
  const getPredefinedAttribute = useCallback((attributeId: string) => {
    return PREDEFINED_ATTRIBUTES.find(attr => attr.id === attributeId) || null;
  }, []);
  
  return {
    columns,
    isLoading,
    error,
    addPredefinedColumn,
    addCustomColumn,
    updateColumn,
    deleteColumn,
    getPredefinedAttribute,
    predefinedAttributes: PREDEFINED_ATTRIBUTES,
    attributeCategories: ATTRIBUTE_CATEGORIES
  };
}