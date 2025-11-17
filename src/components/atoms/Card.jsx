import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({
  className,
  variant = "default",
  hoverable = false,
  children,
  ...props
}, ref) => {
  const variants = {
    default: "bg-white border border-gray-200 shadow-md",
    elevated: "bg-white border-0 shadow-lg",
    glass: "bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl",
    gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-lg"
  };

  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-200",
        variants[variant],
        hoverable && "hover:shadow-xl hover:scale-[1.02] cursor-pointer",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;