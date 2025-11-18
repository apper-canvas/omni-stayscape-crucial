import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reviewService } from '@/services/api/reviewService';
import ApperIcon from '@/components/ApperIcon';
import StarRating from '@/components/molecules/StarRating';
import ReviewCard from '@/components/molecules/ReviewCard';
import ReviewForm from '@/components/organisms/ReviewForm';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import { cn } from '@/utils/cn';

const GuestProfile = () => {
  const { guestName } = useParams();
  const navigate = useNavigate();
  const decodedGuestName = decodeURIComponent(guestName);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [averageRating, setAverageRating] = useState({ overall: 0, categories: {}, reviewCount: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  useEffect(() => {
    loadGuestData();
  }, [decodedGuestName]);

  const loadGuestData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [guestReviews, ratingData] = await Promise.all([
        reviewService.getByGuestName(decodedGuestName),
        Promise.resolve(reviewService.getGuestAverageRating(decodedGuestName))
      ]);
      
      setReviews(guestReviews);
      setAverageRating(ratingData);
    } catch (err) {
      console.error("Failed to load guest data:", err);
      setError(err.message || "Failed to load guest profile");
      toast.error("Failed to load guest profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setReviewSubmitLoading(true);
      
      await reviewService.createGuestReview({
        ...reviewData,
        guestName: decodedGuestName
      });
      
      toast.success("Guest review submitted successfully!");
      setShowReviewForm(false);
      await loadGuestData(); // Reload to show new review
      
    } catch (error) {
      console.error("Failed to submit guest review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      // In a real app, this would make an API call
      toast.success("Thanks for your feedback!");
    } catch (error) {
      console.error("Failed to mark review as helpful:", error);
      toast.error("Failed to update review");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRetry={loadGuestData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
            Back
          </Button>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {decodedGuestName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
                    {decodedGuestName}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <StarRating rating={averageRating.overall} size={20} />
                      <span className="text-lg font-semibold text-gray-900">
                        {averageRating.overall > 0 ? averageRating.overall.toFixed(1) : "New"}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {averageRating.reviewCount} {averageRating.reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Add Review Button - Only shown to hosts who have hosted this guest */}
              <div className="mt-6 md:mt-0">
                <Button
                  onClick={() => setShowReviewForm(true)}
                  variant="primary"
                  className="px-6 py-3"
                >
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Write Review
                </Button>
              </div>
            </div>

            {/* Category Ratings */}
            {averageRating.reviewCount > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Ratings</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(averageRating.categories).map(([category, rating]) => (
                    <div key={category} className="text-center">
                      <div className="text-2xl font-bold text-primary-600 mb-1">
                        {rating > 0 ? rating.toFixed(1) : '-'}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <Card className="mb-8 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Write a Guest Review</h2>
              <Button
                onClick={() => setShowReviewForm(false)}
                variant="ghost"
                size="sm"
              >
                <ApperIcon name="X" size={16} />
              </Button>
            </div>
            <ReviewForm
              onSubmit={handleSubmitReview}
              loading={reviewSubmitLoading}
              reviewType="guest"
              guestName={decodedGuestName}
            />
          </Card>
        )}

        {/* Reviews Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-display text-gray-900">
              Host Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
          </div>

          {reviews.length === 0 ? (
            <Empty
              title="No Reviews Yet"
              description="This guest hasn't received any reviews from hosts yet."
              icon="MessageSquare"
            />
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.Id}
                  review={review}
                  onMarkHelpful={handleMarkHelpful}
                  reviewType="guest"
                  className="bg-white"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestProfile;