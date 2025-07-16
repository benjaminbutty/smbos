import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { SlashCommandExtension } from '../../lib/tiptap-extensions/slash-commands';
import { TextBlock } from '../../types/blocks';

interface TextBlockViewProps {
  block: TextBlock;
  onChange: (block: TextBlock) => void;
  onDelete: () => void;
  onEnter: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  onTransformBlock: (newType: 'image' | 'record-link') => void;
  isFocused: boolean;
  onFocus: () => void;
}

export function TextBlockView({
  block,
  onChange,
  onDelete,
  onEnter,
  onArrowUp,
  onArrowDown,
  onTransformBlock,
  isFocused,
  onFocus
}: TextBlockViewProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      SlashCommandExtension.configure({
        onTransformBlock: onTransformBlock
      }),
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bold: true,
        italic: true,
        strike: true,
        code: true,
        codeBlock: true,
        blockquote: true,
        horizontalRule: true,
        bulletList: true,
        orderedList: true,
        listItem: true,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Heading ${node.attrs.level}`;
          }
          return 'Type \'/\' for commands...';
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content: block.doc,
    editorProps: {
      attributes: {
        class: 'prose prose-block prose-lg max-w-none focus:outline-none dark:prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-li:text-gray-700 dark:prose-li:text-gray-300',
      },
      handleKeyDown: (view, event) => {
        const { state } = view;
        const { selection } = state;
        
        // Handle Enter at end of block
        if (event.key === 'Enter' && !event.shiftKey) {
          const { $from } = selection;
          const isAtEnd = $from.pos === state.doc.content.size - 1;
          
          if (isAtEnd && $from.parent.textContent === '') {
            event.preventDefault();
            onEnter();
            return true;
          }
        }
        
        // Handle Backspace on empty block
        if (event.key === 'Backspace') {
          const isEmpty = state.doc.textContent === '';
          const isAtStart = selection.from === 1;
          
          if (isEmpty || isAtStart) {
            event.preventDefault();
            onDelete();
            return true;
          }
        }
        
        // Handle Arrow Up at start of block
        if (event.key === 'ArrowUp') {
          const { $from } = selection;
          const isAtStart = $from.pos === 1;
          
          if (isAtStart) {
            event.preventDefault();
            onArrowUp();
            return true;
          }
        }
        
        // Handle Arrow Down at end of block
        if (event.key === 'ArrowDown') {
          const { $from } = selection;
          const isAtEnd = $from.pos === state.doc.content.size - 1;
          
          if (isAtEnd) {
            event.preventDefault();
            onArrowDown();
            return true;
          }
        }
        
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const doc = editor.getJSON();
      onChange({
        ...block,
        doc
      });
    },
    onFocus: () => {
      onFocus();
    },
    immediatelyRender: false,
  });

  // Focus editor when block becomes focused
  useEffect(() => {
    if (isFocused && editor && !editor.isFocused) {
      setTimeout(() => {
        editor.commands.focus();
      }, 0);
    }
  }, [isFocused, editor]);

  // Update editor content when block changes
  useEffect(() => {
    if (editor && block.doc) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(block.doc)) {
        editor.commands.setContent(block.doc);
      }
    }
  }, [editor, block.doc]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-16">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div 
      ref={editorRef}
      className="w-full min-h-[1.5rem] focus-within:outline-none"
      onClick={() => !isFocused && onFocus()}
    >
      <EditorContent 
        editor={editor} 
        className="w-full focus-within:outline-none [&_.ProseMirror]:min-h-[1.5rem]"
      />
    </div>
  );
}