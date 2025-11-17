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
        const newProperty = {
          ...property,
          Id: maxId + 1,
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
          this.properties[index] = { ...this.properties[index], ...propertyData };
          resolve({ ...this.properties[index] });
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
}

export const propertyService = new PropertyService();