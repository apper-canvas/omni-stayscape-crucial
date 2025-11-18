import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import StarRating from "@/components/molecules/StarRating";
import { reviewService } from "@/services/api/reviewService";
import { wishlistService } from "@/services/api/wishlistService";

const PropertyCard = ({ property, className, onEdit, onDelete, showActions = false }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/property/${property.Id}`);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

// Check wishlist status on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const inWishlist = await wishlistService.isInWishlist(property.Id);
        setIsInWishlist(inWishlist);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    if (property?.Id) {
      checkWishlistStatus();
    }
  }, [property?.Id]);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation(); // Prevent card click navigation
    
    if (wishlistLoading) return;
    
    setWishlistLoading(true);
    
    try {
      const result = await wishlistService.toggle(property.Id);
      setIsInWishlist(result.inWishlist);
      
      if (result.action === 'added') {
        toast.success(`${property.title} added to your wishlist!`);
      } else {
        toast.success(`${property.title} removed from your wishlist`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update wishlist');
      console.error('Wishlist toggle error:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Card 
      className={cn(
        "property-card overflow-hidden cursor-pointer group",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Property Image */}
<div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Wishlist Heart Button - Top Right */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 z-20",
            "hover:scale-110 active:scale-95",
            wishlistLoading && "opacity-50 cursor-not-allowed",
            isInWishlist 
              ? "bg-red-500/90 text-white shadow-lg hover:bg-red-600/90" 
              : "bg-white/90 text-gray-600 shadow-md hover:bg-white hover:text-red-500"
          )}
        >
          <ApperIcon 
            name={isInWishlist ? "Heart" : "Heart"} 
            className={cn(
              "h-5 w-5 transition-all duration-200",
              isInWishlist && "fill-current",
              wishlistLoading && "animate-pulse"
            )}
            fill={isInWishlist ? "currentColor" : "none"}
          />
        </button>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge variant="secondary" size="sm" className="backdrop-blur-sm">
            <ApperIcon name="MapPin" className="h-3 w-3 mr-1" />
            {property.location.split(",")[0]}
          </Badge>
          {property.instantBook && (
            <Badge variant="success" size="sm" className="backdrop-blur-sm bg-green-600 text-white border-green-600 font-medium">
              <ApperIcon name="Zap" className="h-3 w-3 mr-1" />
              Instant Book
            </Badge>
          )}
        </div>
        {showActions && (
          <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => handleActionClick(e, onEdit)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors"
            >
              <ApperIcon name="Edit" className="h-4 w-4 text-primary-600" />
            </button>
            <button
              onClick={(e) => handleActionClick(e, onDelete)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors"
            >
              <ApperIcon name="Trash2" className="h-4 w-4 text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Property Info */}
<div className="p-6">
        {/* Rating Display */}
        {(() => {
          const ratingData = reviewService.getAverageRating(property.Id);
          return ratingData.reviewCount > 0 ? (
            <div className="flex items-center justify-between mb-3">
              <StarRating rating={ratingData.overall} size={16} />
              <span className="text-sm text-gray-500">
                ({ratingData.reviewCount} review{ratingData.reviewCount !== 1 ? 's' : ''})
              </span>
            </div>
          ) : (
            <div className="flex items-center mb-3">
              <span className="text-sm text-gray-500">No reviews yet</span>
            </div>
          );
        })()}
        <div className="mb-3">
          <h3 className="text-xl font-semibold font-display text-gray-900 mb-2 line-clamp-2">
            {property.title}
          </h3>
          <p className="text-sm text-gray-600 font-body flex items-center">
            <ApperIcon name="MapPin" className="h-4 w-4 mr-1 text-gray-400" />
            {property.location}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600 font-body">
            <div className="flex items-center">
              <ApperIcon name="Users" className="h-4 w-4 mr-1" />
              {property.maxGuests} guests
            </div>
            <div className="flex items-center">
              <ApperIcon name="Bed" className="h-4 w-4 mr-1" />
              {property.bedrooms} beds
            </div>
            <div className="flex items-center">
              <ApperIcon name="Bath" className="h-4 w-4 mr-1" />
              {property.bathrooms} baths
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="neutral" size="xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="neutral" size="xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-display gradient-text">
              ${property.pricePerNight}
            </div>
            <div className="text-sm text-gray-600 font-body">per night</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;