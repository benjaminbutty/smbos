import React from 'react';
import { Block } from '../../types/blocks';
import { TextBlockView } from './TextBlockView';
import { ImageBlockView } from './ImageBlockView';
import { RecordLinkBlockView } from './RecordLinkBlockView';

interface BlockRendererProps {
  block: Block;
  onChange: (block: Block) => void;
  onDelete: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onTransformBlock?: (newType: 'image' | 'record-link') => void;
  isFocused: boolean;
  onFocus: () => void;
}

export function BlockRenderer({
  block,
  onChange,
  onDelete,
  onEnter,
  onArrowUp,
  onArrowDown,
  onTransformBlock,
  isFocused,
  onFocus
}: BlockRendererProps) {
  switch (block.type) {
    case 'text':
      return (
        <TextBlockView
          block={block}
          onChange={onChange}
          onDelete={onDelete}
          onEnter={onEnter || (() => {})}
          onArrowUp={onArrowUp || (() => {})}
          onArrowDown={onArrowDown || (() => {})}
          onTransformBlock={onTransformBlock || (() => {})}
          isFocused={isFocused}
          onFocus={onFocus}
        />
      );
    
    case 'image':
      return (
        <ImageBlockView
          block={block}
          onChange={onChange}
          onDelete={onDelete}
          isFocused={isFocused}
          onFocus={onFocus}
        />
      );
    
    case 'record-link':
      return (
        <RecordLinkBlockView
          block={block}
          onChange={onChange}
          onDelete={onDelete}
          isFocused={isFocused}
          onFocus={onFocus}
        />
      );
    
    default:
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            Unknown block type: {(block as any).type}
          </p>
        </div>
      );
  }
}