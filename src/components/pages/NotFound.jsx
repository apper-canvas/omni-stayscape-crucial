import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Illustration */}
        <div className="mb-8 relative">
          <div className="text-8xl md:text-9xl font-bold font-display gradient-text opacity-20">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-6 bg-white rounded-full shadow-xl border-4 border-primary-100">
              <ApperIcon name="Home" className="h-16 w-16 text-primary-600" />
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-gray-600 font-body max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to a new location.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            onClick={() => navigate("/")}
            variant="primary"
            size="lg"
            className="flex items-center justify-center"
          >
            <ApperIcon name="Home" className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="flex items-center justify-center"
          >
            <ApperIcon name="ArrowLeft" className="h-5 w-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Popular Destinations */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <h3 className="text-xl font-semibold font-display text-gray-900 mb-6">
            Popular Destinations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Browse Properties", icon: "Search", path: "/" },
              { name: "My Listings", icon: "Building", path: "/my-listings" },
              { name: "My Bookings", icon: "Calendar", path: "/my-bookings" },
              { name: "Help Center", icon: "HelpCircle", path: "/" }
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
              >
                <ApperIcon 
                  name={item.icon} 
                  className="h-8 w-8 text-gray-600 group-hover:text-primary-600 mx-auto mb-2" 
                />
                <p className="text-sm font-medium text-gray-700 group-hover:text-primary-700 font-body">
                  {item.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-body">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@stayscape.com" className="text-primary-600 hover:text-primary-700 font-medium">
              support@stayscape.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;