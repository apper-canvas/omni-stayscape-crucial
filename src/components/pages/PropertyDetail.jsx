import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { bookingService } from "@/services/api/bookingService";
import { reviewService } from "@/services/api/reviewService";
import { propertyService } from "@/services/api/propertyService";
import ApperIcon from "@/components/ApperIcon";
import StarRating from "@/components/molecules/StarRating";
import ReviewCard from "@/components/molecules/ReviewCard";
import AvailabilityCalendar from "@/components/molecules/AvailabilityCalendar";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import ReviewForm from "@/components/organisms/ReviewForm";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    guestName: "John Doe"
  });
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Review-related state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
const [canWriteReview, setCanWriteReview] = useState(false);
  
  const loadProperty = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await propertyService.getById(id);
      setProperty(data);
    } catch (err) {
      setError(err.message || "Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const propertyReviews = await reviewService.getByPropertyId(id);
      setReviews(propertyReviews);
      
      // Check if current user can write a review (simplified logic)
      const completedBookings = await bookingService.getByPropertyId(id);
      const userCompletedBookings = completedBookings.filter(
        booking => booking.guestName === "John Doe" && booking.status === "confirmed"
      );
      setCanWriteReview(userCompletedBookings.length > 0);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    setReviewSubmitLoading(true);
    try {
      await reviewService.create({
        ...reviewData,
        propertyId: parseInt(id),
        guestId: "guest001" // In real app, this would come from auth
      });
      
      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      setCanWriteReview(false);
      loadReviews(); // Reload reviews to show new one
    } catch (err) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewService.markHelpful(reviewId);
      loadReviews(); // Reload to show updated helpful count
      toast.success("Thank you for your feedback!");
    } catch (err) {
      toast.error("Failed to mark review as helpful");
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    
    if (!bookingData.guestName.trim()) {
      toast.error("Please enter guest name");
      return;
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    // Check availability before booking
    try {
      const isAvailable = await propertyService.isDateRangeAvailable(
        property.Id, 
        bookingData.checkIn, 
        bookingData.checkOut
      );
      
      if (!isAvailable) {
        toast.error("Selected dates are not available. Please choose different dates.");
        return;
      }
    } catch (error) {
      toast.error("Unable to verify availability. Please try again.");
      return;
}
    
    const totalPrice = nights * property.pricePerNight;

    setBookingLoading(true);
    try {
      const booking = await bookingService.create({
        propertyId: property.Id.toString(),
        guestName: bookingData.guestName,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: parseInt(bookingData.guests),
        totalPrice: totalPrice,
        specialRequests: bookingData.specialRequests || ""
      });

      if (booking) {
        // Mark dates as booked in availability calendar
        await propertyService.markDatesAsBooked(
          property.Id,
          bookingData.checkIn,
          bookingData.checkOut
        );
        
        toast.success("Booking created successfully!");
        setBookingData({
          checkIn: "",
          checkOut: "",
          guests: 1,
          guestName: "John Doe"
        });
      }
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    return Math.max(0, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * (property?.pricePerNight || 0);
  };

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
);
  }
};

useEffect(() => {
  loadProperty();
}, [id]);

useEffect(() => {
    loadReviews();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorView
        title="Property not found"
        message={error}
        onRetry={loadProperty}
      />
    );
  }

  if (!property) {
    return (
      <ErrorView
        title="Property not found"
        message="The property you're looking for doesn't exist or has been removed."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-primary-600 hover:text-primary-700 font-medium font-body"
      >
        <ApperIcon name="ArrowLeft" className="h-5 w-5 mr-2" />
        Back to Properties
      </button>

      {/* Property Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
<div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-gray-900">
              {property.title}
            </h1>
            
            {/* Rating Summary */}
            {(() => {
              const ratingData = reviewService.getAverageRating(property.Id);
              return ratingData.reviewCount > 0 && (
                <div className="flex items-center space-x-4 mt-3">
                  <StarRating rating={ratingData.overall} size={20} />
                  <span className="text-lg font-semibold text-gray-900">
                    {ratingData.overall}
                  </span>
                  <span className="text-gray-600">
                    ({ratingData.reviewCount} review{ratingData.reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>
              );
            })()}
            
            <p className="text-lg text-gray-600 font-body flex items-center mt-2">
              <ApperIcon name="MapPin" className="h-5 w-5 mr-2 text-gray-400" />
              {property.location}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-display gradient-text">
              ${property.pricePerNight}
            </div>
            <div className="text-gray-600 font-body">per night</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="secondary" size="md">
            <ApperIcon name="Home" className="h-4 w-4 mr-1" />
            {property.propertyType}
          </Badge>
          <div className="flex items-center space-x-6 text-gray-600 font-body">
            <div className="flex items-center">
              <ApperIcon name="Users" className="h-5 w-5 mr-2" />
              {property.maxGuests} guests
            </div>
            <div className="flex items-center">
              <ApperIcon name="Bed" className="h-5 w-5 mr-2" />
              {property.bedrooms} bedrooms
            </div>
            <div className="flex items-center">
              <ApperIcon name="Bath" className="h-5 w-5 mr-2" />
              {property.bathrooms} bathrooms
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <div className="aspect-[16/10] relative">
          <img
            src={property.images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <ApperIcon name="ChevronLeft" className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <ApperIcon name="ChevronRight" className="h-6 w-6 text-gray-700" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex 
                        ? "bg-white" 
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold font-display text-gray-900 mb-4">
              About this place
            </h2>
            <p className="text-gray-700 font-body leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold font-display text-gray-900 mb-6">
              What this place offers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors">
                  <ApperIcon name="Check" className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span className="font-body text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
</div>
          
          {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-2xl font-bold font-display gradient-text">
                      ${property.pricePerNight}
                    </div>
                    <div className="text-gray-600 font-body">per night</div>
                  </div>
                  <Badge variant="success" size="sm">
                    Available
                  </Badge>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={bookingData.checkIn}
                        onChange={(e) => setBookingData(prev => ({
                          ...prev,
                          checkIn: e.target.value
                        }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-body"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) => setBookingData(prev => ({
                          ...prev,
                          checkOut: e.target.value
                        }))}
                        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-body"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
                      Guests
                    </label>
                    <select
                      value={bookingData.guests}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        guests: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-body"
                    >
                      {Array.from({ length: property.maxGuests }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} guest{i > 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
                      Guest Name
                    </label>
                    <input
                      type="text"
                      value={bookingData.guestName}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        guestName: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-body"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  {calculateNights() > 0 && (
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600 font-body">
                        <span>${property.pricePerNight} × {calculateNights()} nights</span>
                        <span>${(property.pricePerNight * calculateNights()).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900 font-body text-lg">
                        <span>Total</span>
                        <span>${calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={bookingLoading || calculateNights() <= 0}
                  >
                    {bookingLoading ? (
                      <>
                        <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
                        Reserve Now
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4 font-body">
                  You won't be charged yet. This is a booking request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Calendar */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-display text-gray-900 mb-6">
          Availability Calendar
        </h2>
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <AvailabilityCalendar
            propertyId={property.Id}
            mode="view"
            onDateSelect={(date) => {
              const dateStr = date.toISOString().split('T')[0];
              if (!bookingData.checkIn || bookingData.checkOut) {
                setBookingData(prev => ({ 
                  ...prev, 
                  checkIn: dateStr, 
                  checkOut: "" 
                }));
              } else {
                setBookingData(prev => ({ 
                  ...prev, 
                  checkOut: dateStr 
                }));
              }
            }}
          />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display text-gray-900">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            {canWriteReview && !showReviewForm && (
              <Button 
                onClick={() => setShowReviewForm(true)}
                variant="primary"
              >
                Write a Review
              </Button>
            )}
          </div>

          {/* Rating Breakdown */}
          {(() => {
            const ratingData = reviewService.getAverageRating(property.Id);
            return ratingData.reviewCount > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Overall Rating</h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl font-bold text-gray-900">
                        {ratingData.overall}
                      </div>
                      <div>
                        <StarRating rating={ratingData.overall} size={24} />
                        <p className="text-sm text-gray-600 mt-1">
                          Based on {ratingData.reviewCount} review{ratingData.reviewCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
                    <div className="space-y-2">
                      {Object.entries(ratingData.categories).map(([category, rating]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize w-24">
                            {category}
                          </span>
                          <div className="flex items-center space-x-2 flex-1">
                            <StarRating rating={rating} size={14} />
                            <span className="text-sm font-medium w-8">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Write Your Review</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                  >
                    <ApperIcon name="X" size={18} />
                  </Button>
                </div>
                <ReviewForm
                  onSubmit={handleReviewSubmit}
                  loading={reviewSubmitLoading}
                />
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <Loading />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.Id}
                  review={review}
                  onMarkHelpful={handleMarkHelpful}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ApperIcon name="MessageSquare" size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">Be the first to share your experience with this property!</p>
            </div>
          )}
        </div>
</div>
    </div>
  );
};

export default PropertyDetail;