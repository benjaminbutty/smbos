import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { DatabaseTable } from './components/Database/DatabaseTable';
import { Header } from './components/UI/Header';
import { Sidebar } from './components/UI/Sidebar';
import { useDatabase } from './components/Database/useDatabase';
import { AuthPage } from './pages/Auth';
import { useAuth } from './contexts/AuthContext';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { tables, activeTableId, fetchUserTables } = useDatabase();
  const activeTable = activeTableId ? tables[activeTableId] : null;
  
  useEffect(() => {
    fetchUserTables();
  }, [fetchUserTables]);
  
  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <Header title={activeTable?.name || 'Dashboard'} />
      
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
          className={`fixed inset-y-0 left-0 top-[88px] z-40 w-60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar />
        </div>
        
        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out overflow-auto pt-4 px-4 ${
            isSidebarOpen ? 'lg:pl-64' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto pb-6">
            <DatabaseTable />
          </div>
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden z-30"
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