import bookingsData from "@/services/mockData/bookings.json";

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
          status: booking.instantBook ? "Confirmed" : "Pending",
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

  async requestModification(id, modificationData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.bookings.findIndex(b => b.Id === parseInt(id));
        if (index !== -1) {
          const booking = this.bookings[index];
          const modification = {
            Id: Date.now(),
            bookingId: parseInt(id),
            originalCheckIn: booking.checkIn,
            originalCheckOut: booking.checkOut,
            originalGuests: booking.guests,
            requestedCheckIn: modificationData.checkIn,
            requestedCheckOut: modificationData.checkOut,
            requestedGuests: modificationData.guests,
            reason: modificationData.reason,
            status: 'Pending',
            createdAt: new Date().toISOString()
          };
          
          // Add modification request to booking
          const updatedBooking = {
            ...booking,
            modificationRequest: modification,
            status: 'Modification Requested'
          };
          this.bookings[index] = updatedBooking;
          resolve({ modification, booking: updatedBooking });
        } else {
          reject(new Error("Booking not found"));
        }
      }, 400);
    });
  }

  async approveModificationRequest(bookingId, modificationId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.bookings.findIndex(b => b.Id === parseInt(bookingId));
        if (index !== -1) {
          const booking = this.bookings[index];
          if (booking.modificationRequest && booking.modificationRequest.Id === parseInt(modificationId)) {
            const updatedBooking = {
              ...booking,
              checkIn: booking.modificationRequest.requestedCheckIn,
              checkOut: booking.modificationRequest.requestedCheckOut,
              guests: booking.modificationRequest.requestedGuests,
              modificationRequest: {
                ...booking.modificationRequest,
                status: 'Approved',
                approvedAt: new Date().toISOString()
              },
              status: 'Confirmed'
            };
            this.bookings[index] = updatedBooking;
            resolve(updatedBooking);
          } else {
            reject(new Error("Modification request not found"));
          }
        } else {
          reject(new Error("Booking not found"));
        }
      }, 350);
    });
  }

  async denyModificationRequest(bookingId, modificationId, reason) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.bookings.findIndex(b => b.Id === parseInt(bookingId));
        if (index !== -1) {
          const booking = this.bookings[index];
          if (booking.modificationRequest && booking.modificationRequest.Id === parseInt(modificationId)) {
            const updatedBooking = {
              ...booking,
              modificationRequest: {
                ...booking.modificationRequest,
                status: 'Denied',
                deniedAt: new Date().toISOString(),
                denialReason: reason
              },
              status: 'Confirmed'
            };
            this.bookings[index] = updatedBooking;
            resolve(updatedBooking);
          } else {
            reject(new Error("Modification request not found"));
          }
        } else {
          reject(new Error("Booking not found"));
        }
      }, 350);
    });
  }

  async cancelBooking(id, reason) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.bookings.findIndex(b => b.Id === parseInt(id));
        if (index !== -1) {
          const updatedBooking = {
            ...this.bookings[index],
            status: 'Cancelled',
            cancellationReason: reason,
            cancelledAt: new Date().toISOString()
          };
          this.bookings[index] = updatedBooking;
          resolve(updatedBooking);
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

  async canCancelBooking(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booking = this.bookings.find(b => b.Id === parseInt(id));
        if (!booking) {
          reject(new Error("Booking not found"));
          return;
        }

        const checkInDate = new Date(booking.checkIn);
        const now = new Date();
        const hoursDifference = (checkInDate - now) / (1000 * 60 * 60);
        
        let canCancel = false;
        let refundPercent = 0;
        let reason = '';

        if (hoursDifference >= 48) {
          canCancel = true;
          refundPercent = 100;
          reason = 'Full refund available (48+ hours notice)';
        } else if (hoursDifference >= 24) {
          canCancel = true;
          refundPercent = 50;
          reason = 'Partial refund available (24-48 hours notice)';
        } else {
          canCancel = false;
          refundPercent = 0;
          reason = 'No refund available (less than 24 hours notice)';
        }

        resolve({
          canCancel,
          refundPercent,
          reason,
          hoursUntilCheckIn: Math.max(0, hoursDifference)
        });
      }, 200);
    });
  }

  async canModifyBooking(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booking = this.bookings.find(b => b.Id === parseInt(id));
        if (!booking) {
          reject(new Error("Booking not found"));
          return;
        }

        const checkInDate = new Date(booking.checkIn);
        const now = new Date();
        const hoursDifference = (checkInDate - now) / (1000 * 60 * 60);
        
        const canModify = hoursDifference >= 72 && booking.status !== 'Cancelled' && booking.status !== 'Completed';
        const reason = canModify 
          ? 'Modifications allowed (72+ hours notice required)'
          : hoursDifference < 72 
            ? 'Modifications not allowed (less than 72 hours notice)'
            : 'Modifications not allowed for this booking status';

        resolve({
          canModify,
          reason,
          hoursUntilCheckIn: Math.max(0, hoursDifference)
        });
      }, 200);
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

  async getCompletedBookingsByGuest(guestId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const completedBookings = this.bookings.filter(b => 
          b.guestId === guestId && 
          b.status === "confirmed" && 
          new Date(b.checkOut) < now
        );
        resolve(completedBookings);
      }, 200);
});
  }
}

export const bookingService = new BookingService();