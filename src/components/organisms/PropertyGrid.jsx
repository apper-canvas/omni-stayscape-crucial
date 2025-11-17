import React from "react";
import { cn } from "@/utils/cn";
import PropertyCard from "@/components/molecules/PropertyCard";

const PropertyGrid = ({ 
  properties, 
  className, 
  onEditProperty, 
  onDeleteProperty, 
  showActions = false 
}) => {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      className
    )}>
      {properties.map((property) => (
        <PropertyCard
          key={property.Id}
          property={property}
          showActions={showActions}
          onEdit={() => onEditProperty && onEditProperty(property)}
          onDelete={() => onDeleteProperty && onDeleteProperty(property.Id)}
          className="h-full"
        />
      ))}
    </div>
  );
};

export default PropertyGrid;