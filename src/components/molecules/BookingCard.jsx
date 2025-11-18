import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
const BookingCard = ({ booking, property, className, onCancel, isHost, onApprove, onDecline }) => {
  const navigate = useNavigate();

  const handleSendMessage = () => {
    navigate(`/messages?booking=${booking.Id}`);
  };
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "completed":
        return "primary";
      case "cancelled":
        return "error";
      default:
        return "neutral";
    }
  };

  const formatDate = (dateString) => {
    try {
return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const canCancel = booking.status.toLowerCase() === "pending" || booking.status.toLowerCase() === "confirmed";
  const isPending = booking.status.toLowerCase() === "pending";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex">
        {/* Property Image */}
        <div className="w-32 h-32 flex-shrink-0">
          <img
            src={property?.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop"}
            alt={property?.title || "Property"}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Booking Details */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold font-display text-gray-900 mb-1">
                {property?.title || "Property"}
              </h3>
              <p className="text-sm text-gray-600 font-body flex items-center">
                <ApperIcon name="MapPin" className="h-4 w-4 mr-1 text-gray-400" />
                {property?.location || "Location"}
              </p>
            </div>
            <Badge variant={getStatusVariant(booking.status)} size="sm">
              {booking.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-500 font-body mb-1">Check-in</div>
              <div className="text-base font-medium text-gray-900 font-body">
                {formatDate(booking.checkIn)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-body mb-1">Check-out</div>
              <div className="text-base font-medium text-gray-900 font-body">
                {formatDate(booking.checkOut)}
              </div>
            </div>
          </div>

          {/* Guest Information - Enhanced for hosts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600 font-body">
              <div className="flex items-center">
                <ApperIcon name="User" className="h-4 w-4 mr-1" />
                {booking.guestName}
              </div>
              <div className="flex items-center">
                <ApperIcon name="Users" className="h-4 w-4 mr-1" />
                {booking.guests} guests
              </div>
              {isHost && booking.guestEmail && (
                <div className="flex items-center">
                  <ApperIcon name="Mail" className="h-4 w-4 mr-1" />
                  {booking.guestEmail}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xl font-bold font-display gradient-text">
                  ${booking.totalPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-body">total</div>
              </div>

              {/* Host Actions */}
              {isHost && isPending && onApprove && onDecline && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onApprove(booking.Id)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    title="Approve booking"
                  >
                    <ApperIcon name="Check" className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => onDecline(booking.Id)}
                    className="flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    title="Decline booking"
                  >
                    <ApperIcon name="X" className="h-4 w-4 mr-1" />
                    Decline
                  </button>
                </div>
              )}

              {/* Guest Actions */}
              {!isHost && canCancel && onCancel && (
                <button
                  onClick={() => onCancel(booking.Id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cancel booking"
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Special Requests - Host View */}
          {isHost && booking.specialRequests && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <ApperIcon name="MessageSquare" className="h-4 w-4 mr-1" />
                Special Requests
              </div>
              <div className="text-sm text-gray-600 font-body">
                {booking.specialRequests}
              </div>
            </div>
</div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-3">
              {/* Send Message Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendMessage}
                className="flex-1 sm:flex-none"
              >
                <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BookingCard;