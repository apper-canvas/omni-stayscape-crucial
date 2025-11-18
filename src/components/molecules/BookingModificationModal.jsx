import React, { useState, useEffect } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import { cn } from '@/utils/cn';

export default function BookingModificationModal({ 
  isOpen, 
  onClose, 
  booking, 
  property, 
  onSubmit 
}) {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [canModify, setCanModify] = useState({ canModify: false, reason: '' });

  useEffect(() => {
    if (booking && isOpen) {
      setFormData({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        reason: ''
      });
      
      // Check if modification is allowed
      const checkInDate = new Date(booking.checkIn);
      const now = new Date();
      const hoursDifference = (checkInDate - now) / (1000 * 60 * 60);
      
      const modificationAllowed = hoursDifference >= 72 && booking.status !== 'Cancelled' && booking.status !== 'Completed';
      setCanModify({
        canModify: modificationAllowed,
        reason: modificationAllowed 
          ? 'Modifications allowed (72+ hours notice required)'
          : hoursDifference < 72 
            ? 'Modifications not allowed (less than 72 hours notice)'
            : 'Modifications not allowed for this booking status',
        hoursUntilCheckIn: Math.max(0, hoursDifference)
      });
    }
  }, [booking, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canModify.canModify) {
      toast.error('Modifications are not allowed for this booking');
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for the modification');
      return;
    }

    const nights = differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn));
    if (nights < 1) {
      toast.error('Booking must be at least 1 night');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      toast.success('Modification request sent successfully! The host will review your request.');
    } catch (error) {
      toast.error(error.message || 'Failed to submit modification request');
    } finally {
      setLoading(false);
    }
  };

  const calculateNewTotal = () => {
    if (!property || !formData.checkIn || !formData.checkOut) return 0;
    const nights = differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn));
    return nights * property.pricePerNight;
  };

  const getOriginalTotal = () => {
    if (!property || !booking) return 0;
    const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
    return nights * property.pricePerNight;
  };

  const priceDifference = calculateNewTotal() - getOriginalTotal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-display text-gray-900">
                Modify Booking
              </h2>
              <p className="text-gray-600 font-body mt-1">
                Request changes to your reservation
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ApperIcon name="X" className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Modification Policy */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <ApperIcon name="Info" className="h-4 w-4 mr-2" />
                Modification Policy
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Modifications must be requested at least 72 hours before check-in</p>
                <p>• Host approval is required for all modification requests</p>
                <p>• Price differences will be charged or refunded accordingly</p>
                <p>• Modification requests cannot be made for completed or cancelled bookings</p>
              </div>
              <div className="mt-3">
                <Badge 
                  variant={canModify.canModify ? "success" : "destructive"}
                  size="sm"
                >
                  {canModify.reason}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Current Booking Details */}
          <Card className="mb-6">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Current Booking</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Check-in:</span>
                  <p className="font-medium">{format(new Date(booking?.checkIn || ''), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Check-out:</span>
                  <p className="font-medium">{format(new Date(booking?.checkOut || ''), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Guests:</span>
                  <p className="font-medium">{booking?.guests} guest{booking?.guests !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <p className="font-medium">${getOriginalTotal()}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Modification Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Check-in Date
                </label>
                <Input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  disabled={!canModify.canModify}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Check-out Date
                </label>
                <Input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                  min={formData.checkIn ? format(addDays(new Date(formData.checkIn), 1), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                  disabled={!canModify.canModify}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests
              </label>
              <Input
                type="number"
                min="1"
                max={property?.maxGuests || 10}
                value={formData.guests}
                onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                disabled={!canModify.canModify}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Modification *
              </label>
              <TextArea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please explain why you need to modify your booking..."
                rows={3}
                disabled={!canModify.canModify}
                required
              />
            </div>

            {/* Price Comparison */}
            {canModify.canModify && formData.checkIn && formData.checkOut && (
              <Card className="bg-gray-50">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Price Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Original Total:</span>
                      <span>${getOriginalTotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Total:</span>
                      <span>${calculateNewTotal()}</span>
                    </div>
                    <div className={cn("flex justify-between font-semibold border-t pt-2", {
                      "text-green-600": priceDifference < 0,
                      "text-red-600": priceDifference > 0,
                      "text-gray-900": priceDifference === 0
                    })}>
                      <span>
                        {priceDifference > 0 ? 'Additional Payment:' : priceDifference < 0 ? 'Refund:' : 'No Change:'}
                      </span>
                      <span>
                        {priceDifference === 0 ? '$0' : `$${Math.abs(priceDifference)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canModify.canModify || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Send" className="h-4 w-4 mr-2" />
                    Send Modification Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}