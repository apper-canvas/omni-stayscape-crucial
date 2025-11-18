import reviewsData from "@/services/mockData/reviews.json";

class ReviewService {
  constructor() {
    this.reviews = [...reviewsData];
    this.nextId = Math.max(...this.reviews.map(r => r.Id)) + 1;
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.reviews]);
      }, 200);
    });
  }

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const review = this.reviews.find(r => r.Id === parseInt(id));
        if (review) {
          resolve({ ...review });
        } else {
          reject(new Error("Review not found"));
        }
      }, 150);
    });
  }

  async getByPropertyId(propertyId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const propertyReviews = this.reviews.filter(r => r.propertyId === parseInt(propertyId));
        resolve(propertyReviews);
      }, 200);
    });
  }

  async getByGuestId(guestId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const guestReviews = this.reviews.filter(r => r.guestId === guestId);
        resolve(guestReviews);
      }, 200);
    });
  }

  async create(reviewData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newReview = {
          ...reviewData,
          Id: this.nextId++,
          createdAt: new Date().toISOString(),
          helpfulCount: 0
        };
        this.reviews.push(newReview);
        resolve({ ...newReview });
      }, 300);
    });
  }

  async update(id, reviewData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.reviews.findIndex(r => r.Id === parseInt(id));
        if (index !== -1) {
          const updatedReview = { 
            ...this.reviews[index], 
            ...reviewData,
            updatedAt: new Date().toISOString()
          };
          this.reviews[index] = updatedReview;
          resolve({ ...updatedReview });
        } else {
          reject(new Error("Review not found"));
        }
      }, 250);
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.reviews.findIndex(r => r.Id === parseInt(id));
        if (index !== -1) {
          this.reviews.splice(index, 1);
          resolve({ success: true });
        } else {
          reject(new Error("Review not found"));
        }
      }, 200);
    });
  }

  async markHelpful(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.reviews.findIndex(r => r.Id === parseInt(id));
        if (index !== -1) {
          this.reviews[index].helpfulCount = (this.reviews[index].helpfulCount || 0) + 1;
          resolve({ ...this.reviews[index] });
        } else {
          reject(new Error("Review not found"));
        }
      }, 150);
    });
  }

  getAverageRating(propertyId) {
    const propertyReviews = this.reviews.filter(r => r.propertyId === parseInt(propertyId));
    if (propertyReviews.length === 0) return { overall: 0, categories: {}, reviewCount: 0 };

    const overallRatings = propertyReviews.map(r => r.overallRating);
    const overallAverage = overallRatings.reduce((sum, rating) => sum + rating, 0) / overallRatings.length;

    const categories = {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      value: 0
    };

    Object.keys(categories).forEach(category => {
      const categoryRatings = propertyReviews
        .map(r => r.categoryRatings[category])
        .filter(rating => rating !== undefined);
      
      if (categoryRatings.length > 0) {
        categories[category] = categoryRatings.reduce((sum, rating) => sum + rating, 0) / categoryRatings.length;
      }
    });

    return {
      overall: Math.round(overallAverage * 10) / 10,
      categories,
      reviewCount: propertyReviews.length
    };
  }
}

export const reviewService = new ReviewService();