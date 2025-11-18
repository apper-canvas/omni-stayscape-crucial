import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import NavItem from "@/components/molecules/NavItem";

const MobileSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const navigation = [
    { name: "Browse Properties", href: "", icon: "Search" },
    { name: "My Listings", href: "my-listings", icon: "Building" },
    { name: "My Bookings", href: "my-bookings", icon: "Calendar" },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                <ApperIcon name="Home" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display gradient-text">
                  StayScape
                </h1>
                <p className="text-sm text-gray-600 font-body">
                  Vacation Rentals
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name="X" className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-6">
            <div className="space-y-2">
              {navigation.map((item) => (
                <NavItem
                  key={item.name}
                  to={item.href}
                  icon={item.icon}
                  label={item.name}
                  className="w-full"
                />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 font-display mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
<button 
                  onClick={() => navigate('/my-listings')}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-lg transition-colors font-body cursor-pointer"
                >
                  <ApperIcon name="Plus" className="h-5 w-5 mr-3" />
                  Add Property
                </button>
                <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-body">
                  <ApperIcon name="MessageCircle" className="h-5 w-5 mr-3" />
                  Messages
                </button>
                <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-body">
                  <ApperIcon name="BarChart3" className="h-5 w-5 mr-3" />
                  Analytics
                </button>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 font-body">John Doe</p>
                <p className="text-xs text-gray-600 font-body">Host & Traveler</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;