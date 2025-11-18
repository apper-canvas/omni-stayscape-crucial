import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 16, 
  interactive = false, 
  onRatingChange,
  className = "" 
}) => {
  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (starIndex) => {
    const starRating = starIndex + 1;
    const isFilled = rating >= starRating;
    const isPartiallyFilled = rating > starIndex && rating < starRating;
    
    return (
      <button
        key={starIndex}
        type="button"
        onClick={() => handleStarClick(starRating)}
        disabled={!interactive}
        className={cn(
          "relative focus:outline-none",
          interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default",
          className
        )}
      >
        <ApperIcon 
          name="Star" 
          size={size}
          className={cn(
            "transition-colors",
            isFilled || isPartiallyFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )}
        />
        {isPartiallyFilled && (
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${(rating - starIndex) * 100}%` }}
          >
            <ApperIcon 
              name="Star" 
              size={size}
              className="text-yellow-400 fill-yellow-400"
            />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;