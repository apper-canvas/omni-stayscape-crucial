// Wishlist Service - Mock implementation using localStorage
// Manages guest's saved properties with full CRUD operations

class WishlistService {
  constructor() {
    this.storageKey = 'stayscape_wishlist';
    this.init();
  }

  init() {
    // Initialize localStorage if not exists
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  // Get current wishlist data from localStorage
  getWishlistData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading wishlist data:', error);
      return [];
    }
  }

  // Save wishlist data to localStorage
  setWishlistData(wishlist) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist data:', error);
      throw new Error('Failed to save wishlist data');
    }
  }

  // Get all wishlist items
  async getAll() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const wishlist = this.getWishlistData();
          resolve([...wishlist]); // Return copy to prevent mutations
        } catch (error) {
          reject(new Error('Failed to load wishlist'));
        }
      }, 200);
    });
  }

  // Get wishlist item by property ID
  async getByPropertyId(propertyId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const wishlist = this.getWishlistData();
          const item = wishlist.find(item => item.propertyId === parseInt(propertyId));
          resolve(item || null);
        } catch (error) {
          reject(new Error('Failed to find wishlist item'));
        }
      }, 100);
    });
  }

  // Check if property is in wishlist
  async isInWishlist(propertyId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const wishlist = this.getWishlistData();
          const exists = wishlist.some(item => item.propertyId === parseInt(propertyId));
          resolve(exists);
        } catch (error) {
          reject(new Error('Failed to check wishlist status'));
        }
      }, 50);
    });
  }

  // Add property to wishlist
  async add(propertyId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const wishlist = this.getWishlistData();
          const propertyIdInt = parseInt(propertyId);
          
          // Check if already exists
          if (wishlist.some(item => item.propertyId === propertyIdInt)) {
            reject(new Error('Property already in wishlist'));
            return;
          }

          // Create new wishlist item
          const newItem = {
            Id: Date.now(), // Simple ID generation
            propertyId: propertyIdInt,
            addedAt: new Date().toISOString()
          };

          wishlist.push(newItem);
          this.setWishlistData(wishlist);
          resolve(newItem);
        } catch (error) {
          reject(new Error('Failed to add to wishlist'));
        }
      }, 300);
    });
  }

  // Remove property from wishlist by property ID
  async removeByPropertyId(propertyId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const wishlist = this.getWishlistData();
          const propertyIdInt = parseInt(propertyId);
          const initialLength = wishlist.length;
          
          const updatedWishlist = wishlist.filter(item => item.propertyId !== propertyIdInt);
          
          if (updatedWishlist.length === initialLength) {
            reject(new Error('Property not found in wishlist'));
            return;
          }

          this.setWishlistData(updatedWishlist);
          resolve(true);
        } catch (error) {
          reject(new Error('Failed to remove from wishlist'));
        }
      }, 200);
    });
  }

  // Remove wishlist item by wishlist item ID
  async remove(wishlistId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const wishlist = this.getWishlistData();
          const wishlistIdInt = parseInt(wishlistId);
          const initialLength = wishlist.length;
          
          const updatedWishlist = wishlist.filter(item => item.Id !== wishlistIdInt);
          
          if (updatedWishlist.length === initialLength) {
            reject(new Error('Wishlist item not found'));
            return;
          }

          this.setWishlistData(updatedWishlist);
          resolve(true);
        } catch (error) {
          reject(new Error('Failed to remove wishlist item'));
        }
      }, 200);
    });
  }

  // Clear all wishlist items
  async clear() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          this.setWishlistData([]);
          resolve(true);
        } catch (error) {
          reject(new Error('Failed to clear wishlist'));
        }
      }, 250);
    });
  }

  // Get wishlist count
  async getCount() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const wishlist = this.getWishlistData();
          resolve(wishlist.length);
        } catch (error) {
          reject(new Error('Failed to get wishlist count'));
        }
      }, 50);
    });
  }

  // Toggle property in wishlist (add if not exists, remove if exists)
  async toggle(propertyId) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const isInWishlist = await this.isInWishlist(propertyId);
          
          if (isInWishlist) {
            await this.removeByPropertyId(propertyId);
            resolve({ action: 'removed', inWishlist: false });
          } else {
            const newItem = await this.add(propertyId);
            resolve({ action: 'added', inWishlist: true, item: newItem });
          }
        } catch (error) {
          reject(new Error(`Failed to toggle wishlist: ${error.message}`));
        }
      }, 250);
    });
  }
}

// Export singleton instance
export const wishlistService = new WishlistService();