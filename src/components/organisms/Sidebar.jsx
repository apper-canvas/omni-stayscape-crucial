import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import NavItem from "@/components/molecules/NavItem";

const Sidebar = ({ className }) => {
  const navigate = useNavigate();
  const navigation = [
    { name: "Browse Properties", href: "", icon: "Search" },
    { name: "My Listings", href: "my-listings", icon: "Building" },
    { name: "My Bookings", href: "my-bookings", icon: "Calendar" },
  ];

  return (
    <nav className={cn("bg-white border-r border-gray-200 shadow-sm", className)}>
      <div className="p-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 mb-8">
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

        {/* Navigation */}
        <div className="space-y-2">
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              to={item.href}
              icon={item.icon}
              label={item.name}
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

        {/* Help Section */}
        <div className="mt-8 p-4 bg-gradient-to-br from-secondary-50 to-accent-50 rounded-xl border border-secondary-100">
          <div className="flex items-center mb-3">
            <ApperIcon name="HelpCircle" className="h-5 w-5 text-secondary-600 mr-2" />
            <h4 className="text-sm font-semibold text-gray-900 font-display">Need Help?</h4>
          </div>
          <p className="text-xs text-gray-600 font-body mb-3">
            Get support or learn how to maximize your rental income.
          </p>
          <button className="w-full px-3 py-2 bg-gradient-to-r from-secondary-400 to-secondary-500 text-white text-xs font-medium rounded-lg hover:from-secondary-500 hover:to-secondary-600 transition-colors font-body">
            Contact Support
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;