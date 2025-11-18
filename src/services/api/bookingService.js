import bookingsData from "@/services/mockData/bookings.json";
import { toast } from "react-toastify";

class BookingService {
  constructor() {
    this.bookings = [...bookingsData];
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.bookings]);
      }, 250);
    });
  }

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booking = this.bookings.find(b => b.Id === parseInt(id));
        if (booking) {
          resolve({ ...booking });
        } else {
          reject(new Error("Booking not found"));
        }
      }, 200);
    });
  }

  async create(booking) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const maxId = Math.max(...this.bookings.map(b => b.Id), 0);
        const newBooking = {
          ...booking,
          Id: maxId + 1,
          status: "Pending",
          createdAt: new Date().toISOString()
        };
        this.bookings.push(newBooking);
        resolve({ ...newBooking });
      }, 300);
    });
  }

async update(id, bookingData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.bookings.findIndex(b => b.Id === parseInt(id));
        if (index !== -1) {
          const updatedBooking = { 
            ...this.bookings[index], 
            ...bookingData,
            updatedAt: new Date().toISOString()
          };
          this.bookings[index] = updatedBooking;
          resolve({ ...updatedBooking });
        } else {
          reject(new Error("Booking not found"));
        }
      }, 300);
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.bookings.findIndex(b => b.Id === parseInt(id));
        if (index !== -1) {
          this.bookings.splice(index, 1);
          resolve({ success: true });
        } else {
          reject(new Error("Booking not found"));
        }
      }, 250);
    });
  }

async getByPropertyId(propertyId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const propertyBookings = this.bookings.filter(b => b.propertyId === propertyId.toString());
        resolve(propertyBookings);
      }, 200);
    });
  }

async getByHostProperties(propertyIds) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const propertyIdStrings = propertyIds.map(id => id.toString());
        const hostBookings = this.bookings.filter(b => propertyIdStrings.includes(b.propertyId.toString()));
        resolve(hostBookings);
      }, 200);
    });
  }
}

export const bookingService = new BookingService();