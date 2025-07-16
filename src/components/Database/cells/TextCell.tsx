import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Cell } from '../types';

interface TextCellProps {
  cell: Cell;
  onUpdate: (value: string) => void;
  isSelected: boolean;
  rowHovered: boolean;
  onFocus: () => void;
}

export function TextCell({ cell, onUpdate, isSelected, rowHovered, onFocus }: TextCellProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  // Set up the text editor
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
        placeholder: '',
      }),
    ],
    content: cell.content || '',
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
  
  // Handle cell click
  const handleCellClick = () => {
    setIsFocused(true);
    setTimeout(() => {
      if (editor) {
        editor.commands.focus();
      }
    }, 10);
  };

  return (
    <div
      className={`
        w-full ${getDensityStyles()} h-full px-3 py-1.5 transition-colors relative database-cell-transition
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
      {/* Show editor when focused */}
      <div className={isFocused ? 'block w-full h-full' : 'hidden'}>
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
      
      {/* Show content when not focused */}
      {!isFocused && (
        <div className="w-full h-full cursor-text" onClick={handleCellClick}>
          {cell.content ? (
            <span className="text-gray-900 dark:text-gray-200">{cell.content}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500"></span>
          )}
        </div>
      )}
    </div>
  );
}