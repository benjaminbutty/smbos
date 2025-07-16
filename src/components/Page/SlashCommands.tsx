import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Minus,
  CheckSquare
} from 'lucide-react';

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ElementType;
  command: () => void;
  keywords?: string[];
}

interface SlashCommandsProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  onKeyDown?: (event: KeyboardEvent) => boolean;
}

export interface SlashCommandsRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export const SlashCommands = forwardRef<SlashCommandsRef, SlashCommandsProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset selection when items change
    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    const onKeyDown = (event: KeyboardEvent): boolean => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    };

    useImperativeHandle(ref, () => ({
      onKeyDown,
    }));

    if (items.length === 0) {
      return null;
    }

    return (
      <div className="z-50 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 max-h-80 overflow-y-auto">
        {items.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
              index === selectedIndex 
                ? 'bg-gray-100 dark:bg-gray-700' 
                : ''
            }`}
            onClick={() => selectItem(index)}
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
              <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {item.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }
);

SlashCommands.displayName = 'SlashCommands';