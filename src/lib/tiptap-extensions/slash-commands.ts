import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { SlashCommands, SlashCommandItem, SlashCommandsRef } from '../../components/Page/SlashCommands';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Minus,
  CheckSquare,
  Image,
  Database
} from 'lucide-react';

const getSuggestionItems = ({ query, onTransformBlock }: { query: string; onTransformBlock?: (type: 'image' | 'record-link') => void }): SlashCommandItem[] => {
  const items: SlashCommandItem[] = [
    {
      title: 'Text',
      description: 'Just start typing with plain text.',
      icon: Type,
      command: () => {},
      keywords: ['paragraph', 'text', 'plain']
    },
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: Heading1,
      command: () => {},
      keywords: ['heading', 'h1', 'title']
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: Heading2,
      command: () => {},
      keywords: ['heading', 'h2', 'subtitle']
    },
    {
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: Heading3,
      command: () => {},
      keywords: ['heading', 'h3']
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list.',
      icon: List,
      command: () => {},
      keywords: ['list', 'bullet', 'unordered']
    },
    {
      title: 'Numbered List',
      description: 'Create a list with numbering.',
      icon: ListOrdered,
      command: () => {},
      keywords: ['list', 'numbered', 'ordered']
    },
    {
      title: 'Quote',
      description: 'Capture a quote.',
      icon: Quote,
      command: () => {},
      keywords: ['quote', 'blockquote', 'citation']
    },
    {
      title: 'Code',
      description: 'Capture a code snippet.',
      icon: Code,
      command: () => {},
      keywords: ['code', 'codeblock', 'snippet']
    },
    {
      title: 'Divider',
      description: 'Visually divide blocks.',
      icon: Minus,
      command: () => {},
      keywords: ['divider', 'separator', 'hr', 'horizontal']
    },
    {
      title: 'Image',
      description: 'Upload and display an image.',
      icon: Image,
      command: () => {
        if (onTransformBlock) {
          onTransformBlock('image');
        }
      },
      keywords: ['image', 'picture', 'photo', 'upload']
    },
    {
      title: 'Page Link',
      description: 'Link to a database record.',
      icon: Database,
      command: () => {
        if (onTransformBlock) {
          onTransformBlock('record-link');
        }
      },
      keywords: ['link', 'page', 'record', 'database', 'reference']
    }
  ];

  if (!query) {
    return items;
  }

  return items.filter(item => {
    const searchText = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchText) ||
      item.description.toLowerCase().includes(searchText) ||
      item.keywords?.some(keyword => keyword.includes(searchText))
    );
  });
};

export const SlashCommandExtension = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      onTransformBlock: null,
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: any; range: any; props: SlashCommandItem }) => {
          // Remove the slash and any query text
          editor.chain().focus().deleteRange(range).run();

          // Execute the command
          props.command();

          // Execute the appropriate command based on the selected item
          switch (props.title) {
            case 'Text':
              editor.chain().focus().setParagraph().run();
              break;
            case 'Heading 1':
              editor.chain().focus().toggleHeading({ level: 1 }).run();
              break;
            case 'Heading 2':
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              break;
            case 'Heading 3':
              editor.chain().focus().toggleHeading({ level: 3 }).run();
              break;
            case 'Bullet List':
              editor.chain().focus().toggleBulletList().run();
              break;
            case 'Numbered List':
              editor.chain().focus().toggleOrderedList().run();
              break;
            case 'Quote':
              editor.chain().focus().toggleBlockquote().run();
              break;
            case 'Code':
              editor.chain().focus().toggleCodeBlock().run();
              break;
            case 'Divider':
              editor.chain().focus().setHorizontalRule().run();
              break;
            case 'Image':
            case 'Page Link':
              // These are handled by the command function above
              break;
          }
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => getSuggestionItems({ 
          query, 
          onTransformBlock: this.options.onTransformBlock 
        }),
        render: () => {
          let component: ReactRenderer<SlashCommandsRef>;
          let popup: any;

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(SlashCommands, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = {
                getBoundingClientRect: () => props.clientRect(),
              };

              // Position the popup
              const rect = props.clientRect();
              if (rect && component.element) {
                component.element.style.position = 'fixed';
                component.element.style.top = `${rect.bottom + 8}px`;
                component.element.style.left = `${rect.left}px`;
                component.element.style.zIndex = '50';
                document.body.appendChild(component.element);
              }
            },

            onUpdate(props: any) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              // Update position
              const rect = props.clientRect();
              if (rect && component.element) {
                component.element.style.top = `${rect.bottom + 8}px`;
                component.element.style.left = `${rect.left}px`;
              }
            },

            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                popup = null;
                component.destroy();
                return true;
              }

              return component.ref?.onKeyDown(props.event) || false;
            },

            onExit() {
              if (component && component.element && component.element.parentNode) {
                component.element.parentNode.removeChild(component.element);
              }
              if (component) {
                component.destroy();
              }
              popup = null;
            },
          };
        },
      }),
    ];
  },
});