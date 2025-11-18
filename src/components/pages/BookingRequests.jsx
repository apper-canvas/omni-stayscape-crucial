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

const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [propertiesData] = await Promise.all([
        propertyService.getAll()
      ]);
      
      setProperties(propertiesData);
      
      // Get bookings for host's properties
      const hostBookings = await bookingService.getByHostProperties(propertiesData.map(p => p.Id));
      setBookings(hostBookings);
    } catch (err) {
      setError(err.message || "Failed to load booking requests");
      toast.error("Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to approve this booking request?")) {
      return;
    }

    try {
      await bookingService.update(bookingId, { status: "Confirmed" });
      setBookings(prev => prev.map(booking => 
        booking.Id === bookingId 
          ? { ...booking, status: "Confirmed" }
          : booking
      ));
      toast.success("Booking approved successfully! The guest has been notified.");
    } catch (err) {
      toast.error(err.message || "Failed to approve booking");
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to decline this booking request? This action cannot be undone.")) {
      return;
    }

    try {
      await bookingService.update(bookingId, { status: "Cancelled" });
      setBookings(prev => prev.map(booking => 
        booking.Id === bookingId 
          ? { ...booking, status: "Cancelled" }
          : booking
      ));
      toast.success("Booking declined. The guest has been notified.");
    } catch (err) {
      toast.error(err.message || "Failed to decline booking");
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
      pending: counts.pending || 0,
      confirmed: counts.confirmed || 0,
      cancelled: counts.cancelled || 0
    };
  };

  const statusCounts = getStatusCounts();
  const pendingCount = statusCounts.pending;

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <Loading variant="list" />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load booking requests"
        message={error}
        onRetry={loadData}
      />
    );
  }

  if (properties.length === 0) {
    return (
      <Empty
        title="No properties listed"
        message="You need to list properties before receiving booking requests."
        actionLabel="Add Your First Property"
        onAction={() => window.location.href = "/my-listings"}
      />
    );
  }

  if (bookings.length === 0) {
    return (
      <Empty
        title="No booking requests yet"
        message="When guests book your properties, you'll see their requests here for approval."
        actionLabel="View My Listings"
        onAction={() => window.location.href = "/my-listings"}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-text flex items-center">
            Booking Requests
            {pendingCount > 0 && (
              <Badge variant="warning" size="sm" className="ml-3">
                {pendingCount} pending
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 font-body mt-2">
            Manage booking requests for your {properties.length} {properties.length === 1 ? "property" : "properties"}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200 text-center">
          <div className="text-2xl font-bold text-primary-800 font-display">{statusCounts.all}</div>
          <div className="text-sm text-primary-600 font-body">Total Requests</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200 text-center">
          <div className="text-2xl font-bold text-yellow-800 font-display">{statusCounts.pending}</div>
          <div className="text-sm text-yellow-600 font-body">Pending</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-800 font-display">{statusCounts.confirmed}</div>
          <div className="text-sm text-green-600 font-body">Confirmed</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 text-center">
          <div className="text-2xl font-bold text-red-800 font-display">{statusCounts.cancelled}</div>
          <div className="text-sm text-red-600 font-body">Declined</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "pending", label: "Pending Requests", count: statusCounts.pending, urgent: true },
          { key: "all", label: "All Requests", count: statusCounts.all },
          { key: "confirmed", label: "Confirmed", count: statusCounts.confirmed },
          { key: "cancelled", label: "Declined", count: statusCounts.cancelled }
        ].map(({ key, label, count, urgent }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 font-body ${
              filter === key
                ? urgent 
                  ? "bg-yellow-500 text-white shadow-lg"
                  : "bg-primary-500 text-white shadow-lg"
                : urgent && count > 0
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50"
            }`}
          >
            {label}
            {urgent && count > 0 && filter !== key && (
              <div className="ml-2 flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            )}
            <Badge 
              variant={filter === key ? "neutral" : "primary"} 
              size="xs" 
              className={`ml-2 ${
                filter === key 
                  ? "bg-white/20 text-white border-white/20" 
                  : urgent && count > 0 
                    ? "bg-yellow-200 text-yellow-800 border-yellow-300"
                    : ""
              }`}
            >
              {count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Booking Requests List */}
      {filteredBookings.length === 0 ? (
        <Empty
          title={`No ${filter === "all" ? "" : filter} booking requests`}
          message={
            filter === "pending" 
              ? "All caught up! No pending requests need your attention right now."
              : `You don't have any ${filter === "all" ? "" : filter.toLowerCase()} booking requests at the moment.`
          }
          actionLabel={filter === "pending" ? "View All Requests" : "View Pending"}
          onAction={() => setFilter(filter === "pending" ? "all" : "pending")}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.Id}
              booking={booking}
              property={getPropertyById(booking.propertyId)}
              isHost={true}
              onApprove={handleApproveBooking}
              onDecline={handleDeclineBooking}
            />
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center mt-12">
        <div className="max-w-2xl mx-auto">
          <ApperIcon name="Users" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">
            Managing Your Bookings
          </h3>
          <p className="text-gray-600 font-body mb-6">
            Approve or decline booking requests to maintain control over your property calendar. 
            Guests are automatically notified of status changes via email.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => toast.info('Host support coming soon! Get help with managing your bookings.')}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-body"
            >
              <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
              Host Support
            </button>
            <button 
              onClick={() => toast.info('Booking policies and guidelines coming soon!')}
              className="flex items-center justify-center px-6 py-3 border-2 border-primary-500 text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-all duration-200 font-body"
            >
              <ApperIcon name="BookOpen" className="h-4 w-4 mr-2" />
              Booking Policies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingRequests;