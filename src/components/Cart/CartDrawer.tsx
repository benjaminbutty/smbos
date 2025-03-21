import React from 'react';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeItem, 
    updateQuantity, 
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCartStore();
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={toggleCart}
      />
      
      {/* Cart drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex outline-none">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
            {/* Header */}
            <div className="px-4 py-6 sm:px-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Your Cart ({getTotalItems()})
                </h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={toggleCart}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Cart content */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                  {items.map((item) => (
                    <li key={item.productId} className="py-4 flex">
                      {/* Product image */}
                      {item.image ? (
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-16 h-16 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      
                      {/* Product info */}
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {formatPrice(item.price)} each
                        </p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          {/* Quantity controls */}
                          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded">
                            <button
                              type="button"
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="mx-2 text-sm text-gray-700 dark:text-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Remove button */}
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Your cart is empty
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add items to your cart to see them here
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                  <p>Subtotal</p>
                  <p>{formatPrice(getTotalPrice())}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    className="w-full px-6 py-3 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Checkout
                  </button>
                  <button
                    type="button"
                    className="w-full px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}