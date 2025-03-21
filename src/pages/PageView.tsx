import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import { supabase } from '../lib/supabase';
import { ProductBlock } from '../components/PageBuilder/extensions/ProductBlock';
import { CollectionBlock } from '../components/PageBuilder/extensions/CollectionBlock';

interface Page {
  id: string;
  title: string;
  content: any;
  isPublished: boolean;
}

export function PageView() {
  const { pageSlug } = useParams<{ pageSlug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      StarterKit.configure({
        document: false,
        paragraph: false,
      }),
      ProductBlock,
      CollectionBlock,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none dark:prose-invert min-h-[200px] p-4',
      },
    },
    content: '',
    editable: false,
  });

  // Load page by slug
  useEffect(() => {
    async function fetchPageBySlug() {
      if (!pageSlug) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch page by slug
        const { data, error } = await supabase
          .from('pages')
          .select(`
            id,
            title,
            is_published,
            page_content (content)
          `)
          .eq('slug', pageSlug)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          throw new Error('Page not found');
        }
        
        if (!data.is_published) {
          throw new Error('This page is not published');
        }
        
        const pageData = {
          id: data.id,
          title: data.title,
          isPublished: data.is_published,
          content: data.page_content?.[0]?.content || {}
        };
        
        setPage(pageData);
        
        // Set content in editor
        if (editor && pageData.content) {
          editor.commands.setContent(pageData.content);
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setError(error instanceof Error ? error.message : 'Failed to load page');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPageBySlug();
  }, [pageSlug, editor]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Available</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Show page content
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {page?.title}
        </h1>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}