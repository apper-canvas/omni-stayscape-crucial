import React from "react";
import { cn } from "@/utils/cn";

const Loading = ({ className, variant = "grid" }) => {
  if (variant === "grid") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Image skeleton */}
            <div className="aspect-[4/3] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 shimmer" />
            
            {/* Content skeleton */}
            <div className="p-6">
              <div className="space-y-3">
                {/* Title */}
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded shimmer" />
                
                {/* Location */}
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 shimmer" />
                
                {/* Details row */}
                <div className="flex space-x-4 pt-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 shimmer" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 shimmer" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 shimmer" />
                </div>
                
                {/* Amenities */}
                <div className="flex space-x-2 pt-2">
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-16 shimmer" />
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-20 shimmer" />
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-14 shimmer" />
                </div>
                
                {/* Price */}
                <div className="flex justify-end pt-2">
                  <div className="text-right">
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 shimmer mb-1" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 shimmer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex">
              {/* Image skeleton */}
              <div className="w-32 h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 shimmer" />
              
              {/* Content skeleton */}
              <div className="flex-1 p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 shimmer" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2 shimmer" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 shimmer mb-1" />
                      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 shimmer" />
                    </div>
                    <div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 shimmer mb-1" />
                      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 shimmer" />
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex space-x-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 shimmer" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 shimmer" />
                    </div>
                    <div>
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 shimmer mb-1" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-12 shimmer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center", className)}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 mx-auto shimmer" />
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 mx-auto shimmer" />
        </div>
      </div>
    </div>
  );
};

export default Loading;