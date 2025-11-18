import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { propertyService } from "@/services/api/propertyService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import AvailabilityCalendar from "@/components/molecules/AvailabilityCalendar";
import FileDropzone from "@/components/atoms/FileDropzone";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ImagePreviewGrid from "@/components/atoms/ImagePreviewGrid";
import TextArea from "@/components/atoms/TextArea";
import Input from "@/components/atoms/Input";
const PropertyForm = ({ property, onSave, onCancel, className }) => {
const [currentStep, setCurrentStep] = useState(1);
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
    images: [],
    instantBook: false
   });
   const [showAvailabilityTab, setShowAvailabilityTab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const amenityOptions = [
    "WiFi", "Kitchen", "Parking", "Pool", "Hot Tub", "Fireplace", "Air Conditioning",
    "Heating", "Washer", "Dryer", "TV", "Workspace", "Gym Access", "Beach Access",
    "Mountain View", "Ocean View", "City View", "Garden", "Balcony", "Patio",
    "BBQ Grill", "Outdoor Dining", "Pet Friendly", "Smoking Allowed"
  ];

const propertyTypes = [
    "Entire home", "Private room", "Shared room"
  ];

  const totalSteps = 3;

  const stepTitles = {
    1: "Basic Information",
    2: "Property Details", 
    3: "Pricing & Images"
  };

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
        images: [],
        instantBook: property.instantBook || false
      });
      setShowAvailabilityTab(true); // Show availability tab for existing properties
      // If editing, skip to final step
      if (property) {
        setCurrentStep(totalSteps);
      }
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

const handleFileDrop = useCallback((files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image type. Please use JPG, PNG, or WebP.`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Please use images under 5MB.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
    }
  }, []);

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const moveImage = (fromIndex, toIndex) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return {
        ...prev,
        images: newImages
      };
    });
  };

const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.propertyType) newErrors.propertyType = "Property type is required";
    if (!formData.bedrooms || parseInt(formData.bedrooms) < 0) newErrors.bedrooms = "Number of bedrooms is required and must be positive";
    if (!formData.bathrooms || parseInt(formData.bathrooms) < 0) newErrors.bathrooms = "Number of bathrooms is required and must be positive";
    if (!formData.maxGuests || parseInt(formData.maxGuests) < 1) newErrors.maxGuests = "Maximum guests must be at least 1";
    if (!formData.pricePerNight || parseInt(formData.pricePerNight) < 1) newErrors.pricePerNight = "Price per night must be at least $1";
    if (formData.images.length === 0) newErrors.images = "At least one image is required";

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
        images: formData.images,
        instantBook: formData.instantBook,
        hostId: "host-1" // Default host ID
      };

      let result;
      if (property) {
        result = await propertyService.update(property.Id, propertyData);
        toast.success("Property updated successfully!");
      } else {
        result = await propertyService.create(propertyData);
        toast.success("Property created successfully!");
        setShowAvailabilityTab(true); // Show availability tab after creating
      }

      if (result && onSave) {
        onSave(result);
        if (!property) {
          // For new properties, keep form open to manage availability
          setCurrentStep(4); // Switch to availability tab
        }
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(property ? 'Failed to update property' : 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.location.trim() && formData.description.trim();
      case 2:
        return formData.propertyType && formData.bedrooms && formData.bathrooms && formData.maxGuests;
      case 3:
        return formData.pricePerNight && formData.pricePerNight > 0 && formData.images.length > 0;
      case 4:
        return true; // Availability tab is always valid
      default:
        return false;
    }
  };

  const getStepTitle = (step) => {
const titles = ["Basic Info", "Details", "Amenities", "Photos & Pricing", "Booking Settings"];
    return titles[step] || "Unknown Step";
  };
const getTotalSteps = () => 5;
  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Step Navigation */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-display mb-6">
          {property ? 'Edit Property' : 'Add New Property'}
        </h2>
        
{/* Step Title */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 font-display">
            {getStepTitle(currentStep - 1)}
          </h3>
        </div>
        
{/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (showAvailabilityTab ? 4 : totalSteps)) * 100}%` }}
          ></div>
        </div>
        
{/* Step Indicators */}
        <div className="flex justify-between">
          {Array.from({ length: showAvailabilityTab ? 4 : totalSteps }, (_, index) => (
            <div key={index + 1} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep > index + 1 
                  ? 'bg-primary-500 text-white' 
                  : currentStep === index + 1
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-200 text-gray-400'
                }
              `}>
                {currentStep > index + 1 ? '✓' : index + 1}
              </div>
              {index < (showAvailabilityTab ? 4 : totalSteps) - 1 && (
                <div className={`w-12 h-1 ml-2 ${
                  currentStep > index + 1 ? 'bg-primary-500' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <p className="text-blue-800 font-body text-sm">
                Let's start with the basic details about your property.
              </p>
            </div>
            
            <Input
              label="Property Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Cozy Downtown Apartment with City Views"
              error={errors.title}
              required
            />
            
            <Input
              label="Address"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="123 Main Street, New York, NY 10001"
              error={errors.location}
              required
            />
            
            <TextArea
              label="Property Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your property's unique features, neighborhood highlights, and what makes it special for guests..."
              rows={5}
              error={errors.description}
              required
            />
          </div>
        )}

        {/* Step 2: Property Details */}
        {currentStep === 2 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <p className="text-green-800 font-body text-sm">
                Now let's add the specific details about your property.
              </p>
            </div>
            
            <Select
              label="Property Type"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              error={errors.propertyType}
              required
            >
              <option value="">Select property type</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Number of Bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={handleInputChange}
                placeholder="2"
                error={errors.bedrooms}
                required
              />
              
              <Input
                label="Number of Bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={handleInputChange}
                placeholder="1.5"
                error={errors.bathrooms}
                required
              />
              
              <Input
                label="Maximum Guests"
                name="maxGuests"
                type="number"
                min="1"
                value={formData.maxGuests}
                onChange={handleInputChange}
                placeholder="4"
                error={errors.maxGuests}
                required
              />
            </div>

            {/* Amenities */}
            <div>
              <h4 className="text-lg font-semibold font-display text-gray-900 mb-4">
                Amenities
              </h4>
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
          </div>
        )}

        {/* Step 3: Pricing & Images */}
        {currentStep === 3 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
              <p className="text-orange-800 font-body text-sm">
                Finally, set your pricing and add photos to showcase your property.
              </p>
            </div>
            
            <Input
              label="Price per Night"
              name="pricePerNight"
              type="number"
              min="1"
              value={formData.pricePerNight}
              onChange={handleInputChange}
              placeholder="125"
              error={errors.pricePerNight}
              required
              startIcon="$"
            />

{/* Photo Upload */}
            <div>
              <h4 className="text-lg font-semibold font-display text-gray-900 mb-4">
                Property Photos
              </h4>
              <FileDropzone onFileDrop={handleFileDrop} />
              {formData.images.length > 0 && (
                <ImagePreviewGrid 
                  images={formData.images}
                  onRemove={removeImage}
                  onMove={moveImage}
                />
              )}
              {errors.images && (
                <p className="mt-2 text-sm text-red-600 font-body">{errors.images}</p>
              )}
</div>

            {/* Instant Booking Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-base font-semibold font-display text-gray-900">
                  Instant Book
                </h4>
                <p className="text-sm text-gray-600 font-body mt-1">
                  Allow guests to book immediately without requiring approval
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.instantBook}
                  onChange={(e) => setFormData(prev => ({ ...prev, instantBook: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        )}
        {/* Step 4: Availability Management */}
        {currentStep === 4 && showAvailabilityTab && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 font-display mb-2">
                Set Availability
              </h3>
              <p className="text-gray-600 font-body">
                Manage when your property is available for bookings
              </p>
            </div>
            
            <AvailabilityCalendar 
              propertyId={property?.Id || formData.Id}
              mode="manage"
            />
          </div>
        )}
        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex space-x-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={loading}
              >
                <ApperIcon name="ChevronLeft" className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          
<div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            
{currentStep < (showAvailabilityTab ? 4 : totalSteps) ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNextStep() || loading}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ApperIcon name="ChevronRight" className="h-4 w-4 ml-2" />
              </Button>
            ) : currentStep === 4 && showAvailabilityTab ? (
              <Button
                type="button"
                onClick={onCancel}
                className="flex items-center space-x-2"
              >
                <span>Done</span>
                <ApperIcon name="Check" className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !canProceedToNextStep()}
                className="flex items-center space-x-2"
              >
                {loading && <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />}
                <span>{property ? "Update Property" : "Create Property"}</span>
              </Button>
            )}
          </div>
        </div>
</form>
    </div>
  );
};

export default PropertyForm;