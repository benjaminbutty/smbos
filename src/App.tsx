import React, { useState } from 'react';
import { Menu, X, FileText, Layout, GitBranch, BarChart3 } from 'lucide-react';
import { DatabaseTable } from './components/Database/DatabaseTable';

type NavItem = {
  name: string;
  icon: React.ElementType;
};

const navigation: NavItem[] = [
  { name: 'Records', icon: FileText },
  { name: 'Pages', icon: Layout },
  { name: 'Workflows', icon: GitBranch },
  { name: 'Reports', icon: BarChart3 },
];

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Records');

  const renderContent = () => {
    switch (activeSection) {
      case 'Records':
        return <DatabaseTable />;
      default:
        return (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">Under Construction</p>
            <p className="text-sm text-gray-500 mt-2">
              This module is currently being developed
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile menu button */}
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

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <h1 className="text-xl font-semibold text-gray-100">Admin Portal</h1>
        </div>
        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveSection(item.name);
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`w-full mt-2 flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === item.name
                    ? 'bg-gray-700 text-gray-100'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <main
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:pl-64' : ''
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-semibold text-gray-100 mb-6">
                {activeSection} Module
              </h2>
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;