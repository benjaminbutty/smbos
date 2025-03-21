import React, { useState } from 'react';
import { Search, Bell, ChevronDown, User, Command, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../stores/cartStore';
import { CartDrawer } from '../Cart/CartDrawer';

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
}

export function Header({ title, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const { toggleCart, getTotalItems } = useCartStore();
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.email) return '?';
    
    const parts = user.email.split('@')[0].split(/[._-]/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };
  
  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* Logo and product name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
              <Command size={16} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Workspace</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
          
          {/* Center - Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-md text-sm text-gray-900 dark:text-gray-300 placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          {/* Right - Notifications, Cart and profile */}
          <div className="flex items-center gap-3">
            <button 
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={toggleCart}
            >
              <div className="relative">
                <ShoppingCart size={18} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {getTotalItems()}
                  </span>
                )}
              </div>
            </button>
            
            <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell size={18} />
            </button>
            
            <div className="relative">
              <button
                className="flex items-center gap-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-sm font-medium">
                  {getInitials()}
                </div>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 text-sm border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Breadcrumb navigation */}
        <div className="px-4 h-10 flex items-center border-b border-gray-200 dark:border-gray-800">
          <div className="text-sm flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Workspace</span>
            <span className="text-gray-500 dark:text-gray-400">/</span>
            <span className="font-medium text-gray-900 dark:text-white">{title}</span>
          </div>
        </div>
      </header>
      
      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}