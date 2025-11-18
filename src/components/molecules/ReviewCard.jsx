import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import StarRating from "@/components/molecules/StarRating";
import Button from "@/components/atoms/Button";

const ReviewCard = ({ review, onMarkHelpful, className = "", reviewType = "property" }) => {
  const navigate = useNavigate();
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleMarkHelpful = () => {
    if (onMarkHelpful) {
      onMarkHelpful(review.Id);
    }
  };

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6 space-y-4", className)}>
{/* Header with guest/host info and overall rating */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
            {reviewType === "guest" 
              ? (review.hostName || "Host").charAt(0)
              : (review.guestName || "Guest").charAt(0)
            }
          </div>
          <div>
            {reviewType === "guest" ? (
              <h4 className="font-semibold text-gray-900">{review.hostName || "Host"}</h4>
            ) : (
              <button
                onClick={() => navigate(`/guest-profile/${encodeURIComponent(review.guestName)}`)}
                className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
              >
                {review.guestName}
              </button>
            )}
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.overallRating} size={16} />
      </div>

      {/* Category ratings */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(review.categoryRatings).map(([category, rating]) => (
          <div key={category} className="flex flex-col space-y-1">
            <span className="text-xs font-medium text-gray-600 capitalize">
              {category}
            </span>
            <StarRating rating={rating} size={12} />
          </div>
        ))}
      </div>

      {/* Review text */}
      <div className="pt-2">
        <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
      </div>

      {/* Helpful button */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkHelpful}
          className="text-gray-600 hover:text-primary-600 flex items-center space-x-2"
        >
          <ApperIcon name="ThumbsUp" size={14} />
          <span>Helpful</span>
          {review.helpfulCount > 0 && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {review.helpfulCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewCard;