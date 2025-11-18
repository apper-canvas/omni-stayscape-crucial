import React, { useState, useRef } from 'react';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';

const FileDropzone = ({ onFileDrop, className }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileDrop(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      onFileDrop(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer",
        isDragOver 
          ? "border-primary-500 bg-primary-50 scale-105" 
          : "border-gray-300 hover:border-primary-400 hover:bg-gray-50",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="space-y-4">
        <div className={cn(
          "mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors",
          isDragOver ? "bg-primary-100" : "bg-gray-100"
        )}>
          <ApperIcon 
            name="Upload" 
            className={cn(
              "h-8 w-8 transition-colors",
              isDragOver ? "text-primary-600" : "text-gray-600"
            )} 
          />
        </div>
        
        <div>
          <h3 className="text-lg font-medium font-display text-gray-900 mb-2">
            {isDragOver ? "Drop photos here" : "Upload property photos"}
          </h3>
          <p className="text-gray-600 font-body mb-2">
            Drag and drop your images here, or click to select files
          </p>
          <p className="text-sm text-gray-500 font-body">
            Supports JPG, PNG, WebP up to 5MB each
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileDropzone;