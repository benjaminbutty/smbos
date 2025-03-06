import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronRight, Search, TextIcon, Clock, User, Hash } from 'lucide-react';
import { Column } from './types';

const PREDEFINED_ATTRIBUTES = [
  { id: 'productName', name: 'Product Name', type: 'text', icon: TextIcon },
  { id: 'recordId', name: 'Record ID', type: 'text', icon: Hash },
  { id: 'nextDueTask', name: 'Next due task', type: 'text', icon: Clock },
  { id: 'createdAt', name: 'Created at', type: 'text', icon: Clock },
  { id: 'createdBy', name: 'Created by', type: 'text', icon: User },
  { id: 'price', name: 'Price', type: 'number', icon: TextIcon },
  { id: 'stockLevel', name: 'Stock Level', type: 'number', icon: TextIcon },
];

interface ColumnPickerProps {
  onAddColumn: (column: Omit<Column, 'id'>) => void;
}

export function ColumnPicker({ onAddColumn }: ColumnPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter attributes based on search query
  const filteredAttributes = PREDEFINED_ATTRIBUTES.filter(attr => 
    attr.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleAddAttribute(attribute: typeof PREDEFINED_ATTRIBUTES[0]) {
    onAddColumn({
      name: attribute.name,
      type: attribute.type,
    });
    setIsOpen(false);
    setSearchQuery('');
  }

  function handleCreateCustomAttribute() {
    onAddColumn({
      name: 'New Column',
      type: 'text',
    });
    setIsOpen(false);
    setSearchQuery('');
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm px-3 py-2 rounded hover:bg-gray-800"
      >
        <Plus className="h-4 w-4" />
        <span>Add column</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search attributes..."
                className="w-full bg-gray-700 text-gray-200 pl-8 pr-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="py-1">
              <div className="text-xs text-gray-500 px-2 py-1 uppercase">Product attributes</div>
              
              <div className="max-h-64 overflow-y-auto">
                {filteredAttributes.map((attribute) => (
                  <button
                    key={attribute.id}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-gray-700 text-gray-200 rounded"
                    onClick={() => handleAddAttribute(attribute)}
                  >
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-700 rounded">
                      <attribute.icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <span>{attribute.name}</span>
                  </button>
                ))}
                
                {filteredAttributes.length === 0 && searchQuery && (
                  <div className="px-3 py-2 text-gray-400 text-sm">No matching attributes found</div>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-1">
              <button
                className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-gray-700 text-gray-200 rounded mt-1"
                onClick={handleCreateCustomAttribute}
              >
                <span>Create new attribute</span>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}