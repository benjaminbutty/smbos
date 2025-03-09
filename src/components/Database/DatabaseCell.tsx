import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Cell } from './types';

interface DatabaseCellProps {
  cell: Cell;
  onUpdate: (value: string) => void;
  isSelected: boolean;
  rowHovered: boolean;
  onFocus: () => void;
}

export function DatabaseCell({
  cell,
  onUpdate,
  isSelected,
  rowHovered,
  onFocus
}: DatabaseCellProps) {
  const [isFocused, setIsFocused] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

  // Set up the text editor for text cells
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        listItem: false,
        bulletList: false,
        orderedList: false
      }),
      Placeholder.configure({
        placeholder: 'Empty cell',
      }),
    ],
    content: cell.content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none dark:prose-invert',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getText());
    },
    onFocus: () => {
      setIsFocused(true);
      onFocus();
    },
    onBlur: () => {
      setIsFocused(false);
    },
  });

  // Update content if it changes from outside
  useEffect(() => {
    if (editor && cell.content !== editor.getText()) {
      editor.commands.setContent(cell.content || '');
    }
  }, [cell.content, editor]);
  
  // Format numeric values
  const formattedValue = useMemo(() => {
    if (cell.type === 'number' && cell.content) {
      // Try to parse as number and format
      const num = parseFloat(cell.content);
      if (!isNaN(num)) {
        // For currency-like values, format with 2 decimal places
        if (cell.content.includes('$') || cell.content.includes('€')) {
          return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 2
          }).format(num);
        }
        // For percentages
        if (cell.content.includes('%')) {
          return `${num.toLocaleString()}%`;
        }
        // For regular numbers
        return num.toLocaleString();
      }
    }
    return cell.content;
  }, [cell.type, cell.content]);

  // Handle cell click - first set focused state, then focus the editor
  const handleCellClick = () => {
    setIsFocused(true);
    // Use setTimeout to ensure editor is mounted before focusing
    setTimeout(() => {
      if (editor) {
        editor.commands.focus();
      }
    }, 10);
  };

  return (
    <div
      ref={cellRef}
      className={`
        min-h-[2.25rem] px-3 py-1.5 transition-colors relative database-cell-transition
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/10' 
          : isFocused 
            ? 'bg-white dark:bg-gray-900 ring-2 ring-blue-500 ring-inset shadow-sm z-10' 
            : rowHovered 
              ? 'bg-gray-50 dark:bg-gray-800/50' 
              : 'bg-white dark:bg-gray-900'
        }
      `}
    >
      {/* Always render the editor, but only show it when focused */}
      <div 
        className={isFocused ? 'block w-full h-full' : 'hidden'}
      >
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
      
      {/* Show content when not focused */}
      {!isFocused && (
        <div
          className={`w-full h-full cursor-text text-white ${cell.type === 'number' ? 'text-right' : ''}`}
          onClick={handleCellClick}
        >
          {cell.type === 'number' ? formattedValue : (
            cell.content || (
              <span className="text-gray-400 dark:text-gray-500">Empty</span>
            )
          )}
        </div>
      )}
    </div>
  );
}