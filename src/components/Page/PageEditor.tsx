import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface PageEditorProps {
  initialContent?: any;
  onContentChange: (content: any) => void;
}

export function PageEditor({ initialContent, onContentChange }: PageEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure heading levels
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Enable all basic formatting
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
          return 'Start writing your page content...';
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none dark:prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-li:text-gray-700 dark:prose-li:text-gray-300',
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      onContentChange(content);
    },
    immediatelyRender: false,
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      const currentContent = editor.getJSON();
      // Only update if content is actually different to avoid cursor jumping
      if (JSON.stringify(currentContent) !== JSON.stringify(initialContent)) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <EditorContent 
        editor={editor} 
        className="w-full h-full min-h-[500px] px-6 py-4 focus-within:outline-none"
      />
    </div>
  );
}