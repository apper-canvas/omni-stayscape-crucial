import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  className,
  icon = "Home",
  title,
  message,
  actionLabel,
  onAction,
  variant = "default"
}) => {
  const variants = {
properties: {
      icon: "Search",
      title: "No properties found",
      message: "We couldn't find any properties matching your search criteria. Try adjusting your dates, location, or other filters.",
      actionLabel: "Clear Filters"
    },
    listings: {
      icon: "Building",
      title: "No listings yet",
      message: "Start earning by listing your first property. It's easy to get started and reach millions of travelers.",
      actionLabel: "Add Your First Property"
    },
    bookings: {
      icon: "Calendar",
      title: "No bookings yet",
      message: "Once guests start booking your properties or you make reservations, they'll appear here.",
      actionLabel: "Browse Properties"
    },
    default: {
      icon: icon,
      title: title || "Nothing to show",
      message: message || "There's no content available at the moment.",
      actionLabel: actionLabel || "Get Started"
    }
  };

  const config = variants[variant] || variants.default;

  return (
    <div className={cn("min-h-[400px] flex items-center justify-center p-6", className)}>
      <div className="text-center max-w-md">
        {/* Empty State Icon */}
        <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
          <ApperIcon name={config.icon} className="h-10 w-10 text-primary-600" />
        </div>
        
        {/* Empty State Title */}
        <h3 className="text-2xl font-semibold font-display text-gray-900 mb-3">
          {config.title}
        </h3>
        
        {/* Empty State Message */}
        <p className="text-gray-600 font-body mb-8 leading-relaxed">
          {config.message}
        </p>
        
        {/* Action Button */}
        {(onAction || config.actionLabel) && (
          <div className="space-y-4">
            <Button 
              onClick={onAction}
              variant="primary"
              className="flex items-center justify-center"
            >
              <ApperIcon 
                name={variant === "listings" ? "Plus" : "ArrowRight"} 
                className="h-4 w-4 mr-2" 
              />
              {config.actionLabel}
            </Button>
            
            {/* Secondary Actions */}
{variant === "properties" && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
                <Button variant="outline" size="sm" onClick={onAction}>
                  <ApperIcon name="RotateCcw" className="h-4 w-4 mr-2" />
                  {actionLabel || "Reset Search"}
                </Button>
                <Button variant="ghost" size="sm">
                  <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
                  Try Different Dates
                </Button>
                <Button variant="ghost" size="sm">
                  <ApperIcon name="MapPin" className="h-4 w-4 mr-2" />
                  Browse All Locations
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Additional Help */}
        {variant === "listings" && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-body mb-4">
              Need help getting started?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="ghost" size="sm">
                <ApperIcon name="BookOpen" className="h-4 w-4 mr-2" />
                Host Guide
              </Button>
              <Button variant="ghost" size="sm">
                <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
                Get Support
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Empty;