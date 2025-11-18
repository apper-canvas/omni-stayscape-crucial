import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import PropertyCard from "@/components/molecules/PropertyCard";

const PropertyGrid = ({ 
  properties = [], 
  className,
  showActions = false, 
  onEditProperty = null, 
  onDeleteProperty = null,
  onManageAvailability = null 
}) => {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      className
    )}>
      {properties.map((property) => (
        <PropertyCard
          key={property.Id}
          property={property}
          showActions={showActions}
          onEdit={() => onEditProperty && onEditProperty(property)}
          onDelete={() => onDeleteProperty && onDeleteProperty(property.Id)}
          onManageAvailability={() => onManageAvailability && onManageAvailability(property)}
          className="h-full"
        />
      ))}
    </div>
  );
};

export default PropertyGrid;