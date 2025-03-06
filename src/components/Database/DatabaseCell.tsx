import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Cell } from './types';

interface DatabaseCellProps {
  cell: Cell;
  onUpdate: (value: string) => void;
  isSelected: boolean;
  onFocus: () => void;
}

export function DatabaseCell({ cell, onUpdate, isSelected, onFocus }: DatabaseCellProps) {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Type something...',
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
  });

  useEffect(() => {
    if (editor && cell.content !== editor.getText()) {
      editor.commands.setContent(cell.content);
    }
  }, [cell.content, editor]);

  const handleClick = useCallback(() => {
    onFocus();
    setIsFocused(true);
  }, [onFocus]);

  return (
    <div
      className={`min-h-[2rem] px-2 py-1 transition-colors ${
        isSelected
          ? 'bg-gray-700/50'
          : isFocused
          ? 'bg-gray-800'
          : 'hover:bg-gray-800/50'
      }`}
      onClick={handleClick}
    >
      <EditorContent editor={editor} />
    </div>
  );
}