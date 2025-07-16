import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, X, MoreHorizontal, Trash2 } from 'lucide-react';
import { DatabaseTable } from './components/Database/DatabaseTable';
import { Header } from './components/UI/Header';
import { Sidebar } from './components/UI/Sidebar';
import { useDatabase } from './components/Database/useDatabase';
import { AuthPage } from './pages/Auth';
import { useAuth } from './contexts/AuthContext';
import { PageEditor } from './components/Page/PageEditor';

function PageContent() {
  const { pages, activePageId, deletePage, updatePageContent } = useDatabase();
  const activePage = activePageId ? pages[activePageId] : null;
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  
  if (!activePage) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400">No page selected</p>
        </div>
      </div>
    );
  }
  
  // Handle delete page
  const handleDeletePage = async () => {
    if (!activePage) return;
    
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the page "${activePage.name}"? This action cannot be undone.`
    );
    
    if (isConfirmed) {
      try {
        await deletePage(activePage.id);
        setShowMoreMenu(false);
      } catch (error) {
        console.error('Error deleting page:', error);
      }
    }
  };
  
  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);
  
  // Handle content changes with debouncing to avoid too many database calls
  const handleContentChange = React.useCallback(
    debounce((content: any) => {
      if (activePage) {
        updatePageContent(activePage.id, content);
      }
    }, 1000), // Save after 1 second of no changes
    [activePage, updatePageContent]
  );
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Page Header Controls - matches table header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {activePage.name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* More menu */}
          <div className="relative" ref={moreMenuRef}>
            <button 
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MoreHorizontal size={16} />
            </button>
            
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-[70] border border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDeletePage}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={14} />
                  Delete Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="flex-1 bg-white dark:bg-gray-900 overflow-auto">
        <PageEditor
          initialContent={activePage.content}
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
}

// Simple debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { tables, pages, activeTableId, activePageId, fetchUserTables } = useDatabase();
  const activeTable = activeTableId ? tables[activeTableId] : null;
  const activePage = activePageId ? pages[activePageId] : null;
  
  const getTitle = () => {
    if (activeTable) return activeTable.name;
    if (activePage) return activePage.name;
    return 'Dashboard';
  };
  
  useEffect(() => {
    fetchUserTables();
  }, [fetchUserTables]);
  
  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <Header title={getTitle()} />
      
      {/* Mobile sidebar toggle button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 top-[88px] z-30 w-60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar />
        </div>
        
        {/* Main content - full height and width with its own scrolling */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'lg:pl-60' : ''
          }`}
        >
          {/* Full-height container for DatabaseTable */}
          <div className="h-full">
            {activeTableId ? (
              <DatabaseTable />
            ) : activePageId ? (
              <PageContent />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div className="text-center p-8">
                  <p className="text-gray-500 dark:text-gray-400">Select a table or page to get started</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  
  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />}
        />
        <Route
          path="/dashboard/*"
          element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;