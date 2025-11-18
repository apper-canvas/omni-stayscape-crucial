import { bookingService } from '@/services/api/bookingService';
import { propertyService } from '@/services/api/propertyService';
import { reviewService } from '@/services/api/reviewService';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth, differenceInDays } from 'date-fns';

class AnalyticsService {
  async getHostAnalytics(period = '6months') {
    try {
      // Get period dates
      const { startDate, endDate, months } = this.getPeriodDates(period);
      
      // Get all data
      const [bookings, properties, reviews] = await Promise.all([
        bookingService.getAll(),
        propertyService.getAll(),
        reviewService.getAll()
      ]);
      
      // Filter bookings for the period
      const periodBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
      
      // Calculate metrics
      const metrics = this.calculateMetrics(periodBookings, properties, reviews);
      
      // Generate chart data
      const chartData = this.generateChartData(periodBookings, months);
      
      // Calculate property performance
      const propertyPerformance = this.calculatePropertyPerformance(bookings, properties, reviews);
      
      return {
        metrics,
        chartData,
        propertyPerformance,
        period
      };
    } catch (error) {
      console.error('Error getting host analytics:', error);
      throw new Error('Failed to load analytics data');
    }
  }
  
  getPeriodDates(period) {
    const now = new Date();
    let monthsCount;
    
    switch (period) {
      case '3months':
        monthsCount = 3;
        break;
      case '12months':
        monthsCount = 12;
        break;
      default:
        monthsCount = 6;
    }
    
    const startDate = startOfMonth(subMonths(now, monthsCount - 1));
    const endDate = endOfMonth(now);
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return { startDate, endDate, months };
  }
  
  calculateMetrics(bookings, properties, reviews) {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const twoMonthsAgo = subMonths(now, 2);
    
    // Current period metrics
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    // Calculate average rating
    const propertyIds = properties.map(p => p.Id);
    const relevantReviews = reviews.filter(review => propertyIds.includes(review.propertyId));
    const averageRating = relevantReviews.length > 0 
      ? relevantReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / relevantReviews.length 
      : 0;
    
    // Calculate occupancy rate
    const occupancyRate = this.calculateOccupancyRate(bookings, properties);
    
    // Previous month metrics for comparison
    const lastMonthBookings = bookings.filter(booking => 
      isSameMonth(new Date(booking.createdAt), lastMonth)
    );
    const twoMonthsAgoBookings = bookings.filter(booking => 
      isSameMonth(new Date(booking.createdAt), twoMonthsAgo)
    );
    
    const lastMonthTotal = lastMonthBookings.length;
    const twoMonthsAgoTotal = twoMonthsAgoBookings.length;
    const bookingsChange = twoMonthsAgoTotal > 0 
      ? ((lastMonthTotal - twoMonthsAgoTotal) / twoMonthsAgoTotal) * 100 
      : 0;
    
    const lastMonthRevenue = lastMonthBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const twoMonthsAgoRevenue = twoMonthsAgoBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const revenueChange = twoMonthsAgoRevenue > 0 
      ? ((lastMonthRevenue - twoMonthsAgoRevenue) / twoMonthsAgoRevenue) * 100 
      : 0;
    
    // Rating and occupancy changes (simplified)
    const ratingChange = Math.random() * 10 - 5; // Mock change
    const occupancyChange = Math.random() * 20 - 10; // Mock change
    
    return {
      totalBookings,
      totalRevenue,
      averageRating,
      occupancyRate,
      bookingsChange,
      revenueChange,
      ratingChange,
      occupancyChange
    };
  }
  
  calculateOccupancyRate(bookings, properties) {
    if (properties.length === 0) return 0;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const recentBookings = bookings.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      return checkIn >= thirtyDaysAgo && checkIn <= now;
    });
    
    const totalBookedDays = recentBookings.reduce((sum, booking) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return sum + differenceInDays(checkOut, checkIn);
    }, 0);
    
    const totalPossibleDays = properties.length * 30;
    
    return totalPossibleDays > 0 ? (totalBookedDays / totalPossibleDays) * 100 : 0;
  }
  
  generateChartData(bookings, months) {
    const monthLabels = months.map(month => format(month, 'MMM yyyy'));
    
    const bookingsByMonth = months.map(month => {
      return bookings.filter(booking => 
        isSameMonth(new Date(booking.createdAt), month)
      ).length;
    });
    
    const revenueByMonth = months.map(month => {
      return bookings.filter(booking => 
        isSameMonth(new Date(booking.createdAt), month)
      ).reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    });
    
    return {
      months: monthLabels,
      bookings: bookingsByMonth,
      revenue: revenueByMonth
    };
  }
  
  calculatePropertyPerformance(bookings, properties, reviews) {
    return properties.map(property => {
      const propertyBookings = bookings.filter(booking => booking.propertyId === property.Id);
      const propertyReviews = reviews.filter(review => review.propertyId === property.Id);
      
      const revenue = propertyBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const rating = propertyReviews.length > 0 
        ? propertyReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / propertyReviews.length 
        : 0;
      
      // Calculate occupancy rate for this property
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const recentBookings = propertyBookings.filter(booking => {
        const checkIn = new Date(booking.checkIn);
        return checkIn >= thirtyDaysAgo && checkIn <= now;
      });
      
      const totalBookedDays = recentBookings.reduce((sum, booking) => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        return sum + differenceInDays(checkOut, checkIn);
      }, 0);
      
      const occupancyRate = (totalBookedDays / 30) * 100;
      
      return {
        id: property.Id,
        title: property.title,
        location: property.location,
        bookings: propertyBookings.length,
        revenue,
        rating,
        occupancyRate
      };
    }).sort((a, b) => b.revenue - a.revenue); // Sort by revenue descending
  }
}

const analyticsService = new AnalyticsService();
export { analyticsService };