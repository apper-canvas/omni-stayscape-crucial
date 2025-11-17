import React, { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import TextArea from "@/components/atoms/TextArea";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { propertyService } from "@/services/api/propertyService";

const PropertyForm = ({ property, onSave, onCancel, className }) => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    pricePerNight: "",
    maxGuests: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "",
    amenities: [],
    images: [""]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const amenityOptions = [
    "WiFi", "Kitchen", "Parking", "Pool", "Hot Tub", "Fireplace", "Air Conditioning",
    "Heating", "Washer", "Dryer", "TV", "Workspace", "Gym Access", "Beach Access",
    "Mountain View", "Ocean View", "City View", "Garden", "Balcony", "Patio",
    "BBQ Grill", "Outdoor Dining", "Pet Friendly", "Smoking Allowed"
  ];

  const propertyTypes = [
    "Apartment", "House", "Villa", "Cabin", "Loft", "Penthouse", 
    "Townhouse", "Cottage", "Farmhouse", "Castle", "Boat", "Other"
  ];

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        location: property.location || "",
        description: property.description || "",
        pricePerNight: property.pricePerNight?.toString() || "",
        maxGuests: property.maxGuests?.toString() || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        propertyType: property.propertyType || "",
        amenities: property.amenities || [],
        images: property.images?.length > 0 ? property.images : [""]
      });
    }
  }, [property]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.pricePerNight || formData.pricePerNight <= 0) newErrors.pricePerNight = "Valid price is required";
    if (!formData.maxGuests || formData.maxGuests <= 0) newErrors.maxGuests = "Number of guests is required";
    if (!formData.bedrooms || formData.bedrooms <= 0) newErrors.bedrooms = "Number of bedrooms is required";
    if (!formData.bathrooms || formData.bathrooms <= 0) newErrors.bathrooms = "Number of bathrooms is required";
    if (!formData.propertyType) newErrors.propertyType = "Property type is required";
    if (formData.images.filter(img => img.trim()).length === 0) newErrors.images = "At least one image URL is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const propertyData = {
        ...formData,
        pricePerNight: parseInt(formData.pricePerNight),
        maxGuests: parseInt(formData.maxGuests),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        images: formData.images.filter(img => img.trim()),
        hostId: "host-1" // Default host ID
      };

      let result;
      if (property) {
        result = await propertyService.update(property.Id, propertyData);
        toast.success("Property updated successfully!");
      } else {
        result = await propertyService.create(propertyData);
        toast.success("Property created successfully!");
      }

      onSave(result);
    } catch (error) {
      toast.error(error.message || "Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold font-display text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Property Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
            required
            placeholder="Beautiful oceanfront villa..."
          />
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            error={errors.location}
            required
            placeholder="Malibu, California"
          />
        </div>
        <div className="mt-4">
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
            required
            rows={4}
            placeholder="Describe your property, its unique features, and what makes it special..."
          />
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold font-display text-gray-900 mb-4">
          Property Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Property Type"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleInputChange}
            error={errors.propertyType}
            required
          >
            <option value="">Select type</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Input
            label="Price per Night"
            name="pricePerNight"
            type="number"
            value={formData.pricePerNight}
            onChange={handleInputChange}
            error={errors.pricePerNight}
            required
            min="1"
            placeholder="150"
          />
          <Input
            label="Max Guests"
            name="maxGuests"
            type="number"
            value={formData.maxGuests}
            onChange={handleInputChange}
            error={errors.maxGuests}
            required
            min="1"
            placeholder="4"
          />
          <Input
            label="Bedrooms"
            name="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={handleInputChange}
            error={errors.bedrooms}
            required
            min="1"
            placeholder="2"
          />
        </div>
        <div className="mt-4">
          <Input
            label="Bathrooms"
            name="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={handleInputChange}
            error={errors.bathrooms}
            required
            min="1"
            step="0.5"
            placeholder="2"
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold font-display text-gray-900 mb-4">
          Amenities
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {amenityOptions.map(amenity => (
            <label
              key={amenity}
              className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-body text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            Property Images
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageField}
          >
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </div>
        <div className="space-y-3">
          {formData.images.map((image, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Input
                label={`Image URL ${index + 1}`}
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-7"
                >
                  <ApperIcon name="Trash2" className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.images && (
          <p className="mt-2 text-sm text-red-600 font-body">{errors.images}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
              {property ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <ApperIcon name="Save" className="h-4 w-4 mr-2" />
              {property ? "Update Property" : "Create Property"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;