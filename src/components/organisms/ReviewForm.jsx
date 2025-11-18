import React, { useState } from "react";
import StarRating from "@/components/molecules/StarRating";
import Button from "@/components/atoms/Button";
import TextArea from "@/components/atoms/TextArea";
import { cn } from "@/utils/cn";

const ReviewForm = ({ onSubmit, loading = false, className = "" }) => {
  const [formData, setFormData] = useState({
    overallRating: 0,
    categoryRatings: {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      value: 0
    },
    reviewText: "",
    guestName: "John Doe" // In real app, this would come from auth
  });

  const [errors, setErrors] = useState({});

  const categoryLabels = {
    cleanliness: "Cleanliness",
    accuracy: "Accuracy",
    communication: "Communication", 
    location: "Location",
    value: "Value"
  };

  const handleOverallRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, overallRating: rating }));
    if (errors.overallRating) {
      setErrors(prev => ({ ...prev, overallRating: null }));
    }
  };

  const handleCategoryRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      categoryRatings: {
        ...prev.categoryRatings,
        [category]: rating
      }
    }));
  };

  const handleTextChange = (e) => {
    setFormData(prev => ({ ...prev, reviewText: e.target.value }));
    if (errors.reviewText) {
      setErrors(prev => ({ ...prev, reviewText: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.overallRating === 0) {
      newErrors.overallRating = "Please select an overall rating";
    }
    
    if (!formData.reviewText.trim()) {
      newErrors.reviewText = "Please write a review";
    } else if (formData.reviewText.trim().length < 10) {
      newErrors.reviewText = "Review must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Overall Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating *
        </label>
        <StarRating 
          rating={formData.overallRating}
          interactive={true}
          onRatingChange={handleOverallRatingChange}
          size={24}
          className="mb-1"
        />
        {errors.overallRating && (
          <p className="text-sm text-red-600">{errors.overallRating}</p>
        )}
      </div>

      {/* Category Ratings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Rate by Category
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryLabels).map(([category, label]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{label}</span>
              <StarRating 
                rating={formData.categoryRatings[category]}
                interactive={true}
                onRatingChange={(rating) => handleCategoryRatingChange(category, rating)}
                size={18}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Write Your Review *
        </label>
        <TextArea
          value={formData.reviewText}
          onChange={handleTextChange}
          placeholder="Share your experience with this property..."
          rows={4}
          className={cn(
            "w-full",
            errors.reviewText && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
        />
        {errors.reviewText && (
          <p className="text-sm text-red-600 mt-1">{errors.reviewText}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {formData.reviewText.length} characters
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="px-6 py-2"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;