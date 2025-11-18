import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import PropertyGrid from "@/components/organisms/PropertyGrid";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { propertyService } from "@/services/api/propertyService";

const BrowseProperties = () => {
const { searchQuery } = useOutletContext();
const [properties, setProperties] = useState([]);
const [filteredProperties, setFilteredProperties] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

// Filter states
const [filters, setFilters] = useState({
  location: "",
  guests: "",
  priceMin: "",
  priceMax: "",
  propertyType: "",
  minBedrooms: ""
});

const loadProperties = async () => {
  setLoading(true);
  setError("");
  
  try {
    const data = await propertyService.getAll();
    setProperties(data);
    setFilteredProperties(data);
  } catch (err) {
    setError(err.message || "Failed to load properties");
    toast.error("Failed to load properties");
  } finally {
    setLoading(false);
  }
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
      minBedrooms: filters.minBedrooms ? parseInt(filters.minBedrooms) : null
    });
    setFilteredProperties(results);
  } catch (err) {
    toast.error("Filter failed");
  }
};

const handleFilterChange = (key, value) => {
  setFilters(prev => ({
    ...prev,
    [key]: value
  }));
};

const clearFilters = () => {
  setFilters({
    location: "",
    guests: "",
    priceMin: "",
    priceMax: "",
    propertyType: "",
    minBedrooms: ""
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
        onAction={() => window.location.reload()}
      />
    );
  }

  if (filteredProperties.length === 0 && searchQuery) {
    return (
      <Empty
        variant="properties"
        title="No properties found"
        message={`We couldn't find any properties matching "${searchQuery}". Try different search terms or browse all properties.`}
        actionLabel="Clear Search"
        onAction={() => handleSearch("")}
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
        {searchQuery 
          ? `${filteredProperties.length} properties found for "${searchQuery}"`
          : `${filteredProperties.length} properties available`
        }
      </p>
    </div>
  </div>

  {/* Search and Filter Controls */}
  {!searchQuery && (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
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

      {/* Clear Filters Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="text-sm"
        >
          <ApperIcon name="X" size={16} className="mr-2" />
          Clear Filters
        </Button>
      </div>
    </div>
  )}

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
    </div>
  );
};

export default BrowseProperties;