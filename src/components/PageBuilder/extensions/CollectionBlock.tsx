import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import { Grid, Settings, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useDatabase } from '../../Database/useDatabase';

// Define the Product interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  inventory: number;
}

// CollectionBlock Component (shown in editor)
const CollectionBlockComponent = (props: any) => {
  const { tables } = useDatabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(!props.node.attrs.tableId);
  const [selectedTableId, setSelectedTableId] = useState(props.node.attrs.tableId || '');
  const [limit, setLimit] = useState(props.node.attrs.limit || 4);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get tables that could be used as product collections
  const availableTables = Object.values(tables).filter(table => 
    table.columns.some(col => col.name.toLowerCase().includes('product') ||
                            col.name.toLowerCase().includes('name'))
  );

  useEffect(() => {
    if (props.node.attrs.tableId) {
      fetchProductsFromTable(props.node.attrs.tableId, props.node.attrs.limit);
    }
  }, [props.node.attrs.tableId, props.node.attrs.limit]);

  async function fetchProductsFromTable(tableId: string, maxItems: number = 4) {
    setIsLoading(true);
    try {
      // For this example, we'll use a products table
      // In a real application, you could use the database_tables to query specific user tables
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(maxItems);

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching collection products:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSaveSettings() {
    props.updateAttributes({
      tableId: selectedTableId,
      limit: Number(limit),
    });
    setIsEditing(false);
  }

  // If editing mode is active, show table selector
  if (isEditing) {
    return (
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 relative" contentEditable={false}>
        <div className="absolute top-2 right-2">
          <button 
            onClick={() => props.deleteNode()}
            className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        <div className="flex items-center mb-4">
          <Grid className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium">Product Collection</h3>
        </div>
        
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Data Source
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white dark:bg-gray-700"
            >
              <option value="">Select a table</option>
              {availableTables.map(table => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </select>
            {availableTables.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                No suitable tables found. Create a table with product data first.
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of products to show
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 4)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white dark:bg-gray-700"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={!selectedTableId}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // Display the product collection
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative" contentEditable={false}>
      {!props.editor.isEditable ? null : (
        <div className="absolute top-2 right-2 flex">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Settings size={16} />
          </button>
          <button 
            onClick={() => props.deleteNode()}
            className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
          Product Collection
        </h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div 
              key={product.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {product.image && (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-3">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {product.name}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold">${product.price.toFixed(2)}</span>
                  <button className="p-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Grid className="h-10 w-10 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {selectedTableId 
              ? 'No products found. Add products to your collection or choose a different table.'
              : 'No table selected. Click the settings icon to choose a data source.'}
          </p>
        </div>
      )}
    </div>
  );
};

// Export the TipTap Node Extension
export const CollectionBlock = Node.create({
  name: 'collectionBlock',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      tableId: {
        default: null,
      },
      filter: {
        default: {},
      },
      limit: {
        default: 4,
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="collection-block"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'collection-block', ...HTMLAttributes }, 0];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(CollectionBlockComponent);
  },
});