import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { SortableBlockItem } from './SortableBlockItem';
import { Block, createTextBlock, createImageBlock, createRecordLinkBlock } from '../../types/blocks';
import { Plus, RotateCcw, RotateCw } from 'lucide-react';

interface PageBuilderProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

export function PageBuilder({ blocks, onBlocksChange }: PageBuilderProps) {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [history, setHistory] = useState<Block[][]>([blocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag and drop configuration for smooth animations
  const dragOverlay = {
    dropAnimation: null, // Disable drop animation for cleaner experience
  };

  // Save state to history
  const saveToHistory = useCallback((newBlocks: Block[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Update blocks with history tracking
  const updateBlocks = useCallback((newBlocks: Block[]) => {
    saveToHistory(newBlocks);
    onBlocksChange(newBlocks);
  }, [onBlocksChange, saveToHistory]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onBlocksChange(history[newIndex]);
    }
  }, [history, historyIndex, onBlocksChange]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onBlocksChange(history[newIndex]);
    }
  }, [history, historyIndex, onBlocksChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      updateBlocks(newBlocks);
    }
  };

  const handleBlockChange = (blockId: string, updatedBlock: Block) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId ? updatedBlock : block
    );
    onBlocksChange(newBlocks); // Don't save to history for content changes
  };

  const handleBlockDelete = (blockId: string) => {
    if (blocks.length === 1) {
      // Don't delete the last block, just clear it
      const newBlocks = [createTextBlock()];
      updateBlocks(newBlocks);
      setFocusedBlockId(newBlocks[0].id);
      return;
    }

    const blockIndex = blocks.findIndex(block => block.id === blockId);
    const newBlocks = blocks.filter(block => block.id !== blockId);
    updateBlocks(newBlocks);

    // Focus previous block or next block
    if (blockIndex > 0) {
      setFocusedBlockId(newBlocks[blockIndex - 1].id);
    } else if (newBlocks.length > 0) {
      setFocusedBlockId(newBlocks[0].id);
    }
  };

  const handleBlockDuplicate = (blockId: string) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const originalBlock = blocks[blockIndex];
    let duplicatedBlock: Block;

    // Create a duplicate based on block type
    switch (originalBlock.type) {
      case 'text':
        duplicatedBlock = {
          ...createTextBlock(originalBlock.doc),
          id: crypto.randomUUID(), // Ensure unique ID
        };
        break;
      case 'image':
        duplicatedBlock = {
          ...createImageBlock(),
          id: crypto.randomUUID(),
          url: originalBlock.url,
          alt: originalBlock.alt,
          caption: originalBlock.caption,
        };
        break;
      case 'record-link':
        duplicatedBlock = {
          ...createRecordLinkBlock(),
          id: crypto.randomUUID(),
          recordId: originalBlock.recordId,
          recordType: originalBlock.recordType,
          title: originalBlock.title,
        };
        break;
      default:
        return;
    }

    const newBlocks = [
      ...blocks.slice(0, blockIndex + 1),
      duplicatedBlock,
      ...blocks.slice(blockIndex + 1)
    ];
    updateBlocks(newBlocks);
    setFocusedBlockId(duplicatedBlock.id);
  };

  const handleBlockEnter = (blockId: string) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    const newBlock = createTextBlock();
    const newBlocks = [
      ...blocks.slice(0, blockIndex + 1),
      newBlock,
      ...blocks.slice(blockIndex + 1)
    ];
    updateBlocks(newBlocks);
    setFocusedBlockId(newBlock.id);
  };

  const handleBlockArrowUp = (blockId: string) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex > 0) {
      setFocusedBlockId(blocks[blockIndex - 1].id);
    }
  };

  const handleBlockArrowDown = (blockId: string) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex < blocks.length - 1) {
      setFocusedBlockId(blocks[blockIndex + 1].id);
    }
  };

  const handleTransformBlock = (blockId: string, newType: 'image' | 'record-link') => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    let newBlock: Block;
    switch (newType) {
      case 'image':
        newBlock = createImageBlock();
        break;
      case 'record-link':
        newBlock = createRecordLinkBlock();
        break;
      default:
        return;
    }

    const newBlocks = [
      ...blocks.slice(0, blockIndex),
      newBlock,
      ...blocks.slice(blockIndex + 1)
    ];
    updateBlocks(newBlocks);
    setFocusedBlockId(newBlock.id);
  };

  const handleAddBlock = () => {
    const newBlock = createTextBlock();
    const newBlocks = [...blocks, newBlock];
    updateBlocks(newBlocks);
    setFocusedBlockId(newBlock.id);
  };

  return (
    <div className="w-full h-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <RotateCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
            <div>
              {blocks.map((block) => (
                <SortableBlockItem
                  key={block.id}
                  block={block}
                  onChange={(updatedBlock) => handleBlockChange(block.id, updatedBlock)}
                  onDelete={() => handleBlockDelete(block.id)}
                  onDuplicate={() => handleBlockDuplicate(block.id)}
                  onEnter={() => handleBlockEnter(block.id)}
                  onArrowUp={() => handleBlockArrowUp(block.id)}
                  onArrowDown={() => handleBlockArrowDown(block.id)}
                  onTransformBlock={(newType) => handleTransformBlock(block.id, newType)}
                  isFocused={focusedBlockId === block.id}
                  onFocus={() => setFocusedBlockId(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add block button */}
        <div className="mt-4">
          <button
            onClick={handleAddBlock}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add a block</span>
          </button>
        </div>
      </div>
    </div>
  );
}