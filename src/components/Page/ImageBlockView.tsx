import React, { useState, useRef } from 'react';
import { Image, Upload, X, Loader2, Crop as CropIcon, Check } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ImageBlock } from '../../types/blocks';
import { supabase } from '../../lib/supabase';

interface ImageBlockViewProps {
  block: ImageBlock;
  onChange: (block: ImageBlock) => void;
  onDelete: () => void;
  isFocused: boolean;
  onFocus: () => void;
}

// Helper function to create a cropped image canvas
function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Canvas is empty');
      }
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
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
  
  // Cropping states
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    
    // Read file as data URL for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Create a square crop in the center
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1, // 1:1 aspect ratio for square
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  };

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Get cropped image as blob
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Generate unique file path
      const fileExt = 'jpg'; // We're converting to JPEG
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `images/${block.id}/${fileName}`;

      // Upload cropped image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, croppedImageBlob, {
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
        alt: 'Cropped image'
      });

      // Reset states
      setIsEditing(false);
      setIsCropping(false);
      setImgSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setUploadError(null);
  };

  const handleCaptionChange = (caption: string) => {
    onChange({
      ...block,
      caption
    });
  };

  // Show cropping interface
  if (isCropping && imgSrc) {
    return (
      <div 
        className={`w-full max-w-lg mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 ${
          isFocused ? 'border-blue-500 dark:border-blue-400' : ''
        }`}
        onClick={onFocus}
      >
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Crop Your Image
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag to adjust the crop area, then click "Crop & Save"
            </p>
          </div>

          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1} // Square aspect ratio
              minWidth={100}
              minHeight={100}
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imgSrc}
                style={{ maxHeight: '400px', maxWidth: '100%' }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>

          {uploadError && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {uploadError}
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={handleCancelCrop}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              disabled={isUploading || !completedCrop}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Crop & Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show upload interface
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
            <Upload className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Upload an image
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You'll be able to crop it after upload
            </p>
          </div>
          
          {uploadError && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-full break-words">
              {uploadError}
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`image-upload-${block.id}`}
          />
          <label
            htmlFor={`image-upload-${block.id}`}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-500 cursor-pointer text-sm flex items-center gap-2"
          >
            <CropIcon className="w-4 h-4" />
            Choose & Crop Image
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

  // Show final image
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