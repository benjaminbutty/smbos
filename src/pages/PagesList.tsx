import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, MoreHorizontal, Edit, ExternalLink, Trash2, Globe, Lock } from 'lucide-react';
import { usePageStore, Page } from '../stores/pageStore';

export function PagesList() {
  const navigate = useNavigate();
  const { pages, fetchPages, deletePage, isLoading } = usePageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);
  
  // Filter pages based on search query
  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Handle new page creation
  const handleCreatePage = () => {
    navigate('/pages/new');
  };
  
  // Handle page edit
  const handleEditPage = (pageId: string) => {
    navigate(`/pages/edit/${pageId}`);
    setActiveDropdown(null);
  };
  
  // Handle page view
  const handleViewPage = (page: Page) => {
    window.open(`/p/${page.slug}`, '_blank');
    setActiveDropdown(null);
  };
  
  // Handle page delete with confirmation
  const handleDeletePage = async (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      await deletePage(pageId);
    }
    setActiveDropdown(null);
  };
  
  // Toggle dropdown menu
  const toggleDropdown = (pageId: string) => {
    setActiveDropdown(activeDropdown === pageId ? null : pageId);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.dropdown-menu')) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pages</h2>
        <button
          onClick={handleCreatePage}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          <Plus size={16} />
          <span>New Page</span>
        </button>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-md text-sm text-gray-900 dark:text-gray-300 placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* List of pages */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredPages.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredPages.map(page => (
              <div 
                key={page.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                onClick={() => handleEditPage(page.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {page.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(page.updatedAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status and actions */}
                  <div className="flex items-center gap-2">
                    {/* Status indicator */}
                    <span className="flex items-center text-xs">
                      {page.isPublished ? (
                        <Globe className="h-3.5 w-3.5 text-green-500 mr-1" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                      )}
                      <span className={page.isPublished ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                        {page.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </span>
                    
                    {/* Actions dropdown */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(page.id);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </button>
                      
                      {activeDropdown === page.id && (
                        <div className="dropdown-menu absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 text-sm border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPage(page.id);
                            }}
                            className="flex w-full items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          {page.isPublished && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPage(page);
                              }}
                              className="flex w-full items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(page.id);
                            }}
                            className="flex w-full items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <FileText className="h-10 w-10 text-gray-400 mb-2" />
            {searchQuery ? (
              <>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No pages found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Try a different search term
                </p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No pages yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Create your first page to get started
                </p>
                <button
                  onClick={handleCreatePage}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  <Plus size={16} />
                  <span>New Page</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}