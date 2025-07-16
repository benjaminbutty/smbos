import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2 } from 'lucide-react';
import { Block } from '../../types/blocks';
import { BlockRenderer } from './BlockRenderer';

interface SortableBlockItemProps {
  block: Block;
  onChange: (block: Block) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnter: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  onTransformBlock: (newType: 'image' | 'record-link') => void;
  isFocused: boolean;
  onFocus: () => void;
}

export function SortableBlockItem({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onEnter,
  onArrowUp,
  onArrowDown,
  onTransformBlock,
  isFocused,
  onFocus
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative my-1.5 first:mt-0 last:mb-0 ${isDragging ? 'opacity-50' : ''} ${
        isFocused ? 'ring-2 ring-blue-500 ring-inset rounded-lg' : ''
      }`}
    >
      {/* Hover toolbar - positioned absolutely to the left */}
      <div className="absolute left-0 top-0 transform -translate-x-full pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-1">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="w-3 h-3 text-gray-400 dark:text-gray-500" />
          </button>
          
          {/* Duplicate button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            title="Duplicate block"
          >
            <Copy className="w-3 h-3" />
          </button>
          
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
            title="Delete block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Block content */}
      <div className="w-full">
        <BlockRenderer
          block={block}
          onChange={onChange}
          onDelete={onDelete}
          onEnter={onEnter}
          onArrowUp={onArrowUp}
          onArrowDown={onArrowDown}
          onTransformBlock={onTransformBlock}
          isFocused={isFocused}
          onFocus={onFocus}
        />
      </div>
    </div>
  );
}