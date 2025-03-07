import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, X, Database, Layout, GitBranch, BarChart3, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { DatabaseTable } from './components/Database/DatabaseTable';
import { useDatabase } from './components/Database/useDatabase';
import { AuthPage } from './pages/Auth';
import { supabase } from './lib/supabase';
import { AuthProvider } from './contexts/AuthContext';

type NavItem = {
  name: string;
  icon: React.ElementType;
};

const mainNavigation: NavItem[] = [
  { name: 'Tables', icon: Database },
  { name: 'Pages', icon: Layout },
  { name: 'Workflows', icon: GitBranch },
  { name: 'Reports', icon: BarChart3 },
];

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Tables');
  const [isTablesExpanded, setIsTablesExpanded] = useState(true);
  
  const { 
    tables, 
    activeTableId, 
    createTable, 
    setActiveTable, 
    renameTable 
  } = useDatabase();
  
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingTableName, setEditingTableName] = useState('');

  const tablesList = Object.values(tables || {});

  const handleCreateNewTable = () => {
    const tableId = createTable('New Table');
    setActiveSection('Tables');
    setEditingTableId(tableId);
    setEditingTableName('New Table');
    setIsTablesExpanded(true);
  };

  const handleTableClick = (tableId: string) => {
    setActiveTable(tableId);
    setActiveSection('Tables');
  };

  const startEditingTable = (tableId: string, tableName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTableId(tableId);
    setEditingTableName(tableName);
  };

  const saveTableName = () => {
    if (editingTableId) {
      const newName = editingTableName.trim() || 'Untitled Table';
      renameTable(editingTableId, newName);
      setEditingTableId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTableName();
    } else if (e.key === 'Escape') {
      setEditingTableId(null);
    }
  };

  const renderContent = () => {
    if (activeSection === 'Tables') {
      return <DatabaseTable />;
    }

    return (
      <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">This module is currently under development</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <h1 className="text-xl font-semibold text-gray-100">Admin Portal</h1>
        </div>
        <nav className="mt-6 px-3">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.name;
            const isTables = item.name === 'Tables';

            return (
              <div key={item.name}>
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => {
                      setActiveSection(item.name);
                      if (isTables) {
                        setIsTablesExpanded(!isTablesExpanded);
                      }
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`flex flex-1 items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-gray-100'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                    {isTables && (
                      <div className="ml-auto">
                        {isTablesExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </button>
                  {isTables && (
                    <button
                      onClick={handleCreateNewTable}
                      className="ml-2 p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-md"
                      title="Create new table"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {isTables && isTablesExpanded && tablesList.length > 0 && (
                  <div className="mt-1 ml-4 space-y-1">
                    {tablesList.map((table) => (
                      <div 
                        key={table.id}
                        className={`flex items-center rounded-md ${
                          activeTableId === table.id ? 'bg-gray-700 text-gray-100' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-100'
                        }`}
                      >
                        <button
                          className="flex-1 text-left px-3 py-2 text-sm"
                          onClick={() => handleTableClick(table.id)}
                        >
                          {editingTableId === table.id ? (
                            <input
                              type="text"
                              value={editingTableName}
                              onChange={(e) => setEditingTableName(e.target.value)}
                              onBlur={saveTableName}
                              onKeyDown={handleKeyDown}
                              className="bg-gray-600 text-gray-100 px-1 py-0.5 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span onDoubleClick={(e) => startEditingTable(table.id, table.name, e)}>
                              {table.name}
                            </span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <main
        className={`transition-all duration-300 ease-in-out h-screen flex flex-col ${
          isSidebarOpen ? 'lg:pl-64' : ''
        }`}
      >
        <div className="flex-1 flex flex-col">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">
              {activeSection === 'Tables' && activeTableId && tables && tables[activeTableId] ? (
                tables[activeTableId].name
              ) : (
                `${activeSection} Module`
              )}
            </h2>
          </div>
          <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 flex">
            {renderContent()}
          </div>
        </div>
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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