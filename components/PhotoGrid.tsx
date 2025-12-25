import React, { useEffect, useState, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Photo } from '../types';
import { computeGreedyLayout, LayoutRow } from '../services/algorithms';
import { X, GripHorizontal, Image } from 'lucide-react';

interface Props {
  photos: Photo[];
  className?: string;
  onRemove?: (id: string) => void;
  onReorder?: (newOrder: Photo[]) => void;
}

export const PhotoGrid: React.FC<Props> = ({ photos, className = '', onRemove, onReorder }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<LayoutRow[]>([]);
  const [width, setWidth] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Debug logging
  useEffect(() => {
    console.log(`[PhotoGrid] Received ${photos.length} photos`, photos);
  }, [photos]);

  const handleImageLoad = (photoId: string) => {
    setLoadedImages(prev => new Set(prev).add(photoId));
    console.log(`[PhotoGrid] Image loaded: ${photoId}`);
  };

  const handleImageError = (photoId: string) => {
    setFailedImages(prev => new Set(prev).add(photoId));
    console.error(`[PhotoGrid] Image failed to load: ${photoId}`);
  };

  // View Mode: Use optimal algorithm
  useEffect(() => {
    if (!onReorder) {
      const updateLayout = () => {
        if (containerRef.current) {
          const w = containerRef.current.offsetWidth;
          setWidth(w);
          
          // Ensure all photos have valid dimensions
          const photosWithDimensions = photos.map(photo => ({
            ...photo,
            width: photo.width || 1000,
            height: photo.height || 750,
            aspectRatio: photo.aspectRatio || (photo.width && photo.height ? photo.width / photo.height : 4 / 3)
          }));
          
          // Simple grid layout - works for all photo counts
          const photoCount = photosWithDimensions.length;
          
          if (photoCount === 1) {
            // Single photo - very large
            setLayout([{
              photos: [photosWithDimensions[0]],
              height: 1000
            }]);
          } else if (photoCount === 2) {
            // 2 photos side by side
            setLayout([{
              photos: photosWithDimensions,
              height: 800
            }]);
          } else if (photoCount === 3) {
            // 3 photos side by side
            setLayout([{
              photos: photosWithDimensions,
              height: 700
            }]);
          } else {
            // 4+ photos - create rows with 2-3 photos each at large size
            const rows: LayoutRow[] = [];
            let currentIndex = 0;
            
            while (currentIndex < photoCount) {
              const remainingPhotos = photoCount - currentIndex;
              let photosInRow = 2; // Default to 2 per row
              
              // Smart row distribution
              if (remainingPhotos === 1) {
                photosInRow = 1; // Last photo alone
              } else if (remainingPhotos === 2) {
                photosInRow = 2; // Last 2 together
              } else if (remainingPhotos === 3) {
                photosInRow = 3; // 3 together if that's all that's left
              } else {
                // For larger counts, alternate between 2 and 3
                photosInRow = (rows.length % 2 === 0) ? 3 : 2;
              }
              
              const rowPhotos = photosWithDimensions.slice(currentIndex, currentIndex + photosInRow);
              rows.push({
                photos: rowPhotos,
                height: photosInRow === 1 ? 800 : photosInRow === 2 ? 700 : 600 // Large heights
              });
              
              currentIndex += photosInRow;
            }
            
            setLayout(rows);
          }
        }
      };

      updateLayout();
      window.addEventListener('resize', updateLayout);
      return () => window.removeEventListener('resize', updateLayout);
    }
  }, [photos, onReorder]);

  // --- EDIT MODE (Drag & Drop) ---
  if (onReorder) {
    return (
      <div className={`w-full ${className}`}>
        <Reorder.Group 
          axis="y" 
          values={photos} 
          onReorder={onReorder} 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {photos.map((photo) => (
            <Reorder.Item 
              key={photo.id} 
              value={photo}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square group cursor-move touch-none"
            >
              <div className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 relative">
                {failedImages.has(photo.id) ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="text-center text-gray-400">
                      <Image size={24} className="mx-auto opacity-50" />
                    </div>
                  </div>
                ) : (
                  <img 
                    src={photo.url} 
                    alt="Memory" 
                    className="w-full h-full object-cover pointer-events-none select-none"
                    onLoad={() => handleImageLoad(photo.id)}
                    onError={() => handleImageError(photo.id)}
                  />
                )}
                
                {/* Drag Handle Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <GripHorizontal className="text-white drop-shadow-md" />
                </div>

                {/* Remove Button */}
                {onRemove && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(photo.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 focus:opacity-100"
                    title="Remove photo"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
        
        {photos.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
             <p className="text-gray-400">Upload photos to start arranging them.</p>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW MODE (Optimized Layout) ---
  return (
    <div ref={containerRef} className={`w-full space-y-3 ${className}`}>
      {layout.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`flex space-x-3 ${row.photos.length === 1 ? 'justify-center' : 'overflow-hidden'}`}
          style={{ height: row.height }}
        >
          {row.photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: rowIndex * 0.1 }}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-gray-200 dark:bg-gray-700"
              style={{ 
                width: row.height * photo.aspectRatio,
                height: row.height,
                flexShrink: 0
              }}
            >
              {failedImages.has(photo.id) ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="text-center text-gray-400 dark:text-gray-500">
                    <Image size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Image unavailable</p>
                  </div>
                </div>
              ) : (
                <img 
                  src={photo.url} 
                  alt="Memory" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onLoad={() => handleImageLoad(photo.id)}
                  onError={() => handleImageError(photo.id)}
                />
              )}
            </motion.div>
          ))}
        </div>
      ))}
      {photos.length === 0 && (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">No photos added yet.</div>
      )}
    </div>
  );
};