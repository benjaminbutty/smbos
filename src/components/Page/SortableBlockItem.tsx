import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Block } from '../../types/blocks';
import { BlockRenderer } from './BlockRenderer';

interface SortableBlockItemProps {
  block: Block;
  onChange: (block: Block) => void;
  onDelete: () => void;
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
      className={`group relative my-1.5 first:mt-0 last:mb-0 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 w-6 h-6 mt-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Block content */}
        <div className="flex-1 min-w-0">
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
    </div>
  );
}