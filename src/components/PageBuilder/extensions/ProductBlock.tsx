import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Settings, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useCartStore } from '../../../stores/cartStore';

// Define the Product interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  inventory: number;
}

// Product Block Component (shown in editor)
const ProductBlockComponent = (props: any) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(!props.node.attrs.productId);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCartStore();
  
  useEffect(() => {
    if (props.node.attrs.productId) {
      fetchProduct(props.node.attrs.productId);
    }
  }, [props.node.attrs.productId]);

  async function fetchProduct(productId: string) {
    setIsLoading(true);
    try {
      // Assuming you have a products table in Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      if (data) {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function searchProducts(query: string) {
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function selectProduct(selectedProduct: Product) {
    props.updateAttributes({
      productId: selectedProduct.id,
    });
    
    setProduct(selectedProduct);
    setIsEditing(false);
    setSearchResults([]);
    setProductSearch('');
  }

  function handleAddToCart() {
    if (product) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      });
    }
  }

  // If editing mode is active, show product selector
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
          <ShoppingBag className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium">Product Block</h3>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search for a product
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                searchProducts(e.target.value);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white dark:bg-gray-700"
              placeholder="Type to search..."
            />
          </div>
        </div>
        
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {searchResults.length > 0 ? (
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Select a product:</p>
            {searchResults.map(result => (
              <div
                key={result.id}
                className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => selectProduct(result)}
              >
                {result.image && (
                  <img 
                    src={result.image} 
                    alt={result.name} 
                    className="w-10 h-10 object-cover rounded mr-3"
                  />
                )}
                <div>
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${result.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : productSearch && !isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No products found. Try a different search term.</p>
        ) : null}
        
        <button
          onClick={() => setIsEditing(false)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Display the selected product
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
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : product ? (
        <div className="flex flex-col md:flex-row gap-6">
          {product.image && (
            <div className="w-full md:w-1/3">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {product.name}
            </h3>
            
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ${product.price.toFixed(2)}
            </p>
            
            <div className="prose dark:prose-invert mb-6">
              <p>{product.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 flex items-center gap-2"
              >
                <Plus size={16} />
                Add to Cart
              </button>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {product.inventory > 0 
                  ? `${product.inventory} in stock` 
                  : 'Out of stock'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <ShoppingBag className="h-10 w-10 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No product selected. Click the settings icon to choose a product.
          </p>
        </div>
      )}
    </div>
  );
};

// Export the TipTap Node Extension
export const ProductBlock = Node.create({
  name: 'productBlock',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      productId: {
        default: null,
      },
      displayOptions: {
        default: {
          showPrice: true,
          showDescription: true,
          showAddToCart: true,
        },
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="product-block"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'product-block', ...HTMLAttributes }, 0];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ProductBlockComponent);
  },
});