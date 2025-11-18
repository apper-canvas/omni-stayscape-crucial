import propertiesData from "@/services/mockData/properties.json";

class PropertyService {
  constructor() {
    this.properties = [...propertiesData];
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.properties]);
      }, 300);
    });
  }

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const property = this.properties.find(p => p.Id === parseInt(id));
        if (property) {
          resolve({ ...property });
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
          if (typeof window !== 'undefined' && typeof File !== 'undefined' && image instanceof File) {
            // In a real app, this would upload to a server and return a URL
            return `https://example.com/uploads/${image.name}`;
          }
          return image;
        }) || [];
        const newProperty = {
          ...property,
          Id: maxId + 1,
          images: processedImages,
          createdAt: new Date().toISOString()
        };
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
            if (typeof window !== 'undefined' && typeof File !== 'undefined' && image instanceof File) {
              return `https://example.com/uploads/${image.name}`;
            }
            return image;
          }) || [];
          const updatedProperty = { 
            ...this.properties[index], 
            ...propertyData,
            images: processedImages
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
      
      resolve(filteredProperties);
    }, 300);
  });
}
}

export const propertyService = new PropertyService();