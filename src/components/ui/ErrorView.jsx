import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const ErrorView = ({ 
  className, 
  title = "Something went wrong", 
  message = "We're having trouble loading this content. Please try again.",
  onRetry,
  showRetry = true
}) => {
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center p-6", className)}>
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
          <ApperIcon name="AlertTriangle" className="h-8 w-8 text-red-600" />
        </div>
        
        {/* Error Title */}
        <h3 className="text-xl font-semibold font-display text-gray-900 mb-3">
          {title}
        </h3>
        
        {/* Error Message */}
        <p className="text-gray-600 font-body mb-6 leading-relaxed">
          {message}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && onRetry && (
            <Button 
              onClick={onRetry}
              variant="primary"
              className="flex items-center justify-center"
            >
              <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center justify-center"
          >
            <ApperIcon name="RotateCcw" className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
        
        {/* Contact Support */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 font-body mb-3">
            Still having issues? We're here to help.
          </p>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center justify-center mx-auto"
          >
            <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorView;