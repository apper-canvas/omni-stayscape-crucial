import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import PropertyGrid from "@/components/organisms/PropertyGrid";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { propertyService } from "@/services/api/propertyService";

const BrowseProperties = () => {
  const { searchQuery } = useOutletContext();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setFilteredProperties(properties);
      return;
    }

    try {
      const results = await propertyService.search(query);
      setFilteredProperties(results);
    } catch (err) {
      toast.error("Search failed");
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (searchQuery !== undefined) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, properties]);

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

      {/* Featured Properties Section */}
      {!searchQuery && (
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

      {/* All Properties */}
      <div>
        {!searchQuery && (
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
          properties={searchQuery ? filteredProperties : filteredProperties.slice(4)}
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