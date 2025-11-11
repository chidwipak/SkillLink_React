import { useSelector, useDispatch } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import toast from 'react-hot-toast'
import { updateUser } from '../../store/slices/authSlice'

// Simple Pie Chart Component
const PieChart = ({ pending, delivered }) => {
  const total = pending + delivered
  if (total === 0) return null
  
  const deliveredPct = (delivered / total) * 100
  const pendingPct = (pending / total) * 100
  
  const circumference = 2 * Math.PI * 40
  const deliveredDash = (deliveredPct / 100) * circumference
  const pendingDash = (pendingPct / 100) * circumference
  
  return (
    <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap">
      <div className="position-relative" style={{ width: '120px', height: '120px' }}>
        <svg viewBox="0 0 100 100" className="w-100 h-100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e9ecef" strokeWidth="16" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#212529" strokeWidth="16"
            strokeDasharray={`${deliveredDash} ${circumference}`} transform="rotate(-90 50 50)" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#6c757d" strokeWidth="16"
            strokeDasharray={`${pendingDash} ${circumference}`} strokeDashoffset={-deliveredDash}
            transform="rotate(-90 50 50)" />
        </svg>
        <div className="position-absolute top-50 start-50 translate-middle text-center">
          <div className="fw-bold">₹{(total/1000).toFixed(1)}K</div>
          <div className="text-muted small">Total</div>
        </div>
      </div>
      <div>
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#212529' }}></div>
          <span className="small">Delivered: ₹{delivered.toLocaleString()} ({deliveredPct.toFixed(0)}%)</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#6c757d' }}></div>
          <span className="small">Pending: ₹{pending.toLocaleString()} ({pendingPct.toFixed(0)}%)</span>
        </div>
      </div>
    </div>
  )
}

// Address Modal Component
const AddressModal = ({ show, onClose, onSave, loading }) => {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      toast.error('All address fields are required')
      return
    }
    onSave(address)
  }

  if (!show) return null

  return (
    <div 
      className="modal d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <div className="text-center w-100">
              <div 
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '50%'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>📍</span>
              </div>
              <h5 className="modal-title fw-bold">Shop Address Required</h5>
              <p className="text-muted small mt-1">
                Please provide your shop address to continue. This is required for delivery purposes.
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body pt-0">
              <div className="mb-3">
                <label className="form-label small fw-medium">Street Address *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your shop's street address"
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  required
                />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-medium">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-medium">State *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small fw-medium">ZIP Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ZIP Code"
                    value={address.zipCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0,6)
                      setAddress({...address, zipCode: val})
                    }}
                    required
                    maxLength={6}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-medium">Country</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={address.country}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  'Save Address & Continue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const SellerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchStats()
  }, [])

  // Check if seller needs to add address after stats are loaded
  useEffect(() => {
    if (stats && !user?.address?.street) {
      setShowAddressModal(true)
    }
  }, [stats, user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/dashboard/seller/stats')
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSave = async (address) => {
    try {
      setAddressLoading(true)
      const response = await api.put('/auth/profile', { address })
      
      if (response.data.success) {
        dispatch(updateUser(response.data.user))
        toast.success('Address saved successfully!')
        setShowAddressModal(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address')
    } finally {
      setAddressLoading(false)
    }
  }

  if (user?.role !== 'seller') {
    return <Navigate to="/dashboard" />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <p className="text-danger mb-4">{error}</p>
        <button onClick={fetchStats} className="btn btn-primary">Retry</button>
      </div>
    )
  }

  const deliveredRevenue = stats?.revenue?.delivered || 0
  const pendingRevenue = stats?.revenue?.pending || 0

  return (
    <div className="container-fluid">
      {/* Address Modal */}
      <AddressModal 
        show={showAddressModal} 
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressSave}
        loading={addressLoading}
      />

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
            <h4 className="mb-1 fw-semibold">Seller Dashboard</h4>
            <p className="text-muted mb-0 small">Manage your shop and track sales</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link to="/dashboard/seller/profile" className="btn btn-outline-primary btn-sm">
            ✏️ Edit Profile
          </Link>
          <Link to="/dashboard/seller/products" className="btn btn-outline-secondary btn-sm">Products</Link>
          <Link to="/dashboard/seller/orders" className="btn btn-outline-secondary btn-sm">Orders</Link>
        </div>
      </div>

      {!stats?.seller?.isVerified && (
        <div className="alert alert-warning py-2 mb-4 small">
          Your shop is pending verification. You'll be able to sell once verified.
        </div>
      )}

      {/* Stats Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>📦</span>
              </div>
              <p className="text-muted small mb-0">Products</p>
            </div>
            <h3 className="mb-1 fw-bold">{stats?.products?.total || 0}</h3>
            <small className="text-muted">{stats?.products?.active || 0} in stock</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>⏳</span>
              </div>
              <p className="text-muted small mb-0">Pending Orders</p>
            </div>
            <h3 className="mb-1 fw-bold">{stats?.orders?.pending || 0}</h3>
            <small className="text-muted">awaiting action</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>✓</span>
              </div>
              <p className="text-muted small mb-0">Delivered</p>
            </div>
            <h3 className="mb-1 fw-bold">{stats?.orders?.delivered || 0}</h3>
            <small className="text-muted">of {stats?.orders?.total || 0} total</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>💰</span>
              </div>
              <p className="text-muted small mb-0">Total Revenue</p>
            </div>
            <h3 className="mb-1 fw-bold">₹{(stats?.revenue?.total || 0).toLocaleString()}</h3>
            <small className="text-muted">This month: ₹{(stats?.revenue?.monthly || 0).toLocaleString()}</small>
          </div>
        </div>
      </div>

      {/* Revenue Chart & Shop Info */}
      <div className="row g-4 mb-4">
        {(deliveredRevenue > 0 || pendingRevenue > 0) && (
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent py-3">
                <h6 className="mb-0 fw-semibold">Revenue Breakdown</h6>
              </div>
              <div className="card-body d-flex align-items-center justify-content-center">
                <PieChart pending={pendingRevenue} delivered={deliveredRevenue} />
              </div>
            </div>
          </div>
        )}
        <div className={`col-md-${(deliveredRevenue > 0 || pendingRevenue > 0) ? '6' : '12'}`}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold">Shop Info</h6>
              <Link to="/dashboard/seller/shop" className="text-decoration-none small">Edit →</Link>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <span className="text-muted small d-block">Shop Name</span>
                <span className="fw-medium">{stats?.seller?.shopName}</span>
              </div>
              <div className="mb-3">
                <span className="text-muted small d-block">Rating</span>
                <span className="fw-medium">⭐ {stats?.seller?.rating?.toFixed(1) || 'N/A'} 
                  <span className="text-muted ms-1 small">({stats?.seller?.totalRatings || 0} reviews)</span>
                </span>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/dashboard/seller/products" className="btn btn-sm btn-outline-secondary">
                  Add Product
                </Link>
                <Link to="/dashboard/seller/orders" className="btn btn-sm btn-outline-secondary">
                  View Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
          <h6 className="mb-0 fw-semibold">Recent Orders</h6>
          <Link to="/dashboard/seller/orders" className="text-decoration-none small">View all →</Link>
        </div>
        <div className="card-body p-0">
          {stats?.orders?.recent?.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="fw-medium">Customer</th>
                    <th className="fw-medium">Items</th>
                    <th className="fw-medium">Date</th>
                    <th className="fw-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.orders.recent.map((order) => (
                    <tr key={order._id}>
                      <td>{order.customer?.name}</td>
                      <td>{order.items?.length} items</td>
                      <td className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge rounded-pill ${
                          order.items?.[0]?.status === 'delivered' ? 'bg-success' :
                          order.items?.[0]?.status === 'cancelled' ? 'bg-danger' :
                          'bg-warning text-dark'
                        }`}>
                          {order.items?.[0]?.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-1">No orders yet</p>
              <small className="text-muted">Orders will appear here when customers purchase your products</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard
