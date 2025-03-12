// src/components/Database/ColumnPicker.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronRight, Search } from 'lucide-react';
import { Column } from './types';
import { CustomColumnDialog } from './CustomColumnDialog';
import { useColumns, AttributeTemplate, ATTRIBUTE_CATEGORIES } from './useColumns';

// Import the necessary icons
import { 
  Type, 
  DollarSign, 
  Calendar, 
  ToggleLeft, 
  ListFilter, 
  Hash, 
  User 
} from 'lucide-react';

// Map icon components to names for the predefined attributes
const ICON_MAP: Record<string, React.ElementType> = {
  'Type': Type,
  'DollarSign': DollarSign,
  'Calendar': Calendar,
  'ToggleLeft': ToggleLeft,
  'ListFilter': ListFilter,
  'Hash': Hash,
  'User': User
};

interface ColumnPickerProps {
  tableId?: string;
}

export function ColumnPicker({ tableId }: ColumnPickerProps) {
  const { 
    predefinedAttributes, 
    attributeCategories,
    addPredefinedColumn,
    addCustomColumn,
    isLoading
  } = useColumns(tableId);
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  
  // Add icons to the attributes
  const attributesWithIcons = predefinedAttributes.map(attr => ({
    ...attr,
    icon: attr.id === 'name' ? Type :
          attr.id === 'description' ? Type :
          attr.id === 'email' ? Type :
          attr.id === 'phone' ? Type :
          attr.id === 'price' ? DollarSign : 
          attr.id === 'stockLevel' ? Hash :
          attr.id === 'discount' ? DollarSign :
          attr.id === 'status' ? ListFilter :
          attr.id === 'createdAt' ? Calendar :
          attr.id === 'updatedAt' ? Calendar :
          attr.id === 'dueDate' ? Calendar :
          attr.id === 'active' ? ToggleLeft :
          Type
  }));
  
  // Filter attributes based on search query and selected category
  const filteredAttributes = attributesWithIcons.filter(attr => {
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
  }, {} as Record<string, typeof attributesWithIcons>);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  function handleAddAttribute(attribute: AttributeTemplate) {
    addPredefinedColumn(attribute);
    setIsOpen(false);
    setSearchQuery('');
  }
  
  function handleCreateCustomAttribute() {
    setShowCustomDialog(true);
    setIsOpen(false);
  }
  
  function handleCustomColumnCreate(column: { name: string; type: string }) {
    addCustomColumn({
      name: column.name,
      type: column.type as 'text' | 'number',
    });
    setSearchQuery('');
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm px-3 py-2 rounded hover:bg-gray-800 h-full"
        type="button"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin h-4 w-4 border-t-2 border-blue-500 rounded-full"></div>
        ) : (
          <Plus className="h-4 w-4" />
        )}
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
                type="button"
              >
                All
              </button>
              {Object.entries(attributeCategories).map(([category, label]) => (
                <button
                  key={category}
                  className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${
                    selectedCategory === category 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
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
                    {attributeCategories[category as keyof typeof attributeCategories] || category}
                  </div>
                  
                  {attributes.map((attribute) => (
                    <button
                      key={attribute.id}
                      className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-gray-700 text-gray-200 rounded"
                      onClick={() => handleAddAttribute(attribute)}
                      type="button"
                    >
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-700 rounded">
                        {attribute.icon && <attribute.icon className="h-4 w-4 text-gray-400" />}
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
                type="button"
              >
                <span>Create custom attribute</span>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Column Dialog - Render at root level for proper z-index */}
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