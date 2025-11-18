import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { wishlistService } from "@/services/api/wishlistService";
import { propertyService } from "@/services/api/propertyService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import PropertyCard from "@/components/molecules/PropertyCard";

const MyWishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load wishlist and property data
  const loadWishlistData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [wishlistData, propertiesData] = await Promise.all([
        wishlistService.getAll(),
        propertyService.getAll()
      ]);
      
      setWishlist(wishlistData);
      setProperties(propertiesData);
    } catch (err) {
      setError(err.message || "Failed to load wishlist");
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  // Get property details for wishlist item
  const getPropertyById = (propertyId) => {
    return properties.find(property => property.Id === propertyId);
  };

  // Get wishlist properties with property details
  const getWishlistProperties = () => {
    return wishlist.map(wishlistItem => {
      const property = getPropertyById(wishlistItem.propertyId);
      return property ? { ...property, wishlistId: wishlistItem.Id } : null;
    }).filter(Boolean);
  };

  // Remove property from wishlist
  const handleRemoveFromWishlist = async (propertyId) => {
    try {
      await wishlistService.removeByPropertyId(propertyId);
      setWishlist(prev => prev.filter(item => item.propertyId !== propertyId));
      toast.success("Property removed from wishlist");
    } catch (error) {
      toast.error(error.message || "Failed to remove from wishlist");
    }
  };

  // Clear entire wishlist
  const handleClearWishlist = async () => {
    if (wishlist.length === 0) return;
    
    if (confirm(`Remove all ${wishlist.length} properties from your wishlist?`)) {
      try {
        await wishlistService.clear();
        setWishlist([]);
        toast.success("Wishlist cleared successfully");
      } catch (error) {
        toast.error(error.message || "Failed to clear wishlist");
      }
    }
  };

  useEffect(() => {
    loadWishlistData();
  }, []);

  if (loading) {
    return <Loading variant="grid" />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load wishlist"
        message={error}
        onRetry={loadWishlistData}
      />
    );
  }

  const wishlistProperties = getWishlistProperties();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-6 p-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
            <ApperIcon name="Heart" className="w-16 h-16 text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-display text-gray-900">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-600 font-body max-w-md mx-auto">
              Start exploring amazing properties and save your favorites by clicking the heart icon on any property card.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => navigate("/")}
              className="min-w-[160px]"
            >
              <ApperIcon name="Search" className="h-4 w-4 mr-2" />
              Browse Properties
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/my-listings")}
              className="min-w-[160px]"
            >
              <ApperIcon name="Building" className="h-4 w-4 mr-2" />
              My Listings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-text">
            My Wishlist
          </h1>
          <p className="text-gray-600 font-body mt-2">
            {wishlist.length} saved {wishlist.length === 1 ? "property" : "properties"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="sm:w-auto"
          >
            <ApperIcon name="Search" className="h-4 w-4 mr-2" />
            Browse More
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearWishlist}
            disabled={wishlist.length === 0}
            className="sm:w-auto"
          >
            <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-red-500 rounded-xl">
              <ApperIcon name="Heart" className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-red-600 font-body">Total Saved</span>
          </div>
          <div className="text-2xl font-bold text-red-800 font-display">
            {wishlist.length}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-500 rounded-xl">
              <ApperIcon name="MapPin" className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-600 font-body">Locations</span>
          </div>
          <div className="text-2xl font-bold text-blue-800 font-display">
            {new Set(wishlistProperties.map(p => p.location.split(",")[0])).size}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-500 rounded-xl">
              <ApperIcon name="DollarSign" className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600 font-body">Avg. Price</span>
          </div>
          <div className="text-2xl font-bold text-green-800 font-display">
            ${Math.round(wishlistProperties.reduce((sum, p) => sum + p.pricePerNight, 0) / wishlistProperties.length)}
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-display text-gray-900">
            Saved Properties
          </h2>
          <div className="text-sm text-gray-500 font-body">
            {wishlistProperties.length} of {wishlist.length} properties loaded
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProperties.map((property) => (
            <div key={property.Id} className="relative group">
              <PropertyCard
                property={property}
                className="h-full"
              />
              
              {/* Quick Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFromWishlist(property.Id);
                }}
                className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 z-30"
                title="Remove from wishlist"
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Browse More Section */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <ApperIcon name="Search" className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold font-display text-gray-900">
              Discover More Properties
            </h3>
            <p className="text-gray-600 font-body">
              Find your next perfect getaway from thousands of unique accommodations.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/")}
            className="min-w-[200px]"
          >
            <ApperIcon name="Search" className="h-4 w-4 mr-2" />
            Explore Properties
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyWishlist;