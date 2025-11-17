import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import BookingCard from "@/components/molecules/BookingCard";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { bookingService } from "@/services/api/bookingService";
import { propertyService } from "@/services/api/propertyService";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [bookingsData, propertiesData] = await Promise.all([
        bookingService.getAll(),
        propertyService.getAll()
      ]);
      
      setBookings(bookingsData);
      setProperties(propertiesData);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await bookingService.update(bookingId, { status: "Cancelled" });
      setBookings(prev => prev.map(booking => 
        booking.Id === bookingId 
          ? { ...booking, status: "Cancelled" }
          : booking
      ));
      toast.success("Booking cancelled successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  const getPropertyById = (propertyId) => {
    return properties.find(p => p.Id === parseInt(propertyId));
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusCounts = () => {
    const counts = bookings.reduce((acc, booking) => {
      const status = booking.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      all: bookings.length,
      confirmed: counts.confirmed || 0,
      pending: counts.pending || 0,
      completed: counts.completed || 0,
      cancelled: counts.cancelled || 0
    };
  };

  const statusCounts = getStatusCounts();

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <Loading variant="list" />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load bookings"
        message={error}
        onRetry={loadData}
      />
    );
  }

  if (bookings.length === 0) {
    return (
      <Empty
        variant="bookings"
        onAction={() => window.location.href = "/"}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-text">
            My Bookings
          </h1>
          <p className="text-gray-600 font-body mt-2">
            Manage your {bookings.length} booking {bookings.length === 1 ? "reservation" : "reservations"}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200 text-center">
          <div className="text-2xl font-bold text-primary-800 font-display">{statusCounts.all}</div>
          <div className="text-sm text-primary-600 font-body">Total</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-800 font-display">{statusCounts.confirmed}</div>
          <div className="text-sm text-green-600 font-body">Confirmed</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200 text-center">
          <div className="text-2xl font-bold text-yellow-800 font-display">{statusCounts.pending}</div>
          <div className="text-sm text-yellow-600 font-body">Pending</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 text-center">
          <div className="text-2xl font-bold text-blue-800 font-display">{statusCounts.completed}</div>
          <div className="text-sm text-blue-600 font-body">Completed</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 text-center">
          <div className="text-2xl font-bold text-red-800 font-display">{statusCounts.cancelled}</div>
          <div className="text-sm text-red-600 font-body">Cancelled</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "All Bookings", count: statusCounts.all },
          { key: "confirmed", label: "Confirmed", count: statusCounts.confirmed },
          { key: "pending", label: "Pending", count: statusCounts.pending },
          { key: "completed", label: "Completed", count: statusCounts.completed },
          { key: "cancelled", label: "Cancelled", count: statusCounts.cancelled }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 font-body ${
              filter === key
                ? "bg-primary-500 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50"
            }`}
          >
            {label}
            <Badge 
              variant={filter === key ? "neutral" : "primary"} 
              size="xs" 
              className={`ml-2 ${filter === key ? "bg-white/20 text-white border-white/20" : ""}`}
            >
              {count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Empty
          title={`No ${filter === "all" ? "" : filter} bookings`}
          message={`You don't have any ${filter === "all" ? "" : filter.toLowerCase()} bookings at the moment.`}
          actionLabel="Browse Properties"
          onAction={() => window.location.href = "/"}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.Id}
              booking={booking}
              property={getPropertyById(booking.propertyId)}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center mt-12">
        <div className="max-w-2xl mx-auto">
          <ApperIcon name="Calendar" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">
            Questions about your bookings?
          </h3>
          <p className="text-gray-600 font-body mb-6">
            Need help with check-in, cancellations, or have questions about your reservations? Our team is here to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-body">
              <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
              Contact Host
            </button>
            <button className="flex items-center justify-center px-6 py-3 border-2 border-primary-500 text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-all duration-200 font-body">
              <ApperIcon name="HelpCircle" className="h-4 w-4 mr-2" />
              Booking Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;