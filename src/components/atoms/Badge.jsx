import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({
  className,
  variant = "primary",
  size = "sm",
  children,
  ...props
}, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-200",
    secondary: "bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800 border border-secondary-200",
    accent: "bg-gradient-to-r from-accent-100 to-accent-200 text-accent-800 border border-accent-200",
    success: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200",
    warning: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200",
    error: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200",
    neutral: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200"
  };

  const sizes = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-2.5 py-1 text-sm",
    md: "px-3 py-1.5 text-base"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium font-body",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;