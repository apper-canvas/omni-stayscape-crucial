import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import NavItem from "@/components/molecules/NavItem";

const Sidebar = ({ isOpen, className }) => {
const navigationItems = [
    { to: "", icon: "Home", label: "Browse Properties" },
    { to: "my-wishlist", icon: "Heart", label: "My Wishlist" },
    { to: "my-listings", icon: "Building", label: "My Listings" },
    { to: "booking-requests", icon: "Calendar", label: "Booking Requests" },
    { to: "my-bookings", icon: "CreditCard", label: "My Bookings" }
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ease-in-out overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:top-0 lg:h-full",
        className
      )}
    >
      <div className="p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </nav>

        {/* Additional Navigation Sections */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider font-body">
            Management
          </div>
<nav className="mt-3 space-y-1">
            <NavItem
              to="analytics"
              icon="BarChart3"
              label="Analytics"
              className="text-sm"
            />
            <NavItem
              to="availability"
              icon="Calendar"
              label="Availability"
              className="text-sm"
            />
            <NavItem
              to="earnings"
              icon="DollarSign"
              label="Earnings"
              className="text-sm"
            />
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider font-body">
            Account
          </div>
          <nav className="mt-3 space-y-1">
            <NavItem
              to="profile"
              icon="User"
              label="Profile"
              className="text-sm"
            />
            <NavItem
              to="settings"
              icon="Settings"
              label="Settings"
              className="text-sm"
            />
            <NavItem
              to="support"
              icon="HelpCircle"
              label="Support"
              className="text-sm"
            />
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;