import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "@/components/organisms/Layout";

// Lazy load all page components
const BrowseProperties = lazy(() => import("@/components/pages/BrowseProperties"));
const MyListings = lazy(() => import("@/components/pages/MyListings"));
const BookingRequests = lazy(() => import("@/components/pages/BookingRequests"));
const MyBookings = lazy(() => import("@/components/pages/MyBookings"));
const PropertyDetail = lazy(() => import("@/components/pages/PropertyDetail"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Loading component for suspense
const SuspenseLoader = ({ children }) => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    </div>
  }>
    {children}
  </Suspense>
);

// Main routes configuration
const mainRoutes = [
  {
    path: "",
    index: true,
    element: <SuspenseLoader><BrowseProperties /></SuspenseLoader>
  },
  {
    path: "my-listings",
    element: <SuspenseLoader><MyListings /></SuspenseLoader>
  },
  {
path: "my-bookings", 
    element: <SuspenseLoader><MyBookings /></SuspenseLoader>
  },
  {
    path: "booking-requests", 
    element: <SuspenseLoader><BookingRequests /></SuspenseLoader>
  },
  {
    path: "property/:id",
    element: <SuspenseLoader><PropertyDetail /></SuspenseLoader>
  },
  {
    path: "*",
    element: <SuspenseLoader><NotFound /></SuspenseLoader>
  }
];

// Router configuration
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
];

export const router = createBrowserRouter(routes);