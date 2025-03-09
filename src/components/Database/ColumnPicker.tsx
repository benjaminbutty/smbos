import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronRight, Search, Type, Clock, User, Hash, Calendar, ToggleLeft, ListFilter, Percent, DollarSign } from 'lucide-react';
import { Column } from './types';
import { CustomColumnDialog } from './CustomColumnDialog';

// Expanded predefined attributes with more types and metadata
const PREDEFINED_ATTRIBUTES = [
  // Text attributes
  { id: 'name', name: 'Name', type: 'text', icon: Type, category: 'common' },
  { id: 'description', name: 'Description', type: 'text', icon: Type, category: 'common' },
  { id: 'email', name: 'Email', type: 'text', icon: Type, category: 'contact' },
  { id: 'phone', name: 'Phone', type: 'text', icon: Type, category: 'contact' },
  
  // ID attributes
  { id: 'recordId', name: 'Record ID', type: 'text', icon: Hash, category: 'system' },
  
  // Time attributes
  { id: 'createdAt', name: 'Created at', type: 'date', icon: Calendar, category: 'system' },
  { id: 'updatedAt', name: 'Updated at', type: 'date', icon: Calendar, category: 'system' },
  { id: 'dueDate', name: 'Due date', type: 'date', icon: Calendar, category: 'common' },
  
  // User attributes
  { id: 'createdBy', name: 'Created by', type: 'user', icon: User, category: 'system' },
  { id: 'assignedTo', name: 'Assigned to', type: 'user', icon: User, category: 'common' },
  
  // Product attributes
  { id: 'price', name: 'Price', type: 'number', icon: DollarSign, category: 'product' },
  { id: 'stockLevel', name: 'Stock Level', type: 'number', icon: Hash, category: 'product' },
  { id: 'sku', name: 'SKU', type: 'text', icon: Hash, category: 'product' },
  { id: 'discount', name: 'Discount', type: 'number', icon: Percent, category: 'product' },
  
  // Status attributes
  { id: 'status', name: 'Status', type: 'select', icon: ListFilter, category: 'common' },
  { id: 'active', name: 'Active', type: 'boolean', icon: ToggleLeft, category: 'common' },
];

// Group attributes by category for better organization
const ATTRIBUTE_CATEGORIES = {
  common: 'Common Fields',
  product: 'Product Attributes',
  contact: 'Contact Information',
  system: 'System Fields'
};

interface ColumnPickerProps {
  onAddColumn: (column: Omit<Column, 'id'>) => void;
}

export function ColumnPicker({ onAddColumn }: ColumnPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter attributes based on search query and selected category
  const filteredAttributes = PREDEFINED_ATTRIBUTES.filter(attr => {
    const matchesSearch = attr.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? attr.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Group attributes by category
  const attributesByCategory = filteredAttributes.reduce((acc, attr) => {
    if (!acc[attr.category]) {
      acc[attr.category] = [];
    }
    acc[attr.category].push(attr);
    return acc;
  }, {} as Record<string, typeof PREDEFINED_ATTRIBUTES>);
  
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
      // Handle the 'text' and 'number' types from Column interface
      type: attribute.type === 'text' || attribute.type === 'number' 
        ? attribute.type 
        : 'text', // Default to text for other types for now
    });
    setIsOpen(false);
    setSearchQuery('');
  }

  const [showCustomDialog, setShowCustomDialog] = useState(false);
  
  function handleCreateCustomAttribute() {
    setShowCustomDialog(true);
    setIsOpen(false);
  }
  
  function handleCustomColumnCreate(column: { name: string; type: string }) {
    onAddColumn({
      name: column.name,
      type: column.type as 'text' | 'number',
    });
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
            
            {/* Category tabs */}
            <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
              <button
                className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${
                  selectedCategory === null 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
              {Object.entries(ATTRIBUTE_CATEGORIES).map(([category, label]) => (
                <button
                  key={category}
                  className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${
                    selectedCategory === category 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Attribute list grouped by category */}
            <div className="max-h-64 overflow-y-auto">
              {Object.entries(attributesByCategory).map(([category, attributes]) => (
                <div key={category} className="mb-2">
                  <div className="text-xs text-gray-500 px-2 py-1 uppercase">
                    {ATTRIBUTE_CATEGORIES[category as keyof typeof ATTRIBUTE_CATEGORIES] || category}
                  </div>
                  
                  {attributes.map((attribute) => (
                    <button
                      key={attribute.id}
                      className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-gray-700 text-gray-200 rounded"
                      onClick={() => handleAddAttribute(attribute)}
                    >
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-700 rounded">
                        <attribute.icon className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <div>{attribute.name}</div>
                        <div className="text-xs text-gray-400">{attribute.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
              
              {filteredAttributes.length === 0 && (
                <div className="px-3 py-2 text-gray-400 text-sm">
                  {searchQuery ? 'No matching attributes found' : 'No attributes in this category'}
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-700 mt-1">
              <button
                className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-gray-700 text-gray-200 rounded mt-1"
                onClick={handleCreateCustomAttribute}
              >
                <span>Create custom attribute</span>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Column Dialog */}
      {showCustomDialog && (
        <CustomColumnDialog 
          isOpen={showCustomDialog}
          onClose={() => setShowCustomDialog(false)}
          onCreateColumn={handleCustomColumnCreate}
        />
      )}
    </div>
  );
}