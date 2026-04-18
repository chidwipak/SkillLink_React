import { useSelector, useDispatch } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import toast from 'react-hot-toast'
import { updateUser } from '../../store/slices/authSlice'
import PieChart from '../../components/ui/PieChart'
import { ProgressRing, HorizontalBar, SummaryRow, SparkBars } from '../../components/ui/AnalyticsWidgets'

/* ─── Address Modal ─── */
const AddressModal = ({ show, onClose, onSave, loading }) => {
  const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: 'India' })

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
    <div className="sk-modal-overlay" onClick={onClose}>
      <div className="sk-modal" onClick={e => e.stopPropagation()}>
        <div className="sk-modal-header">
          <h3 className="sk-modal-title">📍 Shop Address Required</h3>
          <button className="sk-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="sk-modal-body">
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '20px' }}>
            Please provide your shop address for delivery purposes.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="sk-form-group">
              <label className="sk-label">Street Address *</label>
              <input type="text" className="sk-input" placeholder="Enter your shop's street address"
                value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required />
            </div>
            <div className="sk-row sk-row-2" style={{ gap: '12px', marginBottom: '12px' }}>
              <div className="sk-form-group">
                <label className="sk-label">City *</label>
                <input type="text" className="sk-input" placeholder="City"
                  value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
              </div>
              <div className="sk-form-group">
                <label className="sk-label">State *</label>
                <input type="text" className="sk-input" placeholder="State"
                  value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required />
              </div>
            </div>
            <div className="sk-row sk-row-2" style={{ gap: '12px', marginBottom: '20px' }}>
              <div className="sk-form-group">
                <label className="sk-label">ZIP Code *</label>
                <input type="text" className="sk-input" placeholder="ZIP Code"
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  required maxLength={6} />
              </div>
              <div className="sk-form-group">
                <label className="sk-label">Country</label>
                <input type="text" className="sk-input" value={address.country} disabled
                  style={{ background: '#f1f5f9' }} />
              </div>
            </div>
            <button type="submit" className="sk-btn sk-btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Address & Continue'}
            </button>
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

  useEffect(() => {
    if (stats && !user?.address?.street) setShowAddressModal(true)
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

  const orderChartData = useMemo(() => {
    if (!stats?.orders) return []
    return [
      { label: 'Delivered', value: stats.orders.delivered || 0, color: '#10b981' },
      { label: 'In Transit', value: stats.orders.inTransit || 0, color: '#6366f1' },
      { label: 'Pending', value: stats.orders.pending || 0, color: '#f59e0b' },
      { label: 'Cancelled', value: stats.orders.cancelled || 0, color: '#ef4444' },
    ].filter(item => item.value > 0)
  }, [stats?.orders])

  // Analytics computations — all hooks must be called before any early return
  const totalOrders = useMemo(() => {
    if (!stats?.orders) return 0
    return (stats.orders.delivered || 0) + (stats.orders.inTransit || 0) + (stats.orders.pending || 0) + (stats.orders.cancelled || 0)
  }, [stats?.orders])

  const revenueSparkData = useMemo(() => {
    const colors = ['#10b981', '#059669', '#34d399', '#10b981', '#047857', '#6ee7b7', '#10b981']
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      label: day,
      value: Math.max(1, Math.floor((stats?.revenue?.total || 0) / 30 + (i % 4) * 80)),
      color: colors[i]
    }))
  }, [stats])

  const getStatusBadge = (status) => {
    const map = { delivered: 'sk-badge-success', completed: 'sk-badge-success', pending: 'sk-badge-warning', processing: 'sk-badge-info', shipped: 'sk-badge-info', cancelled: 'sk-badge-danger' }
    return map[status] || 'sk-badge-default'
  }

  // Early returns — safe now since all hooks are above
  if (user?.role !== 'seller') return <Navigate to="/dashboard" />
  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="sk-dashboard">
        <div className="sk-dashboard-container">
          <div className="sk-card"><div className="sk-empty">
            <div className="sk-empty-icon">⚠️</div>
            <h3 className="sk-empty-title">{error}</h3>
            <button onClick={fetchStats} className="sk-btn sk-btn-primary" style={{ marginTop: '16px' }}>Retry</button>
          </div></div>
        </div>
      </div>
    )
  }

  // Determine highest earning product from recent orders or top products
  const topProduct = stats?.topProducts?.[0] || stats?.products?.topSelling?.[0] || null

  const fulfillmentRate = totalOrders > 0 ? Math.round(((stats?.orders?.delivered || 0) / totalOrders) * 100) : 0

  return (
    <div className="sk-dashboard">
      <div className="sk-dashboard-container">
        <AddressModal show={showAddressModal} onClose={() => setShowAddressModal(false)} onSave={handleAddressSave} loading={addressLoading} />

        {/* Header */}
        <header className="sk-dash-header sk-animate">
          <div className="sk-dash-header-left">
            <div className="sk-dash-avatar">
              <ImageWithFallback src={user?.profilePicture} alt={user?.name} type="user" />
            </div>
            <div>
              <h1 className="sk-dash-title">Seller Dashboard</h1>
              <p className="sk-dash-subtitle">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="sk-dash-actions">
            <Link to="/dashboard/seller/profile" className="sk-btn sk-btn-secondary">
              <i className="fas fa-user-edit"></i> Profile
            </Link>
            <Link to="/dashboard/seller/products" className="sk-btn sk-btn-primary">
              <i className="fas fa-box"></i> Products
            </Link>
          </div>
        </header>

        {!stats?.seller?.isVerified && (
          <div className="sk-alert sk-alert-warning">
            <i className="fas fa-exclamation-triangle"></i>
            Your shop is pending verification. You'll be able to sell once verified.
          </div>
        )}

        {/* Stats Grid */}
        <div className="sk-stats-grid">
          <div className="sk-stat-card gradient-green sk-animate sk-delay-1">
            <div className="sk-stat-icon"><i className="fas fa-rupee-sign"></i></div>
            <div className="sk-stat-value">₹{(stats?.revenue?.total || 0).toLocaleString()}</div>
            <div className="sk-stat-label">Total Revenue</div>
          </div>
          <div className="sk-stat-card gradient-blue sk-animate sk-delay-2">
            <div className="sk-stat-icon"><i className="fas fa-calendar-check"></i></div>
            <div className="sk-stat-value">₹{(stats?.revenue?.monthly || 0).toLocaleString()}</div>
            <div className="sk-stat-label">Monthly Revenue</div>
          </div>
          <div className="sk-stat-card gradient-indigo sk-animate sk-delay-3">
            <div className="sk-stat-icon"><i className="fas fa-box"></i></div>
            <div className="sk-stat-value">{stats?.products?.total || 0}</div>
            <div className="sk-stat-label">Products</div>
          </div>
          <div className="sk-stat-card gradient-amber sk-animate sk-delay-4">
            <div className="sk-stat-icon"><i className="fas fa-shopping-bag"></i></div>
            <div className="sk-stat-value">{totalOrders}</div>
            <div className="sk-stat-label">Total Orders</div>
          </div>
        </div>

        {/* Glassmorphism Revenue Highlight */}
        <div className="sk-glass-card sk-animate" style={{ marginBottom: '22px' }}>
          <div className="sk-glass-card-row">
            <div className="sk-glass-card-info">
              <h4>₹{(stats?.revenue?.total || 0).toLocaleString()} Revenue</h4>
              <p>Your shop performance at a glance</p>
            </div>
            <SparkBars data={revenueSparkData} height={36} barWidth={8} gap={4} color="#10b981" />
            <SummaryRow items={[
              { icon: 'fas fa-shopping-bag', value: totalOrders, label: 'Orders', color: '#6366f1' },
              { icon: 'fas fa-box', value: stats?.products?.total || 0, label: 'Products', color: '#f59e0b' },
              { icon: 'fas fa-truck', value: stats?.orders?.delivered || 0, label: 'Delivered', color: '#10b981' },
            ]} />
          </div>
        </div>

        {/* Performance Row */}
        <div className="sk-row sk-row-3">
          <div className="sk-card sk-animate">
            <div className="sk-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Shop Rating</p>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
                  ⭐ {stats?.seller?.rating?.toFixed(1) || 'N/A'}
                </h4>
              </div>
              <span className="sk-badge sk-badge-default">{stats?.seller?.totalRatings || 0} reviews</span>
            </div>
          </div>
          <div className="sk-card sk-animate">
            <div className="sk-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Pending Orders</p>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#f59e0b' }}>
                  {stats?.orders?.pending || 0}
                </h4>
              </div>
              <Link to="/dashboard/seller/orders" className="sk-btn sk-btn-ghost sk-btn-sm">View</Link>
            </div>
          </div>
          <div className="sk-card sk-animate">
            <div className="sk-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Fulfillment Rate</p>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#10b981' }}>
                  {fulfillmentRate}%
                </h4>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {stats?.orders?.delivered || 0} delivered
              </div>
            </div>
          </div>
        </div>

        {/* Analytics: Charts + Metrics */}
        <div className="sk-analytics-grid-2">
          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-chart-pie"></i> Order Distribution</h3>
              <span className="sk-badge sk-badge-default">{totalOrders} total</span>
            </div>
            <div className="sk-analytics-body">
              <PieChart data={orderChartData} size={180} innerRadius={0.6} showLegend={true} />
            </div>
          </div>

          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-bullseye"></i> Fulfillment Metrics</h3>
            </div>
            <div className="sk-analytics-body">
              <div className="sk-progress-ring-container">
                <ProgressRing value={stats?.orders?.delivered || 0} max={totalOrders || 1}
                  size={90} color="#10b981" label="Fulfillment" sublabel="rate" />
                <ProgressRing value={stats?.products?.total || 0} max={Math.max(stats?.products?.total || 0, 20)}
                  size={90} color="#6366f1" label="Catalog" sublabel="growth" />
              </div>
              <div style={{ marginTop: '16px' }}>
                <HorizontalBar label="Delivered" value={stats?.orders?.delivered || 0} max={totalOrders || 1} color="#10b981" />
                <HorizontalBar label="In Transit" value={stats?.orders?.inTransit || 0} max={totalOrders || 1} color="#6366f1" />
                <HorizontalBar label="Pending" value={stats?.orders?.pending || 0} max={totalOrders || 1} color="#f59e0b" />
                <HorizontalBar label="Cancelled" value={stats?.orders?.cancelled || 0} max={totalOrders || 1} color="#ef4444" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performer + Shop Info */}
        <div className="sk-row sk-row-2">
          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-trophy"></i> Top Performer</h3>
            </div>
            <div className="sk-analytics-body">
              {topProduct ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.75rem' }}>🏆</div>
                  <h4 style={{ fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>{topProduct.name}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '12px' }}>Highest Earning Product</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <div style={{ padding: '8px 16px', background: '#f0fdf4', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>₹{topProduct.price?.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Price</div>
                    </div>
                    <div style={{ padding: '8px 16px', background: '#fef3c7', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 700, color: '#d97706' }}>⭐ {topProduct.rating?.toFixed(1) || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rating</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sk-perf-grid">
                  <div className="sk-perf-item">
                    <div className="sk-perf-value" style={{ color: '#10b981' }}>{stats?.orders?.delivered || 0}</div>
                    <div className="sk-perf-label">Delivered</div>
                  </div>
                  <div className="sk-perf-item">
                    <div className="sk-perf-value" style={{ color: '#6366f1' }}>{stats?.seller?.rating?.toFixed(1) || 'N/A'}</div>
                    <div className="sk-perf-label">Rating</div>
                  </div>
                  <div className="sk-perf-item">
                    <div className="sk-perf-value" style={{ color: '#f59e0b' }}>{stats?.products?.total || 0}</div>
                    <div className="sk-perf-label">Products</div>
                  </div>
                  <div className="sk-perf-item">
                    <div className="sk-perf-value" style={{ color: '#0ea5e9' }}>{fulfillmentRate}%</div>
                    <div className="sk-perf-label">Success</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-store"></i> Shop Info</h3>
              <Link to="/dashboard/seller/shop" className="sk-btn sk-btn-ghost sk-btn-sm">Edit</Link>
            </div>
            <div className="sk-analytics-body">
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Shop Name</p>
                <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>{stats?.seller?.shopName || 'N/A'}</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Rating</p>
                <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>
                  ⭐ {stats?.seller?.rating?.toFixed(1) || 'N/A'}
                  <span style={{ color: '#64748b', marginLeft: '8px', fontWeight: 400 }}>({stats?.seller?.totalRatings || 0} reviews)</span>
                </p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Verification</p>
                <span className={`sk-badge ${stats?.seller?.isVerified ? 'sk-badge-success' : 'sk-badge-warning'}`}>
                  {stats?.seller?.isVerified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>
              <div className="sk-actions-grid">
                <Link to="/dashboard/seller/products" className="sk-action-item">
                  <div className="sk-action-icon"><i className="fas fa-plus"></i></div>
                  <span className="sk-action-label">Add Product</span>
                </Link>
                <Link to="/dashboard/seller/orders" className="sk-action-item">
                  <div className="sk-action-icon"><i className="fas fa-shopping-bag"></i></div>
                  <span className="sk-action-label">View Orders</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="sk-analytics-card sk-animate">
          <div className="sk-analytics-header">
            <h3><i className="fas fa-star"></i> Customer Reviews</h3>
            <span className="sk-badge sk-badge-default">{stats?.seller?.totalRatings || 0} total</span>
          </div>
          <div className="sk-analytics-body">
            {stats?.reviews?.length > 0 ? (
              stats.reviews.slice(0, 5).map((r, i) => (
                <div key={i} className="sk-review-item">
                  <div className="sk-review-avatar">{r.customer?.name?.charAt(0) || r.user?.name?.charAt(0) || '?'}</div>
                  <div className="sk-review-content">
                    <p className="sk-review-name">{r.customer?.name || r.user?.name || 'Customer'}</p>
                    <div className="sk-review-stars">{'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5 - Math.round(r.rating))}</div>
                    {r.comment && <p className="sk-review-text">{r.comment}</p>}
                    {r.product?.name && <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Product: {r.product.name}</p>}
                    <div className="sk-review-date">{new Date(r.createdAt || r.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="sk-empty">
                <div className="sk-empty-icon">⭐</div>
                <h4 className="sk-empty-title">No reviews yet</h4>
                <p className="sk-empty-text">Customer feedback will appear here once they rate your products</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="sk-analytics-card sk-animate">
          <div className="sk-analytics-header">
            <h3><i className="fas fa-history"></i> Recent Orders</h3>
            <Link to="/dashboard/seller/orders" className="sk-btn sk-btn-ghost sk-btn-sm">
              View all <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="sk-analytics-body" style={{ padding: 0 }}>
            {stats?.orders?.recent?.length > 0 ? (
              <table className="sk-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.orders.recent.map((order) => (
                    <tr key={order._id}>
                      <td className="sk-table-primary">{order.customer?.name}</td>
                      <td>{order.items?.length} items</td>
                      <td className="sk-table-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`sk-badge ${getStatusBadge(order.items?.[0]?.status)}`}>
                          {order.items?.[0]?.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="sk-empty" style={{ padding: '24px' }}>
                <div className="sk-empty-icon">🛒</div>
                <h4 className="sk-empty-title">No orders yet</h4>
                <p className="sk-empty-text">Orders will appear here when customers purchase your products</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard
