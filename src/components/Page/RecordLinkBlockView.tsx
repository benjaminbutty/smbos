import React, { useState } from 'react';
import { Link, Database, X } from 'lucide-react';
import { RecordLinkBlock } from '../../types/blocks';

interface RecordLinkBlockViewProps {
  block: RecordLinkBlock;
  onChange: (block: RecordLinkBlock) => void;
  onDelete: () => void;
  isFocused: boolean;
  onFocus: () => void;
}

export function RecordLinkBlockView({
  block,
  onChange,
  onDelete,
  isFocused,
  onFocus
}: RecordLinkBlockViewProps) {
  const [isEditing, setIsEditing] = useState(!block.title);

  const handleTitleChange = (title: string) => {
    onChange({
      ...block,
      title
    });
  };

  if (isEditing || !block.title) {
    return (
      <div 
        className={`w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 ${
          isFocused ? 'border-blue-500 dark:border-blue-400' : ''
        }`}
        onClick={onFocus}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={block.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter record title..."
              className="w-full text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              autoFocus
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Link to a database record (feature coming soon)
            </p>
          </div>
          {isFocused && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-red-600 dark:text-red-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full group ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-lg' : ''}`}
      onClick={onFocus}
    >
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {block.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Database record link
          </p>
        </div>
        {isFocused && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-red-600 dark:text-red-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}