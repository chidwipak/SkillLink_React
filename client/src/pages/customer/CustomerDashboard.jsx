import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageWithFallback from '../../components/common/ImageWithFallback'

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/customer/stats')
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'customer') {
    return <Navigate to="/dashboard" />
  }

  if (loading && !stats) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <p className="text-danger mb-4">{error}</p>
        <button onClick={fetchStats} className="btn btn-primary">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      {/* Header with Profile Quick Access */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle overflow-hidden" style={{ width: '50px', height: '50px', border: '2px solid #e2e8f0' }}>
            <ImageWithFallback
              src={user?.profilePicture}
              alt={user?.name}
              type="user"
              className="w-100 h-100 object-fit-cover"
            />
          </div>
          <div>
            <h4 className="mb-1 fw-semibold">Welcome back, {user?.name?.split(' ')[0]}!</h4>
            <p className="text-muted mb-0 small">Here's what's happening with your account</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link to="/dashboard/customer/profile" className="btn btn-outline-primary btn-sm">
            ✏️ Edit Profile
          </Link>
          <Link to="/services" className="btn btn-primary btn-sm">
            Book Service
          </Link>
          <Link to="/shop" className="btn btn-outline-secondary btn-sm">
            Shop
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>📅</span>
              </div>
              <p className="text-muted small mb-0">Active Bookings</p>
            </div>
            <h3 className="mb-1 fw-bold">{stats?.bookings?.pending || 0}</h3>
            <small className="text-muted">of {stats?.bookings?.total || 0} total</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>📦</span>
              </div>
              <p className="text-muted small mb-0">Pending Orders</p>
            </div>
            <h3 className="mb-1 fw-bold">{stats?.orders?.pending || 0}</h3>
            <small className="text-muted">of {stats?.orders?.total || 0} total</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>✓</span>
              </div>
              <p className="text-muted small mb-0">Completed</p>
            </div>
            <h3 className="mb-1 fw-bold">{stats?.bookings?.completed || 0}</h3>
            <small className="text-muted">bookings done</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>💰</span>
              </div>
              <p className="text-muted small mb-0">Total Spent</p>
            </div>
            <h3 className="mb-1 fw-bold">₹{(stats?.totalSpent || 0).toLocaleString()}</h3>
            <small className="text-muted">{stats?.orders?.delivered || 0} orders delivered</small>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row g-4">
        {/* Recent Bookings */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
              <h6 className="mb-0 fw-semibold">Recent Bookings</h6>
              <Link to="/dashboard/customer/bookings" className="text-decoration-none small">
                View all →
              </Link>
            </div>
            <div className="card-body p-0">
              {stats?.bookings?.recent?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.bookings.recent.map((booking) => (
                    <div key={booking._id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                      <div>
                        <p className="mb-1 fw-medium">{booking.service?.name}</p>
                        <small className="text-muted">
                          {booking.worker?.name && `${booking.worker.name} • `}
                          {new Date(booking.date).toLocaleDateString()}
                        </small>
                      </div>
                      <span className={`badge rounded-pill ${
                        booking.status === 'completed' ? 'bg-success' :
                        booking.status === 'pending' ? 'bg-warning text-dark' :
                        booking.status === 'accepted' ? 'bg-info' :
                        'bg-secondary'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted mb-2">No bookings yet</p>
                  <Link to="/services" className="btn btn-sm btn-outline-primary">Book a Service</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
              <h6 className="mb-0 fw-semibold">Recent Orders</h6>
              <Link to="/dashboard/customer/orders" className="text-decoration-none small">
                View all →
              </Link>
            </div>
            <div className="card-body p-0">
              {stats?.orders?.recent?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.orders.recent.map((order) => (
                    <div key={order._id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                      <div>
                        <p className="mb-1 fw-medium">Order #{order.orderNumber}</p>
                        <small className="text-muted">
                          {order.items?.length} items • {new Date(order.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="text-end">
                        <p className="mb-1 fw-semibold">₹{order.total || order.totalAmount}</p>
                        <span className={`badge rounded-pill ${
                          order.status === 'delivered' ? 'bg-success' :
                          order.status === 'cancelled' ? 'bg-danger' :
                          order.status === 'out_for_delivery' ? 'bg-info' :
                          'bg-warning text-dark'
                        }`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted mb-2">No orders yet</p>
                  <Link to="/shop" className="btn btn-sm btn-outline-primary">Shop Now</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
