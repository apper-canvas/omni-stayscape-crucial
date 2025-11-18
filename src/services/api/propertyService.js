import propertiesData from "@/services/mockData/properties.json";
import { reviewService } from "@/services/api/reviewService";
import React from "react";
// Mock availability storage - in production, this would be stored in database
let propertyAvailability = {};

class PropertyService {
constructor() {
    this.properties = [...propertiesData.map(property => ({
...property,
      instantBook: property.instantBook || false,
      houseRules: property.houseRules || {
        checkInTime: "3:00 PM",
        checkOutTime: "11:00 AM",
        smokingAllowed: false,
        petsAllowed: false,
        partiesAllowed: false,
        quietHours: "10:00 PM - 8:00 AM",
        additionalRules: ""
      }
    }))];
  }

async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const propertiesWithRatings = this.properties.map(property => {
          const ratingData = reviewService.getAverageRating(property.Id);
          return {
            ...property,
            averageRating: ratingData.overall,
            reviewCount: ratingData.reviewCount
          };
        });
        resolve(propertiesWithRatings);
      }, 300);
    });
  }

async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const property = this.properties.find(p => p.Id === parseInt(id));
        if (property) {
          const ratingData = reviewService.getAverageRating(property.Id);
resolve({ 
            ...property,
            averageRating: ratingData.overall,
            reviewCount: ratingData.reviewCount,
            houseRules: property.houseRules || {
              checkInTime: "3:00 PM",
              checkOutTime: "11:00 AM",
              smokingAllowed: false,
              petsAllowed: false,
              partiesAllowed: false,
              quietHours: "10:00 PM - 8:00 AM",
              additionalRules: ""
            }
          });
        } else {
          reject(new Error("Property not found"));
        }
      }, 200);
    });
}

  async create(property) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const maxId = Math.max(...this.properties.map(p => p.Id), 0);
        
// Convert File objects to URLs for mock storage
        const processedImages = property.images?.map(image => {
          if (typeof window !== 'undefined' && window.File && image instanceof window.File) {
            // In a real app, this would upload to a server and return a URL
            return `https://example.com/uploads/${image.name}`;
          }
          return image;
        }) || [];
        
const newProperty = {
...property,
          Id: maxId + 1,
          images: processedImages,
          createdAt: new Date().toISOString(),
          averageRating: 0,
          reviewCount: 0,
          instantBook: property.instantBook || false,
          houseRules: property.houseRules || {
            checkInTime: "3:00 PM",
            checkOutTime: "11:00 AM",
            smokingAllowed: false,
            petsAllowed: false,
            partiesAllowed: false,
            quietHours: "10:00 PM - 8:00 AM",
            additionalRules: ""
          }
        };
        
        // Initialize availability for new property
        this.initializeAvailability(newProperty.Id);
        this.properties.push(newProperty);
        resolve({ ...newProperty });
      }, 400);
    });
}

  async update(id, propertyData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.properties.findIndex(p => p.Id === parseInt(id));
        if (index !== -1) {
// Convert File objects to URLs for mock storage
          const processedImages = propertyData.images?.map(image => {
            if (typeof window !== 'undefined' && window.File && image instanceof window.File) {
              return `https://example.com/uploads/${image.name}`;
            }
            return image;
          }) || [];
          const ratingData = reviewService.getAverageRating(this.properties[index].Id);
          const updatedProperty = { 
...this.properties[index], 
            ...propertyData,
            images: processedImages,
            averageRating: ratingData.overall,
            reviewCount: ratingData.reviewCount,
            instantBook: propertyData.instantBook !== undefined ? propertyData.instantBook : this.properties[index].instantBook,
            houseRules: propertyData.houseRules || this.properties[index].houseRules || {
              checkInTime: "3:00 PM",
              checkOutTime: "11:00 AM",
              smokingAllowed: false,
              petsAllowed: false,
              partiesAllowed: false,
              quietHours: "10:00 PM - 8:00 AM",
              additionalRules: ""
            }
          };
          this.properties[index] = updatedProperty;
          resolve({ ...updatedProperty });
        } else {
          reject(new Error("Property not found"));
        }
      }, 350);
    });
}

  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.properties.findIndex(p => p.Id === parseInt(id));
        if (index !== -1) {
          this.properties.splice(index, 1);
          resolve({ success: true });
        } else {
          reject(new Error("Property not found"));
        }
}, 250);
    });
  }

  // Initialize availability for a property (default to available for next 365 days)
  initializeAvailability(propertyId) {
    if (!propertyAvailability[propertyId]) {
      propertyAvailability[propertyId] = {};
      
      // Set next 365 days as available by default
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        propertyAvailability[propertyId][dateKey] = 'available';
      }
    }
  }

  // Get availability for a specific property and month
  async getAvailability(propertyId, year, month) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!propertyAvailability[propertyId]) {
          this.initializeAvailability(propertyId);
        }

        // Filter availability for the requested month
        const monthlyAvailability = {};
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        Object.entries(propertyAvailability[propertyId] || {}).forEach(([dateKey, status]) => {
          const date = new Date(dateKey);
          if (date >= firstDay && date <= lastDay) {
            monthlyAvailability[dateKey] = status;
          }
        });

        resolve(monthlyAvailability);
      }, 300);
    });
}

  // Update availability for specific date
  async updateAvailability(propertyId, dateKey, status) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!propertyAvailability[propertyId]) {
            this.initializeAvailability(propertyId);
          }

          // Validate status
          const validStatuses = ['available', 'blocked', 'booked'];
          if (!validStatuses.includes(status)) {
            throw new Error('Invalid availability status');
}

          propertyAvailability[propertyId][dateKey] = status;
          resolve({ success: true });
        } catch (error) {
          reject(error);
        }
      }, 200);
    });
  }

  // Check if a date is available for booking
  async isDateAvailable(propertyId, dateKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!propertyAvailability[propertyId]) {
          this.initializeAvailability(propertyId);
        }

        const status = propertyAvailability[propertyId][dateKey];
resolve(status === 'available');
      }, 100);
    });
  }

  // Check if a date range is available
  async isDateRangeAvailable(propertyId, startDate, endDate) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!propertyAvailability[propertyId]) {
          this.initializeAvailability(propertyId);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const currentDate = new Date(start);

        while (currentDate <= end) {
          const dateKey = currentDate.toISOString().split('T')[0];
          const status = propertyAvailability[propertyId][dateKey];
          
          if (status !== 'available') {
            resolve(false);
            return;
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
resolve(true);
      }, 200);
    });
  }

  // Mark dates as booked (called when booking is confirmed)
async markDatesAsBooked(propertyId, startDate, endDate) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!propertyAvailability[propertyId]) {
            this.initializeAvailability(propertyId);
          }

          const start = new Date(startDate);
          const end = new Date(endDate);
          const currentDate = new Date(start);

          while (currentDate <= end) {
            const dateKey = currentDate.toISOString().split('T')[0];
            propertyAvailability[propertyId][dateKey] = 'booked';
            currentDate.setDate(currentDate.getDate() + 1);
          }

          resolve({ success: true });
        } catch (error) {
          reject(error);
        }
      }, 200);
    });
  }

  async releaseDatesFromBooking(propertyId, startDate, endDate) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!propertyAvailability[propertyId]) {
            this.initializeAvailability(propertyId);
          }

          const start = new Date(startDate);
          const end = new Date(endDate);
          const currentDate = new Date(start);

          while (currentDate <= end) {
            const dateKey = currentDate.toISOString().split('T')[0];
            delete propertyAvailability[propertyId][dateKey];
            currentDate.setDate(currentDate.getDate() + 1);
          }

          resolve({ success: true });
        } catch (error) {
          reject(error);
        }
      }, 200);
    });
  }
  async search(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query) {
          resolve([...this.properties]);
          return;
        }
        
        const filteredProperties = this.properties.filter(property =>
          property.title.toLowerCase().includes(query.toLowerCase()) ||
          property.location.toLowerCase().includes(query.toLowerCase()) ||
          property.description.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filteredProperties);
      }, 300);
    });
  }

async filter(criteria) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredProperties = [...this.properties];
        
        // Filter by location
        if (criteria.location) {
          filteredProperties = filteredProperties.filter(property =>
            property.location.toLowerCase().includes(criteria.location.toLowerCase()) ||
            property.title.toLowerCase().includes(criteria.location.toLowerCase())
          );
        }
        
        // Filter by guest capacity
        if (criteria.guests) {
          filteredProperties = filteredProperties.filter(property =>
            property.maxGuests >= criteria.guests
          );
        }
        
        // Filter by price range
        if (criteria.priceMin !== null) {
          filteredProperties = filteredProperties.filter(property =>
            property.pricePerNight >= criteria.priceMin
          );
        }
        
        if (criteria.priceMax !== null) {
          filteredProperties = filteredProperties.filter(property =>
            property.pricePerNight <= criteria.priceMax
          );
        }
        
        // Filter by property type
        if (criteria.propertyType) {
          filteredProperties = filteredProperties.filter(property =>
            property.propertyType === criteria.propertyType
          );
        }
        
// Filter by minimum bedrooms
        if (criteria.minBedrooms !== null) {
          filteredProperties = filteredProperties.filter(property =>
            property.bedrooms >= criteria.minBedrooms
          );
        }
        
        // Filter by selected amenities
        if (criteria.selectedAmenities && criteria.selectedAmenities.length > 0) {
          filteredProperties = filteredProperties.filter(property => {
            // Check if property has all selected amenities
            return criteria.selectedAmenities.every(selectedAmenity =>
              property.amenities.some(propertyAmenity =>
                propertyAmenity.toLowerCase().includes(selectedAmenity.toLowerCase()) ||
                selectedAmenity.toLowerCase().includes(propertyAmenity.toLowerCase())
              )
            );
          });
        }
        
        // Filter by availability (check-in and check-out dates)
        if (criteria.checkIn || criteria.checkOut) {
          filteredProperties = filteredProperties.filter(property => {
            // Simulate availability checking
            // In real implementation, this would check against booking records
            const propertyId = property.Id;
            const checkIn = criteria.checkIn ? new Date(criteria.checkIn) : null;
            const checkOut = criteria.checkOut ? new Date(criteria.checkOut) : null;
            
            // Simple availability simulation: assume some properties are booked on certain date ranges
            const mockBookedDates = [
              // Property 1 booked Dec 15-25, 2024
              { propertyId: 1, start: new Date('2024-12-15'), end: new Date('2024-12-25') },
              // Property 2 booked Jan 1-7, 2025  
              { propertyId: 2, start: new Date('2025-01-01'), end: new Date('2025-01-07') },
              // Property 3 booked Feb 10-20, 2025
              { propertyId: 3, start: new Date('2025-02-10'), end: new Date('2025-02-20') }
            ];
            
            // Check if the requested dates conflict with any bookings for this property
            const hasConflict = mockBookedDates.some(booking => {
              if (booking.propertyId !== propertyId) return false;
              
              // If only check-in provided, assume 1-night stay
              const userCheckOut = checkOut || (checkIn ? new Date(checkIn.getTime() + 24*60*60*1000) : null);
              
              if (!checkIn || !userCheckOut) return false;
              
              // Check for date overlap
              return (checkIn < booking.end && userCheckOut > booking.start);
            });
            
            return !hasConflict;
          });
        }
        
        // Apply sorting
        if (criteria.sortBy) {
          switch (criteria.sortBy) {
            case 'price_low':
              filteredProperties.sort((a, b) => a.pricePerNight - b.pricePerNight);
              break;
            case 'price_high':
              filteredProperties.sort((a, b) => b.pricePerNight - a.pricePerNight);
              break;
            case 'rating':
              filteredProperties.sort((a, b) => (b.rating || 0) - (a.rating || 0));
              break;
            case 'newest':
              // Sort by Id descending (assuming higher Id = newer listing)
              filteredProperties.sort((a, b) => b.Id - a.Id);
              break;
            default:
              break;
          }
        }
        
        resolve(filteredProperties);
}, 300);
    });
  }

  // Review-related methods
  async getPropertyReviews(propertyId) {
    return await reviewService.getByPropertyId(propertyId);
  }

  async addReview(propertyId, reviewData) {
    const review = await reviewService.create({
      ...reviewData,
      propertyId: parseInt(propertyId)
    });
    return review;
  }

  getAverageRating(propertyId) {
    return reviewService.getAverageRating(propertyId);
  }
}

export const propertyService = new PropertyService();