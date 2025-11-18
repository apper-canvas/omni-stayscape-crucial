import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { analyticsService } from '@/services/api/analyticsService';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Chart from 'react-apexcharts';

const HostAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getHostAnalytics(selectedPeriod);
      setAnalytics(data);
      toast.success('Analytics loaded successfully');
    } catch (err) {
      const errorMessage = err.message || 'Failed to load analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getPercentageColor = (value) => {
    if (value === null || value === undefined) return 'text-gray-500';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadAnalytics} />;
  if (!analytics) return <ErrorView message="No analytics data available" onRetry={loadAnalytics} />;

  const chartOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    colors: ['#2C7A7B', '#ED8936'],
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories: analytics.chartData.months,
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 5,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontWeight: 500,
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
      },
    },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-gray-600 font-body">
            Track your property performance and earnings
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 font-body">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {analytics.metrics.totalBookings}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ApperIcon name="Calendar" size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ApperIcon 
              name={analytics.metrics.bookingsChange >= 0 ? "TrendingUp" : "TrendingDown"} 
              size={16} 
              className={getPercentageColor(analytics.metrics.bookingsChange)}
            />
            <span className={`ml-2 text-sm font-medium ${getPercentageColor(analytics.metrics.bookingsChange)}`}>
              {formatPercentage(analytics.metrics.bookingsChange)} from last month
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 font-body">Revenue Earned</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {formatCurrency(analytics.metrics.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ApperIcon name="DollarSign" size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ApperIcon 
              name={analytics.metrics.revenueChange >= 0 ? "TrendingUp" : "TrendingDown"} 
              size={16} 
              className={getPercentageColor(analytics.metrics.revenueChange)}
            />
            <span className={`ml-2 text-sm font-medium ${getPercentageColor(analytics.metrics.revenueChange)}`}>
              {formatPercentage(analytics.metrics.revenueChange)} from last month
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 font-body">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {analytics.metrics.averageRating ? analytics.metrics.averageRating.toFixed(1) : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <ApperIcon name="Star" size={24} className="text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ApperIcon 
              name={analytics.metrics.ratingChange >= 0 ? "TrendingUp" : "TrendingDown"} 
              size={16} 
              className={getPercentageColor(analytics.metrics.ratingChange)}
            />
            <span className={`ml-2 text-sm font-medium ${getPercentageColor(analytics.metrics.ratingChange)}`}>
              {formatPercentage(analytics.metrics.ratingChange)} from last month
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 font-body">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                {analytics.metrics.occupancyRate ? `${analytics.metrics.occupancyRate.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ApperIcon name="Home" size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ApperIcon 
              name={analytics.metrics.occupancyChange >= 0 ? "TrendingUp" : "TrendingDown"} 
              size={16} 
              className={getPercentageColor(analytics.metrics.occupancyChange)}
            />
            <span className={`ml-2 text-sm font-medium ${getPercentageColor(analytics.metrics.occupancyChange)}`}>
              {formatPercentage(analytics.metrics.occupancyChange)} from last month
            </span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
            Booking Trends
          </h3>
          <Chart
            options={chartOptions}
            series={[
              {
                name: 'Bookings',
                data: analytics.chartData.bookings,
              },
            ]}
            type="area"
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
            Revenue Trends
          </h3>
          <Chart
            options={{
              ...chartOptions,
              yaxis: {
                ...chartOptions.yaxis,
                labels: {
                  ...chartOptions.yaxis.labels,
                  formatter: (value) => formatCurrency(value),
                },
              },
            }}
            series={[
              {
                name: 'Revenue',
                data: analytics.chartData.revenue,
              },
            ]}
            type="area"
            height={300}
          />
        </Card>
      </div>

      {/* Property Performance Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
          Property Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.propertyPerformance.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {property.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(property.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ApperIcon name="Star" size={16} className="text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {property.rating ? property.rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.occupancyRate ? `${property.occupancyRate.toFixed(1)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default HostAnalytics;