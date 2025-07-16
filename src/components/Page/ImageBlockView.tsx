import React, { useState } from 'react';
import { Image, Upload, X, Loader2 } from 'lucide-react';
import { ImageBlock } from '../../types/blocks';
import { supabase } from '../../lib/supabase';

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `images/${block.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Update block with permanent URL
      onChange({
        ...block,
        url: urlData.publicUrl,
        alt: file.name
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
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
        className={`w-48 h-48 mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center flex flex-col justify-center ${
          isFocused ? 'border-blue-500 dark:border-blue-400' : ''
        }`}
        onClick={onFocus}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {isUploading ? 'Uploading...' : 'Upload an image'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isUploading ? 'Please wait' : 'Click to browse or drag and drop'}
            </p>
          </div>
          
          {uploadError && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-full break-words">
              {uploadError}
            </div>
          )}
          
          {!isUploading && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id={`image-upload-${block.id}`}
                disabled={isUploading}
              />
              <label
                htmlFor={`image-upload-${block.id}`}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-500 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Choose Image
              </label>
            </>
          )}
          
          {isFocused && !isUploading && (
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
          className="w-48 h-48 object-cover rounded-lg shadow-sm mx-auto"
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