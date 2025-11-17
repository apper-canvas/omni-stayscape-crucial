import React, { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search properties...", 
  className,
  debounceMs = 300 
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, onSearch, debounceMs]);

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <ApperIcon 
          name="Search" 
          className="h-5 w-5 text-gray-400" 
        />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg",
          "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          "placeholder-gray-400 font-body text-gray-900",
          "transition-all duration-200 shadow-sm",
          "bg-white hover:shadow-md"
        )}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
        >
          <ApperIcon name="X" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;