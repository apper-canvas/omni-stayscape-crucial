import React, { useEffect, useState } from "react";
import AvailabilityCalendar from "@/components/molecules/AvailabilityCalendar";
import { toast } from "react-toastify";
import { propertyService } from "@/services/api/propertyService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import PropertyGrid from "@/components/organisms/PropertyGrid";
import PropertyForm from "@/components/organisms/PropertyForm";
import Button from "@/components/atoms/Button";

const MyListings = () => {
const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const loadProperties = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await propertyService.getAll();
      // In a real app, you'd filter by host ID
      setProperties(data);
    } catch (err) {
      setError(err.message || "Failed to load your properties");
      toast.error("Failed to load your properties");
    } finally {
      setLoading(false);
    }
  };

const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleManageAvailability = (property) => {
    // Navigate to availability management or show modal
    setEditingProperty(property);
    setShowAvailabilityModal(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }

    try {
      await propertyService.delete(propertyId);
      setProperties(prev => prev.filter(p => p.Id !== propertyId));
      toast.success("Property deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete property");
    }
  };

  const handleSaveProperty = (savedProperty) => {
    if (editingProperty) {
      // Update existing property
      setProperties(prev => prev.map(p => 
        p.Id === savedProperty.Id ? savedProperty : p
      ));
    } else {
      // Add new property
      setProperties(prev => [savedProperty, ...prev]);
    }
    
    setShowForm(false);
    setEditingProperty(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProperty(null);
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowForm(true);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  if (loading) {
    return <Loading variant="grid" />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load your listings"
        message={error}
        onRetry={loadProperties}
      />
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display gradient-text">
              {editingProperty ? "Edit Property" : "Add New Property"}
            </h1>
            <p className="text-gray-600 font-body mt-2">
              {editingProperty 
                ? "Update your property details and amenities" 
                : "Create a new listing to start earning income"
              }
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleCancelForm}
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>
        </div>

        {/* Form */}
        <PropertyForm
          property={editingProperty}
          onSave={handleSaveProperty}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <Empty
        variant="listings"
        onAction={handleAddProperty}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-text">
            My Property Listings
          </h1>
          <p className="text-gray-600 font-body mt-2">
            Manage your {properties.length} property {properties.length === 1 ? "listing" : "listings"}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddProperty}
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl border border-primary-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary-500 rounded-lg">
              <ApperIcon name="Building" className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-primary-600 font-body">Total Listings</span>
          </div>
          <div className="text-2xl font-bold text-primary-800 font-display">{properties.length}</div>
        </div>

        <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-6 rounded-xl border border-secondary-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-secondary-500 rounded-lg">
              <ApperIcon name="Eye" className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-secondary-600 font-body">Total Views</span>
          </div>
          <div className="text-2xl font-bold text-secondary-800 font-display">2,847</div>
        </div>

        <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-6 rounded-xl border border-accent-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-accent-500 rounded-lg">
              <ApperIcon name="Calendar" className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-accent-600 font-body">Bookings</span>
          </div>
          <div className="text-2xl font-bold text-accent-800 font-display">18</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <ApperIcon name="DollarSign" className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600 font-body">Earnings</span>
          </div>
          <div className="text-2xl font-bold text-green-800 font-display">$8,945</div>
        </div>
      </div>

      {/* Property Grid */}
<PropertyGrid
        properties={properties}
        showActions={true}
        onEditProperty={handleEditProperty}
        onDeleteProperty={handleDeleteProperty}
        onManageAvailability={handleManageAvailability}
      />

      {/* Help Section */}
{/* Availability Management Modal */}
      {showAvailabilityModal && editingProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 font-display">
                  Manage Availability - {editingProperty.title}
                </h2>
                <button
                  onClick={() => {
                    setShowAvailabilityModal(false);
                    setEditingProperty(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ApperIcon name="X" size={24} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <AvailabilityCalendar 
                propertyId={editingProperty.Id}
                mode="manage"
              />
            </div>
          </div>
        </div>
      )}
{/* Help Section */}
      <div className="max-w-2xl mx-auto mt-12">
        <ApperIcon name="HelpCircle" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold font-display text-gray-900 mb-4 text-center">
          Need help managing your listings?
        </h3>
        <p className="text-gray-600 font-body mb-6 text-center">
          Our support team is here to help you optimize your properties, increase bookings, and maximize your earnings.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary">
            <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
          <Button variant="outline">
            <ApperIcon name="BookOpen" className="h-4 w-4 mr-2" />
            Host Resources
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyListings;