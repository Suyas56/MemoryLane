import React, { useCallback, useState } from 'react';
import { Photo } from '../types';
import { Upload, Loader2 } from 'lucide-react';

interface Props {
  onPhotosAdded: (photos: Photo[]) => void;
}

export const PhotoUploader: React.FC<Props> = ({ onPhotosAdded }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const files = Array.from(e.target.files) as File[];
      const newPhotos: Photo[] = [];

      // Safe environment variable access
      let CLOUD_NAME = '';
      let UPLOAD_PRESET = '';
      
      try {
        const meta = import.meta as any;
        if (meta && meta.env) {
          CLOUD_NAME = meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
          UPLOAD_PRESET = meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
        }
      } catch (e) {
        console.warn('Cloudinary env vars not found');
      }
      
      try {
        for (const file of files) {
          let photoUrl = '';
          
          if (CLOUD_NAME && UPLOAD_PRESET) {
            // --- Cloudinary Upload (Production Mode) ---
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
              method: 'POST',
              body: formData,
            });

            if (!res.ok) throw new Error('Cloudinary upload failed');
            const data = await res.json();
            photoUrl = data.secure_url;
            
            newPhotos.push({
              id: crypto.randomUUID(),
              url: photoUrl,
              width: data.width,
              height: data.height,
              aspectRatio: data.width / data.height
            });

          } else {
            // --- Local Storage Fallback (Demo Mode) ---
            const reader = new FileReader();
            await new Promise<void>((resolve) => {
              reader.onload = (ev) => {
                const src = ev.target?.result as string;
                const img = new Image();
                img.onload = () => {
                  newPhotos.push({
                    id: crypto.randomUUID(),
                    url: src,
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height
                  });
                  resolve();
                };
                img.src = src;
              };
              reader.readAsDataURL(file);
            });
          }
        }
        onPhotosAdded(newPhotos);
      } catch (err) {
        console.error("Upload error:", err);
        alert("Failed to upload photos. Please check your connection or credentials.");
      } finally {
        setIsUploading(false);
      }
    }
  }, [onPhotosAdded]);

  // Check if Cloudinary is configured for display
  let isCloudConfigured = false;
  try {
     const meta = import.meta as any;
     isCloudConfigured = !!(meta?.env?.VITE_CLOUDINARY_CLOUD_NAME);
  } catch(e) {}

  return (
    <div className="w-full">
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <Loader2 className="w-8 h-8 mb-2 text-indigo-600 dark:text-indigo-400 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 mb-2 text-gray-400" />
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isUploading ? (
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Uploading...</span>
            ) : (
              <>
                <span className="font-semibold text-gray-900 dark:text-white">Click to upload photos</span>
                <span className="block text-xs text-gray-400 mt-1">
                  {isCloudConfigured ? 'Secure Cloud Storage Enabled' : 'Local Storage Mode'}
                </span>
              </>
            )}
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
};