import React, { useState } from 'react';
import { Image, Upload, X } from 'lucide-react';
import { ImageBlock } from '../../types/blocks';

interface ImageBlockViewProps {
  block: ImageBlock;
  onChange: (block: ImageBlock) => void;
  onDelete: () => void;
  isFocused: boolean;
  onFocus: () => void;
}

export function ImageBlockView({
  block,
  onChange,
  onDelete,
  isFocused,
  onFocus
}: ImageBlockViewProps) {
  const [isEditing, setIsEditing] = useState(!block.url);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload to a storage service
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);
      onChange({
        ...block,
        url,
        alt: file.name
      });
      setIsEditing(false);
    }
  };

  const handleCaptionChange = (caption: string) => {
    onChange({
      ...block,
      caption
    });
  };

  if (isEditing || !block.url) {
    return (
      <div 
        className={`w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center ${
          isFocused ? 'border-blue-500 dark:border-blue-400' : ''
        }`}
        onClick={onFocus}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Upload an image</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click to browse or drag and drop
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id={`image-upload-${block.id}`}
          />
          <label
            htmlFor={`image-upload-${block.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 cursor-pointer"
          >
            Choose Image
          </label>
          {isFocused && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-600 dark:text-red-400 hover:text-red-500 text-sm"
            >
              Delete Block
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full group"
      onClick={onFocus}
    >
      <div className="relative">
        <img
          src={block.url}
          alt={block.alt || 'Image'}
          className="w-full h-auto rounded-lg shadow-sm"
        />
        {isFocused && (
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Image className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}
      </div>
      
      {/* Caption */}
      <div className="mt-2">
        {isFocused ? (
          <input
            type="text"
            value={block.caption || ''}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Add a caption..."
            className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 py-1"
          />
        ) : (
          block.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-1">
              {block.caption}
            </p>
          )
        )}
      </div>
    </div>
  );
}