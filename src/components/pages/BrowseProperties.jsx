import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";
import { propertyService } from "@/services/api/propertyService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import PropertyGrid from "@/components/organisms/PropertyGrid";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
const BrowseProperties = () => {
const { searchQuery } = useOutletContext();
const [properties, setProperties] = useState([]);
const [filteredProperties, setFilteredProperties] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
const [mapZoom, setMapZoom] = useState(10);

// Filter states
const [filters, setFilters] = useState({
  location: "",
  guests: "",
  priceMin: "",
  priceMax: "",
  propertyType: "",
  minBedrooms: "",
  checkIn: "",
  checkOut: "",
  sortBy: "",
  selectedAmenities: []
});

// Amenities data structure with categories
const amenitiesData = {
  essential: {
    title: "Essential",
    icon: "Home",
    amenities: [
      { name: "WiFi", icon: "Wifi" },
      { name: "Kitchen", icon: "ChefHat" },
      { name: "Air Conditioning", icon: "Wind" },
      { name: "Heating", icon: "Flame" },
      { name: "Hot Water", icon: "Droplets" },
      { name: "Washer", icon: "WashingMachine" }
    ]
  },
  features: {
    title: "Features",
    icon: "Star",
    amenities: [
      { name: "Pool", icon: "Waves" },
      { name: "Gym", icon: "Dumbbell" },
      { name: "Spa", icon: "Sparkles" },
      { name: "Balcony", icon: "Building" },
      { name: "Garden", icon: "Trees" },
      { name: "Fireplace", icon: "Flame" }
    ]
  },
  location: {
    title: "Location",
    icon: "MapPin",
    amenities: [
      { name: "Beachfront", icon: "Waves" },
      { name: "City Center", icon: "Building2" },
      { name: "Mountain View", icon: "Mountain" },
      { name: "Lake Access", icon: "Lake" },
      { name: "Ski Access", icon: "Snowflake" },
      { name: "Pet Friendly", icon: "Heart" }
    ]
  },
  accessibility: {
    title: "Accessibility",
    icon: "Accessibility",
    amenities: [
      { name: "Wheelchair Accessible", icon: "Accessibility" },
      { name: "Step-Free Access", icon: "ArrowRight" },
      { name: "Wide Doorways", icon: "DoorOpen" },
      { name: "Accessible Bathroom", icon: "Bath" }
    ]
  }
};

const [expandedCategories, setExpandedCategories] = useState({});

const loadProperties = async () => {
  setLoading(true);
  setError("");
  
  try {
    const data = await propertyService.getAll();
    setProperties(data || []);
    setFilteredProperties(data || []);
    
    // Set map center to first property location if available
    if (data && data.length > 0 && data[0].location?.coordinates) {
      setMapCenter([data[0].location.coordinates.lat, data[0].location.coordinates.lng]);
    }
  } catch (err) {
    setError(err.message || "Failed to load properties");
    toast.error("Failed to load properties");
  } finally {
    setLoading(false);
  }
};

const handleFilterChange = (key, value) => {
  setFilters(prev => ({
    ...prev,
    [key]: value
  }));
};

const handleAmenityToggle = (amenityName) => {
  setFilters(prev => ({
    ...prev,
    selectedAmenities: prev.selectedAmenities.includes(amenityName)
      ? prev.selectedAmenities.filter(a => a !== amenityName)
      : [...prev.selectedAmenities, amenityName]
  }));
};

const handleSearch = async (query) => {
  if (!query.trim()) {
    applyFilters();
    return;
  }

  try {
    const results = await propertyService.search(query);
    setFilteredProperties(results);
  } catch (err) {
    toast.error("Search failed");
  }
};

const applyFilters = async () => {
  try {
const results = await propertyService.filter({
      location: filters.location,
      guests: filters.guests ? parseInt(filters.guests) : null,
      priceMin: filters.priceMin ? parseFloat(filters.priceMin) : null,
      priceMax: filters.priceMax ? parseFloat(filters.priceMax) : null,
      propertyType: filters.propertyType,
      minBedrooms: filters.minBedrooms ? parseInt(filters.minBedrooms) : null,
      checkIn: filters.checkIn || null,
      checkOut: filters.checkOut || null,
      sortBy: filters.sortBy || null,
      selectedAmenities: filters.selectedAmenities
    });
    setFilteredProperties(results);
  } catch (err) {
    toast.error("Search failed - please try again");
  }
};

const handleMapMove = async (bounds) => {
  // Search properties within map bounds
  try {
    const allProperties = await propertyService.getAll();
    const visibleProperties = allProperties.filter(property => {
      if (!property.location?.coordinates) return false;
      
      const lat = property.location.coordinates.lat;
      const lng = property.location.coordinates.lng;
      
      return lat >= bounds.getSouth() && 
             lat <= bounds.getNorth() && 
             lng >= bounds.getWest() && 
             lng <= bounds.getEast();
    });
    
    setFilteredProperties(visibleProperties);
    toast.info(`Found ${visibleProperties.length} properties in this area`);
  } catch (err) {
    toast.error("Failed to search area");
  }
};

const createPropertyIcon = (price) => {
  return divIcon({
    html: `
      <div class="bg-white border-2 border-primary-500 rounded-full px-3 py-1 shadow-lg font-bold text-sm text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer">
        $${price}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [60, 30],
    iconAnchor: [30, 30]
  });
};

const clearFilters = () => {
  setFilters({
    location: "",
    guests: "",
    priceMin: "",
    priceMax: "",
    propertyType: "",
    minBedrooms: "",
    checkIn: "",
    checkOut: "",
    sortBy: "",
    selectedAmenities: []
  });
};

useEffect(() => {
  loadProperties();
}, []);

useEffect(() => {
  if (searchQuery !== undefined) {
    handleSearch(searchQuery);
  } else {
    applyFilters();
  }
}, [searchQuery, properties, filters]);

  if (loading) {
    return <Loading variant="grid" />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load properties"
        message={error}
        onRetry={loadProperties}
      />
    );
  }

if (filteredProperties.length === 0 && properties.length === 0) {
    return (
      <Empty
        variant="properties"
        title="No properties available"
        message="We're currently updating our property listings. Please check back soon for amazing vacation rentals."
        actionLabel="Refresh Page"
        onAction={() => window.location.reload()}
      />
    );
  }

if (filteredProperties.length === 0 && (searchQuery || Object.values(filters).some(f => f))) {
    const hasDateFilter = filters.checkIn || filters.checkOut;
const hasOtherFilters = filters.location || filters.guests || filters.priceMin || filters.priceMax || filters.propertyType || filters.minBedrooms || filters.selectedAmenities.length > 0;
    
    let title = "No properties found";
    let message = "We couldn't find any properties matching your criteria.";
    
    if (searchQuery && hasDateFilter) {
      message = `No properties available for "${searchQuery}" during your selected dates. Try different dates or locations.`;
    } else if (searchQuery) {
      message = `No properties found for "${searchQuery}". Try different search terms or adjust your filters.`;
    } else if (hasDateFilter) {
      message = "No properties available for your selected dates. Try different dates or adjust other filters.";
    } else if (hasOtherFilters) {
      message = "No properties match your current filters. Try adjusting your search criteria.";
    }
    
    return (
      <Empty
        variant="properties"
        title={title}
        message={message}
        actionLabel={searchQuery ? "Clear Search" : "Clear Filters"}
        onAction={searchQuery ? () => handleSearch("") : clearFilters}
      />
    );
  }

return (
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold font-display gradient-text">
        Discover Amazing Places
      </h1>
      <p className="text-gray-600 font-body mt-2">
{(() => {
          const hasFilters = Object.values(filters).some(f => f);
          const sortLabel = filters.sortBy ? 
            ` (sorted by ${filters.sortBy === 'price_low' ? 'price: low to high' : 
            filters.sortBy === 'price_high' ? 'price: high to low' :
            filters.sortBy === 'rating' ? 'guest rating' : 'newest listings'})` : '';
          
          if (searchQuery && hasFilters) {
            return `${filteredProperties.length} properties found for "${searchQuery}" with filters${sortLabel}`;
          } else if (searchQuery) {
            return `${filteredProperties.length} properties found for "${searchQuery}"${sortLabel}`;
          } else if (hasFilters) {
            return `${filteredProperties.length} properties match your filters${sortLabel}`;
          } else {
            return `${filteredProperties.length} properties available${sortLabel}`;
          }
        })()}
      </p>
    </div>
    
    {/* View Toggle */}
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('list')}
        className="px-4 py-2"
      >
        <ApperIcon name="List" size={16} />
        <span className="ml-2 hidden sm:inline">List</span>
      </Button>
      <Button
        variant={viewMode === 'map' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('map')}
        className="px-4 py-2"
      >
        <ApperIcon name="Map" size={16} />
        <span className="ml-2 hidden sm:inline">Map</span>
      </Button>
    </div>
  </div>

  {/* Search and Filter Controls */}
  {!searchQuery && (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-4">
        {/* Location Search */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Location</label>
          <div className="relative">
            <ApperIcon name="MapPin" className="absolute left-3 top-3 text-gray-400" size={16} />
            <Input
              placeholder="Where to?"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Check-in Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Check-in</label>
          <div className="relative">
            <ApperIcon name="Calendar" className="absolute left-3 top-3 text-gray-400" size={16} />
            <Input
              type="date"
              value={filters.checkIn}
              onChange={(e) => handleFilterChange('checkIn', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="pl-10"
            />
          </div>
        </div>

        {/* Check-out Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Check-out</label>
          <div className="relative">
            <ApperIcon name="Calendar" className="absolute left-3 top-3 text-gray-400" size={16} />
            <Input
              type="date"
              value={filters.checkOut}
              onChange={(e) => handleFilterChange('checkOut', e.target.value)}
              min={filters.checkIn || new Date().toISOString().split('T')[0]}
              className="pl-10"
            />
          </div>
        </div>

        {/* Guest Count */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Guests</label>
          <div className="relative">
            <ApperIcon name="Users" className="absolute left-3 top-3 text-gray-400" size={16} />
            <Select
              value={filters.guests}
              onChange={(e) => handleFilterChange('guests', e.target.value)}
              className="pl-10"
            >
              <option value="">Any number</option>
              <option value="1">1 guest</option>
              <option value="2">2 guests</option>
              <option value="3">3 guests</option>
              <option value="4">4 guests</option>
              <option value="5">5 guests</option>
              <option value="6">6+ guests</option>
            </Select>
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Property Type</label>
          <div className="relative">
            <ApperIcon name="Home" className="absolute left-3 top-3 text-gray-400" size={16} />
            <Select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="pl-10"
            >
              <option value="">All types</option>
              <option value="Entire home">Entire home</option>
              <option value="Private room">Private room</option>
              <option value="Shared room">Shared room</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
            </Select>
          </div>
        </div>

        {/* Minimum Bedrooms */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Bedrooms</label>
          <div className="relative">
            <ApperIcon name="Bed" className="absolute left-3 top-3 text-gray-400" size={16} />
            <Select
              value={filters.minBedrooms}
              onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
              className="pl-10"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </Select>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Min Price</label>
          <div className="relative">
            <ApperIcon name="DollarSign" className="absolute left-3 top-3 text-gray-400" size={16} />
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Max Price</label>
          <div className="relative">
            <ApperIcon name="DollarSign" className="absolute left-3 top-3 text-gray-400" size={16} />
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Sort and Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        {/* Sort Options */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <div className="relative">
            <ApperIcon name="ArrowUpDown" className="absolute left-3 top-3 text-gray-400" size={16} />
            <Select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="pl-10 w-48"
            >
              <option value="">Default</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Guest Rating</option>
              <option value="newest">Newest Listings</option>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          onClick={clearFilters}
          className="text-sm"
        >
          <ApperIcon name="X" size={16} className="mr-2" />
          Clear All
        </Button>
</div>

      {/* Amenities Filter Section */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-3 mb-4">
          <ApperIcon name="Filter" className="text-gray-700" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 font-display">Filter by Amenities</h3>
          {filters.selectedAmenities.length > 0 && (
            <span className="text-sm text-primary-600 font-medium">
              ({filters.selectedAmenities.length} selected)
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(amenitiesData).map(([categoryKey, category]) => (
            <div key={categoryKey} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setExpandedCategories(prev => ({
                  ...prev,
                  [categoryKey]: !prev[categoryKey]
                }))}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ApperIcon name={category.icon} className="text-primary-600" size={20} />
                  <span className="font-medium text-gray-900">{category.title}</span>
                </div>
                <ApperIcon 
                  name={expandedCategories[categoryKey] ? "ChevronUp" : "ChevronDown"} 
                  className="text-gray-500" 
                  size={16} 
                />
              </button>
              
              {expandedCategories[categoryKey] && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {category.amenities.map((amenity) => (
                      <label
                        key={amenity.name}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.selectedAmenities.includes(amenity.name)}
                          onChange={() => handleAmenityToggle(amenity.name)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <ApperIcon name={amenity.icon} className="text-gray-600" size={16} />
                        <span className="text-sm text-gray-700 font-body">{amenity.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
</div>
      </div>
    </div>
  )}
{/* Map View */}
{viewMode === 'map' && (
  <div className="h-96 sm:h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      className="h-full w-full"
      whenCreated={(map) => {
        map.on('moveend', () => {
          const bounds = map.getBounds();
          handleMapMove(bounds);
        });
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filteredProperties.map((property) => {
        if (!property.location?.coordinates) return null;
        
        return (
          <Marker
            key={property.Id}
            position={[property.location.coordinates.lat, property.location.coordinates.lng]}
            icon={createPropertyIcon(property.pricePerNight)}
          >
            <Popup className="custom-popup">
              <div className="w-64 p-2">
                <div className="aspect-w-16 aspect-h-9 mb-3">
                  <img
                    src={property.images?.[0] || '/placeholder-property.jpg'}
                    alt={property.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <ApperIcon name="MapPin" size={14} />
                  <span>{property.location?.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Star" size={14} className="text-yellow-400" />
                    <span className="text-sm font-medium">
                      {property.averageRating || 'New'}
                    </span>
                  </div>
                  <div className="font-bold text-primary-600">
                    ${property.pricePerNight}/night
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => window.location.href = `/property/${property.Id}`}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  </div>
)}

{/* List View */}
{viewMode === 'list' && (
  <>
    {/* Featured Properties Section */}
    {!searchQuery && filteredProperties.length > 0 && Object.values(filters).every(f => !f) && (
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Featured Properties
          </h2>
          <p className="text-gray-600 font-body">
            Handpicked by our team for exceptional experiences
          </p>
        </div>
        <PropertyGrid 
          properties={filteredProperties.slice(0, 4)}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>
    )}

    {/* Instant Book Properties Section */}
    {!searchQuery && filteredProperties.length > 0 && Object.values(filters).every(f => !f) && (
      (() => {
        const instantBookProperties = filteredProperties.filter(p => p.instantBook);
        return instantBookProperties.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-display text-gray-900 mb-2 flex items-center justify-center gap-3">
                <ApperIcon name="Zap" className="h-6 w-6 text-green-600" />
                Instant Book Properties
              </h2>
              <p className="text-gray-600 font-body">
                Book immediately without waiting for host approval
              </p>
            </div>
            <PropertyGrid 
              properties={instantBookProperties.slice(0, 4)}
              className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            />
          </div>
        );
      })()
    )}

    {/* All Properties */}
    <div>
      {!searchQuery && Object.values(filters).every(f => !f) && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">
            All Properties
          </h2>
          <p className="text-gray-600 font-body">
            Browse through our complete collection of vacation rentals
          </p>
        </div>
      )}
      <PropertyGrid 
        properties={searchQuery ? filteredProperties : 
          (Object.values(filters).every(f => !f) ? filteredProperties.slice(4) : filteredProperties)}
      />
    </div>

    {/* Call to Action */}
    {!searchQuery && (
      <div className="bg-gradient-to-br from-accent-50 to-secondary-50 rounded-2xl p-8 text-center mt-12">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">
            Can't find what you're looking for?
          </h3>
          <p className="text-gray-600 font-body mb-6">
            Join thousands of hosts who are earning extra income by sharing their unique spaces with travelers from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-medium rounded-lg hover:from-accent-600 hover:to-accent-700 transition-all duration-200 font-body">
              List Your Property
            </button>
            <button className="px-8 py-3 border-2 border-primary-500 text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-all duration-200 font-body">
              Get Host Support
            </button>
          </div>
        </div>
      </div>
    )}
  </>
)}
</div>
);
};

export default BrowseProperties;