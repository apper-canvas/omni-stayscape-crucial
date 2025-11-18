import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { propertyService } from '@/services/api/propertyService';

const AvailabilityCalendar = ({ 
  propertyId, 
  mode = 'view', // 'view' for guests, 'manage' for hosts
  onDateSelect = null // callback for guest date selection
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, [propertyId, currentDate]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const availabilityData = await propertyService.getAvailability(propertyId, 
        currentDate.getFullYear(), 
        currentDate.getMonth()
      );
      setAvailability(availabilityData);
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const getDatesInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const datesInMonth = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      datesInMonth.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      datesInMonth.push(new Date(year, month, day));
    }

    return datesInMonth;
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getDateStatus = (date) => {
    if (!date) return 'empty';
    const dateKey = formatDateKey(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return 'past';
    
    const status = availability[dateKey];
    if (status === 'blocked') return 'blocked';
    if (status === 'booked') return 'booked';
    if (status === 'available') return 'available';
    
    return mode === 'manage' ? 'unset' : 'unavailable';
  };

  const handleDateClick = async (date) => {
    if (!date || getDateStatus(date) === 'past') return;

    if (mode === 'manage') {
      const dateKey = formatDateKey(date);
      const currentStatus = availability[dateKey] || 'unset';
      let newStatus;

      if (currentStatus === 'available') {
        newStatus = 'blocked';
      } else {
        newStatus = 'available';
      }

      try {
        await propertyService.updateAvailability(propertyId, dateKey, newStatus);
        setAvailability(prev => ({
          ...prev,
          [dateKey]: newStatus
        }));
        toast.success(`Date ${newStatus === 'available' ? 'made available' : 'blocked'}`);
      } catch (error) {
        toast.error('Failed to update availability');
      }
    } else if (mode === 'view' && onDateSelect) {
      const status = getDateStatus(date);
      if (status === 'available') {
        onDateSelect(date);
      }
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDateClasses = (date) => {
    const status = getDateStatus(date);
    const baseClasses = "w-10 h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200";
    
    switch (status) {
      case 'empty':
        return `${baseClasses} invisible`;
      case 'past':
        return `${baseClasses} text-gray-300 cursor-not-allowed`;
      case 'available':
        return `${baseClasses} bg-green-100 text-green-700 hover:bg-green-200 border border-green-300`;
      case 'blocked':
        return `${baseClasses} bg-red-100 text-red-700 hover:bg-red-200 border border-red-300`;
      case 'booked':
        return `${baseClasses} bg-blue-100 text-blue-700 border border-blue-300`;
      case 'unset':
        return `${baseClasses} text-gray-500 hover:bg-gray-100 border border-gray-200`;
      case 'unavailable':
        return `${baseClasses} text-gray-400 cursor-not-allowed bg-gray-50`;
      default:
        return `${baseClasses} text-gray-500 hover:bg-gray-100`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 font-display">
          {mode === 'manage' ? 'Manage Availability' : 'Available Dates'}
        </h3>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth(-1)}
            className="p-2"
          >
            <ApperIcon name="ChevronLeft" size={16} />
          </Button>
          <span className="font-medium text-gray-900 min-w-[120px] text-center font-body">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth(1)}
            className="p-2"
          >
            <ApperIcon name="ChevronRight" size={16} />
          </Button>
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs font-body">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-600">Blocked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-gray-600">Booked</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2 font-body">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {getDatesInMonth(currentDate).map((date, index) => (
          <div
            key={index}
            className={getDateClasses(date)}
            onClick={() => handleDateClick(date)}
          >
            {date?.getDate()}
          </div>
        ))}
      </div>

      {mode === 'manage' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-body">
            <strong>Tip:</strong> Click on dates to toggle between available and blocked. 
            Green dates are available for booking, red dates are blocked.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;