import React, { useRef, useEffect } from 'react';
import { Type, Image, ShoppingBag, Grid, CreditCard, X } from 'lucide-react';

interface BlockSelectorProps {
  onSelect: (blockType: string) => void;
  onClose: () => void;
}

interface BlockOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export function BlockSelector({ onSelect, onClose }: BlockSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const blocks: BlockOption[] = [
    {
      id: 'paragraph',
      name: 'Text',
      description: 'Simple text block with formatting options',
      icon: <Type className="h-5 w-5" />
    },
    {
      id: 'image',
      name: 'Image',
      description: 'Upload or embed an image',
      icon: <Image className="h-5 w-5" />
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Display a single product with details',
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      id: 'collection',
      name: 'Collection',
      description: 'Display a collection of products',
      icon: <Grid className="h-5 w-5" />
    },
    {
      id: 'checkout',
      name: 'Checkout Form',
      description: 'Add a checkout form for customers',
      icon: <CreditCard className="h-5 w-5" />
    }
  ];
  
  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={ref}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add a block</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {blocks.map(block => (
              <div
                key={block.id}
                className="flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onSelect(block.id)}
              >
                <div className="mr-3 p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {block.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{block.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{block.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}