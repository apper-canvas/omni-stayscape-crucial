import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(({
  className,
  type = "text",
  label,
  error,
  required = false,
  accept,
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
<input
        type={type}
        accept={accept}
        className={cn(
          "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm",
          "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          "placeholder-gray-400 font-body text-gray-900",
          "transition-all duration-200",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          type === "file" && "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 font-body">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;