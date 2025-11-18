import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { messageService } from "@/services/api/messageService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
const Header = ({ onSearch, onMobileMenuToggle, className }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await messageService.getTotalUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    
    // Set up polling for unread count updates
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={cn("bg-white border-b border-gray-200 shadow-sm", className)}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name="Menu" className="h-6 w-6" />
          </button>

          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                <ApperIcon name="Home" className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display gradient-text">
                  StayScape
                </h1>
                <p className="text-sm text-gray-600 font-body hidden sm:block">
                  Vacation Rentals
                </p>
              </div>
            </div>
          </div>

{/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <SearchBar
              onSearch={onSearch}
              placeholder="Search destinations, properties..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "transition-all duration-300",
                isSearchFocused && "transform scale-105"
              )}
            />
          </div>

{/* User Actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/messages')}
              className="relative hidden sm:flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-body"
            >
              <ApperIcon name="MessageCircle" className="h-5 w-5 mr-2" />
              Messages
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold min-w-[20px] h-5 rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <button className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors font-body">
              <ApperIcon name="Heart" className="h-5 w-5 mr-2" />
              Favorites
            </button>
            <button className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-body">
              <ApperIcon name="User" className="h-5 w-5 mr-2" />
              Profile
            </button>
            <button className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <ApperIcon name="Search" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-4">
          <SearchBar
            onSearch={onSearch}
            placeholder="Search properties..."
            className="w-full"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;