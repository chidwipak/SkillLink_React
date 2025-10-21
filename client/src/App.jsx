import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { getProfile } from './store/slices/authSlice'
import socketService from './services/socket'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Public Pages
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetails from './pages/ServiceDetails'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerProfile from './pages/customer/CustomerProfile'
import BookingList from './pages/customer/BookingList'
import BookingDetails from './pages/customer/BookingDetails'
import OrderList from './pages/customer/OrderList'
import OrderDetails from './pages/customer/OrderDetails'
import TrackOrder from './pages/customer/TrackOrder'

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard'
import WorkerProfile from './pages/worker/WorkerProfile'
import WorkerBookings from './pages/worker/WorkerBookings'
import WorkerAvailability from './pages/worker/WorkerAvailability'
import WorkerEarnings from './pages/worker/WorkerEarnings'

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerProfile from './pages/seller/SellerProfile'
import SellerProducts from './pages/seller/SellerProducts'
import SellerOrders from './pages/seller/SellerOrders'
import SellerShop from './pages/seller/SellerShop'

// Delivery Pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard'
import DeliveryProfile from './pages/delivery/DeliveryProfile'
import DeliveryAssignments from './pages/delivery/DeliveryAssignments'
import DeliveryTracking from './pages/delivery/DeliveryTracking'
import DeliveryEarnings from './pages/delivery/DeliveryEarnings'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVerification from './pages/admin/AdminVerification'
import AdminUsers from './pages/admin/AdminUsers'
import AdminServices from './pages/admin/AdminServices'
import AdminAnalytics from './pages/admin/AdminAnalytics'

// Common Pages
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import LoadingSpinner from './components/common/LoadingSpinner'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoutes = {
      customer: '/dashboard/customer',
      worker: '/dashboard/worker',
      seller: '/dashboard/seller',
      delivery: '/dashboard/delivery',
      admin: '/dashboard/admin',
    }
    return <Navigate to={dashboardRoutes[user?.role] || '/'} replace />
  }

  return children
}

// Dashboard Redirect Component
const DashboardRedirect = () => {
  const { user } = useSelector((state) => state.auth)
  
  const dashboardRoutes = {
    customer: '/dashboard/customer',
    worker: '/dashboard/worker',
    seller: '/dashboard/seller',
    delivery: '/dashboard/delivery',
    admin: '/dashboard/admin',
  }

  return <Navigate to={dashboardRoutes[user?.role] || '/'} replace />
}

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(getProfile())
    }
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect()
      return () => socketService.disconnect()
    }
  }, [isAuthenticated])

  // Redirect logic for authenticated users
  const RedirectAuthenticatedUser = ({ children }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth)
    
    if (isAuthenticated && (user?.role === 'worker' || user?.role === 'seller' || user?.role === 'admin')) {
      const dashboardRoutes = {
        worker: '/dashboard/worker',
        seller: '/dashboard/seller',
        admin: '/dashboard/admin',
      }
      return <Navigate to={dashboardRoutes[user.role]} replace />
    }
    
    return children
  }

  return (
    <Routes>
      {/* Public Routes - Only accessible by customers and non-authenticated users */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<RedirectAuthenticatedUser><Home /></RedirectAuthenticatedUser>} />
        <Route path="/services" element={<RedirectAuthenticatedUser><Services /></RedirectAuthenticatedUser>} />
        <Route path="/services/:id" element={<RedirectAuthenticatedUser><ServiceDetails /></RedirectAuthenticatedUser>} />
        <Route path="/shop" element={<RedirectAuthenticatedUser><Shop /></RedirectAuthenticatedUser>} />
        <Route path="/product/:productName" element={<RedirectAuthenticatedUser><ProductDetail /></RedirectAuthenticatedUser>} />
        <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Dashboard Route - redirects based on role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Customer Dashboard */}
      <Route
        path="/dashboard/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="bookings" element={<BookingList />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="track/:id" element={<TrackOrder />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Worker Dashboard */}
      <Route
        path="/dashboard/worker"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WorkerDashboard />} />
        <Route path="bookings" element={<WorkerBookings />} />
        <Route path="availability" element={<WorkerAvailability />} />
        <Route path="earnings" element={<WorkerEarnings />} />
        <Route path="profile" element={<WorkerProfile />} />
      </Route>

      {/* Seller Dashboard */}
      <Route
        path="/dashboard/seller"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SellerDashboard />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="shop" element={<SellerShop />} />
        <Route path="profile" element={<SellerProfile />} />
      </Route>

      {/* Delivery Dashboard */}
      <Route
        path="/dashboard/delivery"
        element={
          <ProtectedRoute allowedRoles={['delivery']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DeliveryDashboard />} />
        <Route path="earnings" element={<DeliveryEarnings />} />
        <Route path="assignments" element={<DeliveryAssignments />} />
        <Route path="tracking" element={<DeliveryTracking />} />
        <Route path="profile" element={<DeliveryProfile />} />
      </Route>

      {/* Admin Dashboard */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="verification" element={<AdminVerification />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Common Protected Routes */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
