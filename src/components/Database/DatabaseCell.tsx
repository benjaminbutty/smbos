import React, { useState, useEffect, useRef } from 'react';
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
  const [showMenu, setShowMenu] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

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
        class: 'prose prose-sm max-w-none focus:outline-none',
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
      setShowMenu(false);
    },
  });

  // Update content if it changes from outside
  useEffect(() => {
    if (editor && cell.content !== editor.getText()) {
      editor.commands.setContent(cell.content || '');
    }
  }, [cell.content, editor]);

  // Format cell content for display (could add special formatting here)
  const displayValue = cell.content;
  
  // Determine cell type and render accordingly
  // For now we just have text, but we could add other types
  const renderCellContent = () => {
    // Text content
    return (
      <EditorContent 
        editor={editor} 
        className={`w-full h-full ${isFocused ? 'z-10' : ''}`}
        onClick={() => {
          if (!isFocused) {
            editor?.commands.focus();
          }
        }}
      />
    );
  };

  return (
    <div
      ref={cellRef}
      className={`
        min-h-[2.25rem] px-3 py-1.5 transition-colors relative
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
      {renderCellContent()}
      
      {/* Cell type menu - shown when focused */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 shadow-md rounded-md border border-gray-200 dark:border-gray-700 z-20">
          {/* Menu options would go here */}
        </div>
      )}
    </div>
  );
}