import React, { useState } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const ImagePreviewGrid = ({ images, onRemove, onMove }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onMove(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

const createImageUrl = (file) => {
    if (typeof File !== 'undefined' && file instanceof File) {
      return URL.createObjectURL(file);
    }
    return file; // Already a URL string
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 font-body">
          {images.length} photo{images.length !== 1 ? 's' : ''} uploaded
          {images.length > 0 && (
            <span className="ml-2 text-primary-600">• First photo will be the main image</span>
          )}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "relative group rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-move",
              index === 0 
                ? "border-primary-500 ring-2 ring-primary-200" 
                : "border-gray-200 hover:border-gray-300",
              draggedIndex === index && "opacity-50 scale-95"
            )}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="aspect-square bg-gray-100">
              <img
                src={createImageUrl(image)}
                alt={`Property ${index + 1}`}
                className="w-full h-full object-cover"
onLoad={(e) => {
                  // Cleanup object URLs after loading to prevent memory leaks
                  if (typeof File !== 'undefined' && image instanceof File) {
                    setTimeout(() => URL.revokeObjectURL(e.target.src), 1000);
                  }
                }}
              />
            </div>
            
            {/* Main image indicator */}
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full font-body">
                Main Photo
              </div>
            )}
            
            {/* Remove button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => onRemove(index)}
                className="p-1.5 h-auto w-auto"
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Drag handle */}
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black bg-opacity-50 text-white p-1.5 rounded">
                <ApperIcon name="GripVertical" className="h-4 w-4" />
              </div>
            </div>
            
            {/* Image index */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs font-medium px-2 py-1 rounded font-body">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePreviewGrid;