import React, { useState } from 'react';
import { 
  Database, 
  Layout, 
  GitBranch, 
  BarChart3, 
  ChevronDown, 
  ChevronRight, 
  Plus,
  Star,
  Settings,
  Grid,
  User,
  Users
} from 'lucide-react';
import { useDatabase } from '../Database/useDatabase';

// Navigation item type
type NavItem = {
  name: string;
  icon: React.ElementType;
  active?: boolean;
  children?: { id: string; name: string }[];
};

export function Sidebar() {
  const { 
    tables, 
    activeTableId, 
    createTable, 
    setActiveTable, 
    renameTable 
  } = useDatabase();
  
  // Convert tables to array for the sidebar
  const tablesList = Object.values(tables || {});
  
  // Create sections for the sidebar
  const sections: Record<string, NavItem[]> = {
    main: [
      { name: 'Tables', icon: Database, active: true, children: tablesList },
      { name: 'Pages', icon: Layout },
      { name: 'Workflows', icon: GitBranch },
      { name: 'Reports', icon: BarChart3 }
    ],
    other: [
      { name: 'Settings', icon: Settings },
      { name: 'Team', icon: Users }
    ]
  };
  
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Tables: true
  });
  
  // Editing state for table names
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingTableName, setEditingTableName] = useState('');
  
  // Favorite tables
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
  
  const handleCreateNewTable = async () => {
    const tableId = await createTable('New Table');
    setExpandedSections(prev => ({ ...prev, Tables: true }));
    setEditingTableId(tableId);
    setEditingTableName('New Table');
  };
  
  const handleTableClick = (tableId: string) => {
    setActiveTable(tableId);
  };
  
  const startEditingTable = (tableId: string, tableName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTableId(tableId);
    setEditingTableName(tableName);
  };
  
  const saveTableName = async () => {
    if (editingTableId) {
      const newName = editingTableName.trim() || 'Untitled Table';
      await renameTable(editingTableId, newName);
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
  
  const toggleFavorite = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId) 
        : [...prev, tableId]
    );
  };
  
  return (
    <div className="h-full w-60 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-1.5">
        {/* Favorites section */}
        {favorites.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>FAVORITES</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {favorites.map(tableId => {
                const table = tables[tableId];
                if (!table) return null;
                
                return (
                  <button
                    key={`fav-${table.id}`}
                    className={`w-full flex items-center px-2 py-1.5 rounded-md text-sm ${
                      activeTableId === table.id 
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                    }`}
                    onClick={() => handleTableClick(table.id)}
                  >
                    <Star size={14} className="mr-2 text-amber-400" />
                    <span className="truncate">{table.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      
        {/* Main sections */}
        {Object.entries(sections).map(([key, items]) => (
          <div key={key} className={key === 'other' ? 'mt-4' : ''}>
            {key === 'other' && (
              <div className="h-px bg-gray-200 dark:bg-gray-800 mb-3"></div>
            )}
            
            {items.map((item) => (
              <div key={item.name} className="mb-1">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => toggleSection(item.name)}
                    className={`flex items-center px-2 py-1.5 rounded-md text-sm ${
                      item.active 
                        ? 'text-gray-900 dark:text-white font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                    }`}
                  >
                    <item.icon size={16} className="mr-2" />
                    <span>{item.name}</span>
                    {item.children && (
                      <div className="ml-auto">
                        {expandedSections[item.name] ? (
                          <ChevronDown size={14} className="text-gray-500" />
                        ) : (
                          <ChevronRight size={14} className="text-gray-500" />
                        )}
                      </div>
                    )}
                  </button>
                  
                  {item.name === 'Tables' && (
                    <button
                      onClick={handleCreateNewTable}
                      className="p-1 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Create new table"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                
                {/* Children items (tables, etc) */}
                {item.children && expandedSections[item.name] && (
                  <div className="ml-6 mt-1 space-y-0.5">
                    {item.children.map((child) => (
                      <div 
                        key={child.id}
                        className="flex items-center group"
                      >
                        <button
                          className={`flex-1 flex items-center px-2 py-1 rounded-md text-sm ${
                            activeTableId === child.id 
                              ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                          }`}
                          onClick={() => handleTableClick(child.id)}
                        >
                          {editingTableId === child.id ? (
                            <input
                              type="text"
                              value={editingTableName}
                              onChange={(e) => setEditingTableName(e.target.value)}
                              onBlur={saveTableName}
                              onKeyDown={handleKeyDown}
                              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-1 py-0.5 rounded border border-gray-300 dark:border-gray-700 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              className="truncate"
                              onDoubleClick={(e) => startEditingTable(child.id, child.name, e)}
                            >
                              {child.name}
                            </span>
                          )}
                        </button>
                        
                        <button 
                          className={`p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-amber-400 focus:opacity-100 ${
                            favorites.includes(child.id) ? 'opacity-100 text-amber-400' : ''
                          }`}
                          onClick={(e) => toggleFavorite(e, child.id)}
                        >
                          <Star size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* User section */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        <button className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User size={14} className="text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Personal account</p>
          </div>
        </button>
      </div>
    </div>
  );
}