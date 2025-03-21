import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import { Save, Plus, Settings, Eye, ArrowLeft, Globe } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePageStore } from '../../stores/pageStore';
import { BlockSelector } from './BlockSelector';
import { supabase } from '../../lib/supabase';

export function PageEditor() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { 
    activePage, 
    fetchPage, 
    createPage,
    updatePageMeta,
    updatePageContent,
    isLoading 
  } = usePageStore();
  
  const [title, setTitle] = useState('Untitled Page');
  const [isBlockSelectorOpen, setIsBlockSelectorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      StarterKit.configure({
        document: false,
        paragraph: false,
      }),
      Placeholder.configure({
        placeholder: 'Start typing or add a block...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none dark:prose-invert min-h-[200px] p-4',
      },
    },
    content: '',
    editable: !previewMode,
  });

  // Load page data
  useEffect(() => {
    const loadPage = async () => {
      if (pageId && pageId !== 'new') {
        const page = await fetchPage(pageId);
        if (page) {
          setTitle(page.title);
          
          if (editor && page.content) {
            editor.commands.setContent(page.content);
          }
        }
      }
    };
    
    loadPage();
  }, [pageId, fetchPage, editor]);

  // Save page data
  const savePage = async () => {
    if (!editor) return;
    
    setIsSaving(true);
    
    try {
      const content = editor.getJSON();
      
      let currentPageId = pageId;
      
      // If this is a new page, create it first
      if (pageId === 'new') {
        const newPage = await createPage(title);
        if (newPage) {
          currentPageId = newPage.id;
          // Navigate to the edit URL with the new page ID
          navigate(`/pages/edit/${newPage.id}`, { replace: true });
        } else {
          throw new Error('Failed to create new page');
        }
      } else {
        // Update existing page metadata
        await updatePageMeta(pageId, { title });
      }
      
      // Update page content
      if (currentPageId) {
        await updatePageContent(currentPageId, content);
      }
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding a block
  const addBlock = (blockType: string) => {
    if (!editor) return;
    
    switch (blockType) {
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      default:
        // For regular text blocks and other TipTap nodes
        editor.chain().focus().insertContent({
          type: blockType
        }).run();
    }
    
    setIsBlockSelectorOpen(false);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/pages');
  };

  // Handle publish/unpublish
  const togglePublish = async () => {
    if (!pageId || pageId === 'new') return;
    
    const newPublishState = !(activePage?.isPublished);
    await updatePageMeta(pageId, { isPublished: newPublishState });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={18} />
          </button>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
            placeholder="Untitled Page"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={togglePublish}
            disabled={!pageId || pageId === 'new' || isLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
              activePage?.isPublished
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Globe size={16} className="mr-1" />
            {activePage?.isPublished ? 'Published' : 'Publish'}
          </button>

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`p-2 rounded ${
              previewMode ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Eye size={18} />
          </button>
          
          <button
            onClick={() => setIsBlockSelectorOpen(true)}
            className="p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={previewMode}
          >
            <Plus size={18} />
          </button>
          
          <button
            onClick={savePage}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
            ) : (
              <Save size={16} />
            )}
            <span>Save</span>
          </button>
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
      
      {/* Block Selector */}
      {isBlockSelectorOpen && (
        <BlockSelector 
          onSelect={addBlock} 
          onClose={() => setIsBlockSelectorOpen(false)} 
        />
      )}
    </div>
  );
}