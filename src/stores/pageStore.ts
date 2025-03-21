import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  content?: any;
}

interface PageState {
  pages: Page[];
  activePage: Page | null;
  isLoading: boolean;
  error: string | null;
  
  // Fetch pages from the database
  fetchPages: () => Promise<void>;
  
  // Create a new page
  createPage: (title: string) => Promise<Page | null>;
  
  // Fetch a specific page with its content
  fetchPage: (pageId: string) => Promise<Page | null>;
  
  // Update page metadata (title, slug, etc.)
  updatePageMeta: (pageId: string, data: Partial<Omit<Page, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  
  // Update page content
  updatePageContent: (pageId: string, content: any) => Promise<void>;
  
  // Delete a page
  deletePage: (pageId: string) => Promise<void>;
  
  // Set active page
  setActivePage: (page: Page | null) => void;
}

export const usePageStore = create<PageState>((set, get) => ({
  pages: [],
  activePage: null,
  isLoading: false,
  error: null,
  
  fetchPages: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      const formattedPages = data.map(page => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        isPublished: page.is_published,
        createdAt: page.created_at,
        updatedAt: page.updated_at
      }));
      
      set({ pages: formattedPages, isLoading: false });
    } catch (error) {
      console.error('Error fetching pages:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch pages'
      });
    }
  },
  
  createPage: async (title: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('Not authenticated');
      }
      
      // Generate a slug from the title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Create page in the database
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .insert({
          title,
          slug,
          user_id: userData.user.id
        })
        .select()
        .single();
        
      if (pageError) throw pageError;
      
      // Create default content
      const { error: contentError } = await supabase
        .from('page_content')
        .insert({
          page_id: pageData.id,
          content: {}
        });
        
      if (contentError) throw contentError;
      
      const newPage = {
        id: pageData.id,
        title: pageData.title,
        slug: pageData.slug,
        isPublished: pageData.is_published,
        createdAt: pageData.created_at,
        updatedAt: pageData.updated_at
      };
      
      set(state => ({ 
        pages: [newPage, ...state.pages],
        activePage: newPage,
        isLoading: false 
      }));
      
      return newPage;
    } catch (error) {
      console.error('Error creating page:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to create page'
      });
      return null;
    }
  },
  
  fetchPage: async (pageId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch page with its content
      const { data, error } = await supabase
        .from('pages')
        .select(`
          *,
          page_content (content)
        `)
        .eq('id', pageId)
        .single();
        
      if (error) throw error;
      
      const page = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        isPublished: data.is_published,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        content: data.page_content?.[0]?.content || {}
      };
      
      set({ activePage: page, isLoading: false });
      return page;
    } catch (error) {
      console.error('Error fetching page:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch page'
      });
      return null;
    }
  },
  
  updatePageMeta: async (pageId: string, data: Partial<Omit<Page, 'id' | 'createdAt' | 'updatedAt'>>) => {
    set({ isLoading: true, error: null });
    try {
      // Convert data to snake_case for Supabase
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.isPublished !== undefined) updateData.is_published = data.isPublished;
      
      const { error } = await supabase
        .from('pages')
        .update(updateData)
        .eq('id', pageId);
        
      if (error) throw error;
      
      // Update local state
      set(state => ({
        pages: state.pages.map(page => 
          page.id === pageId 
            ? { ...page, ...data, updatedAt: new Date().toISOString() }
            : page
        ),
        activePage: state.activePage?.id === pageId 
          ? { ...state.activePage, ...data, updatedAt: new Date().toISOString() }
          : state.activePage,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating page:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update page'
      });
    }
  },
  
  updatePageContent: async (pageId: string, content: any) => {
    set({ isLoading: true, error: null });
    try {
      // First check if content exists
      const { data: contentData, error: contentQueryError } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_id', pageId);
        
      if (contentQueryError) throw contentQueryError;
      
      if (contentData && contentData.length > 0) {
        // Update existing content
        const { error } = await supabase
          .from('page_content')
          .update({ content })
          .eq('page_id', pageId);
          
        if (error) throw error;
      } else {
        // Create new content
        const { error } = await supabase
          .from('page_content')
          .insert({ page_id: pageId, content });
          
        if (error) throw error;
      }
      
      // Update local state
      set(state => ({
        activePage: state.activePage?.id === pageId 
          ? { ...state.activePage, content, updatedAt: new Date().toISOString() }
          : state.activePage,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating page content:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update page content'
      });
    }
  },
  
  deletePage: async (pageId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);
        
      if (error) throw error;
      
      // Update local state
      set(state => ({
        pages: state.pages.filter(page => page.id !== pageId),
        activePage: state.activePage?.id === pageId ? null : state.activePage,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting page:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete page'
      });
    }
  },
  
  setActivePage: (page: Page | null) => {
    set({ activePage: page });
  }
}));