import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Add item to cart
  addItem: (item: CartItem) => void;
  
  // Remove item from cart
  removeItem: (productId: string) => void;
  
  // Update item quantity
  updateQuantity: (productId: string, quantity: number) => void;
  
  // Clear cart
  clearCart: () => void;
  
  // Toggle cart visibility
  toggleCart: () => void;
  
  // Calculate total
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item: CartItem) => {
        set(state => {
          // Check if item already exists
          const existingItem = state.items.find(i => i.productId === item.productId);
          
          if (existingItem) {
            // Update quantity of existing item
            return {
              items: state.items.map(i => 
                i.productId === item.productId 
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
              isOpen: true // Open cart when adding items
            };
          } else {
            // Add new item
            return {
              items: [...state.items, item],
              isOpen: true // Open cart when adding items
            };
          }
        });
      },
      
      removeItem: (productId: string) => {
        set(state => ({
          items: state.items.filter(item => item.productId !== productId)
        }));
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        set(state => ({
          items: state.items.map(item => 
            item.productId === productId 
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage', // Name for localStorage
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
    }
  )
);