import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const NavItem = ({ to, icon, label, className }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200",
          "hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          isActive
            ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border-l-4 border-primary-500 shadow-sm"
            : "text-gray-700 hover:shadow-sm",
          className
        )
      }
    >
      <ApperIcon name={icon} className="h-5 w-5 mr-3 flex-shrink-0" />
      <span className="font-body">{label}</span>
    </NavLink>
  );
};

export default NavItem;