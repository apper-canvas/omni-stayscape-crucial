import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(({
  className,
  label,
  error,
  required = false,
  children,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm",
          "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          "font-body text-gray-900 bg-white",
          "transition-all duration-200",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-body">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;