import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Layout from "@/components/organisms/Layout";

// Lazy load all page components
const BrowseProperties = lazy(() => import("@/components/pages/BrowseProperties"));
const MyListings = lazy(() => import("@/components/pages/MyListings"));
const BookingRequests = lazy(() => import("@/components/pages/BookingRequests"));
const MyBookings = lazy(() => import("@/components/pages/MyBookings"));
const PropertyDetail = lazy(() => import("@/components/pages/PropertyDetail"));
const MyWishlist = lazy(() => import("@/components/pages/MyWishlist"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));
const Messages = lazy(() => import("@/components/pages/Messages"));
const GuestProfile = lazy(() => import("@/components/pages/GuestProfile"));
const HostAnalytics = lazy(() => import("@/components/pages/HostAnalytics"));
// Loading component for suspense
const SuspenseLoader = ({ children }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    element: (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>}>
        <BrowseProperties />
      </Suspense>
    )
  },
  {
    path: "analytics",
    element: (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>}>
        <HostAnalytics />
      </Suspense>
    )
  },
  {
    path: "",
    element: <SuspenseLoader><BrowseProperties /></SuspenseLoader>
  },
  {
    path: "my-listings",
element: <SuspenseLoader><MyListings /></SuspenseLoader>
  },
  {
    path: "my-wishlist",
    element: <SuspenseLoader><MyWishlist /></SuspenseLoader>
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
    path: "messages",
    element: <SuspenseLoader><Messages /></SuspenseLoader>
  },
  {
    path: "property/:id",
    element: <SuspenseLoader><PropertyDetail /></SuspenseLoader>
  },
  {
    path: "guest-profile/:guestName",
    element: <SuspenseLoader><GuestProfile /></SuspenseLoader>
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