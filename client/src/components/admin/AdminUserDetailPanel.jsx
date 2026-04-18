import { useState, useEffect, useMemo } from 'react'
import api from '../../services/api'
import PieChart from '../ui/PieChart'
import LoadingSpinner from '../common/LoadingSpinner'

const BASE_URL = 'http://localhost:5005'

const AdminUserDetailPanel = ({ userId, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)
    setActiveSection('overview')
    api.get(`/admin/users/${userId}`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch user details'))
      .finally(() => setLoading(false))
  }, [userId])

  if (!userId) return null

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
  const formatCurrency = (v) => `₹${(v || 0).toLocaleString()}`
  const formatStatus = (s) => s?.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'N/A'

  const getStatusBadge = (status) => {
    const map = {
      pending: 'sk-badge-warning', accepted: 'sk-badge-info', 'in-progress': 'sk-badge-indigo',
      in_progress: 'sk-badge-indigo', completed: 'sk-badge-success', cancelled: 'sk-badge-danger',
      rejected: 'sk-badge-danger', delivered: 'sk-badge-success', confirmed: 'sk-badge-info',
      assigned_delivery: 'sk-badge-indigo', out_for_delivery: 'sk-badge-indigo', returned: 'sk-badge-danger',
      processing: 'sk-badge-info'
    }
    return map[status] || 'sk-badge-default'
  }

  const getRoleColor = (role) => {
    const map = { customer: '#6366f1', worker: '#0ea5e9', seller: '#10b981', delivery: '#f59e0b', admin: '#ef4444', verifier: '#8b5cf6' }
    return map[role] || '#64748b'
  }

  const getRoleIcon = (role) => {
    const map = { customer: 'fa-user', worker: 'fa-tools', seller: 'fa-store', delivery: 'fa-truck', admin: 'fa-crown', verifier: 'fa-shield-alt' }
    return map[role] || 'fa-user'
  }

  const imgSrc = (path) => {
    if (!path || path === '/images/default-profile.png') return null
    return path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
  }

  // ============ ROLE-SPECIFIC RENDERERS ============

  const renderCustomerDashboard = () => {
    const s = data.stats || {}
    const bookingData = [
      { label: 'Completed', value: s.bookings?.completed || 0, color: '#10b981' },
      { label: 'Pending', value: s.bookings?.pending || 0, color: '#f59e0b' },
      { label: 'Cancelled', value: s.bookings?.cancelled || 0, color: '#ef4444' },
    ].filter(i => i.value > 0)

    const orderData = [
      { label: 'Delivered', value: s.orders?.delivered || 0, color: '#10b981' },
      { label: 'Pending', value: s.orders?.pending || 0, color: '#f59e0b' },
    ].filter(i => i.value > 0)

    return (
      <>
        {/* Customer Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <StatMini icon="fa-calendar-check" label="Total Bookings" value={s.bookings?.total || 0} color="#6366f1" />
          <StatMini icon="fa-shopping-bag" label="Total Orders" value={s.orders?.total || 0} color="#0ea5e9" />
          <StatMini icon="fa-rupee-sign" label="Total Spent" value={formatCurrency(s.totalSpent)} color="#10b981" />
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="sk-card" style={{ margin: 0 }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-chart-pie"></i> Bookings</h4></div>
            <div className="sk-card-body" style={{ padding: '12px', textAlign: 'center' }}>
              {bookingData.length > 0 ? <PieChart data={bookingData} size={120} innerRadius={0.6} showLegend /> : <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No bookings</p>}
            </div>
          </div>
          <div className="sk-card" style={{ margin: 0 }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-chart-pie"></i> Orders</h4></div>
            <div className="sk-card-body" style={{ padding: '12px', textAlign: 'center' }}>
              {orderData.length > 0 ? <PieChart data={orderData} size={120} innerRadius={0.6} showLegend /> : <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No orders</p>}
            </div>
          </div>
        </div>

        {/* Spending breakdown */}
        <div className="sk-card" style={{ margin: '0 0 16px' }}>
          <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-wallet"></i> Spending Breakdown</h4></div>
          <div className="sk-card-body" style={{ padding: '12px' }}>
            <div className="sk-perf-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#6366f1', fontSize: '1.1rem' }}>{formatCurrency(s.bookingSpent)}</div><div className="sk-perf-label">On Services</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#0ea5e9', fontSize: '1.1rem' }}>{formatCurrency(s.orderSpent)}</div><div className="sk-perf-label">On Products</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#10b981', fontSize: '1.1rem' }}>{formatCurrency(s.totalSpent)}</div><div className="sk-perf-label">Grand Total</div></div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        {s.bookings?.recent?.length > 0 && (
          <div className="sk-card" style={{ margin: '0 0 16px' }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-history"></i> Recent Bookings</h4></div>
            <div className="sk-card-body no-padding">
              <div className="sk-activity-list">
                {s.bookings.recent.map(b => (
                  <div key={b._id} className="sk-activity-item" style={{ padding: '10px 16px' }}>
                    <div className="sk-activity-icon" style={{ background: '#6366f115', color: '#6366f1', width: '32px', height: '32px', fontSize: '0.7rem' }}><i className="fas fa-tools"></i></div>
                    <div className="sk-activity-content" style={{ flex: 1, minWidth: 0 }}>
                      <p className="sk-activity-title" style={{ fontSize: '0.8rem' }}>{b.service?.name || 'Service Booking'}</p>
                      <p className="sk-activity-meta" style={{ fontSize: '0.7rem' }}>Worker: {b.worker?.name || 'N/A'} • {formatDate(b.createdAt)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`sk-badge ${getStatusBadge(b.status)}`} style={{ fontSize: '0.65rem' }}>{formatStatus(b.status)}</span>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '2px 0 0' }}>{formatCurrency(b.finalPrice || b.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {s.orders?.recent?.length > 0 && (
          <div className="sk-card" style={{ margin: 0 }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-box"></i> Recent Orders</h4></div>
            <div className="sk-card-body no-padding">
              <div className="sk-activity-list">
                {s.orders.recent.map(o => (
                  <div key={o._id} className="sk-activity-item" style={{ padding: '10px 16px' }}>
                    <div className="sk-activity-icon" style={{ background: '#10b98115', color: '#10b981', width: '32px', height: '32px', fontSize: '0.7rem' }}><i className="fas fa-box"></i></div>
                    <div className="sk-activity-content" style={{ flex: 1, minWidth: 0 }}>
                      <p className="sk-activity-title" style={{ fontSize: '0.8rem' }}>{o.orderNumber || `Order #${o._id?.slice(-6)}`}</p>
                      <p className="sk-activity-meta" style={{ fontSize: '0.7rem' }}>{o.items?.length || 0} item(s) • {formatDate(o.createdAt)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`sk-badge ${getStatusBadge(o.status)}`} style={{ fontSize: '0.65rem' }}>{formatStatus(o.status)}</span>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '2px 0 0' }}>{formatCurrency(o.totalAmount || o.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  const renderWorkerDashboard = () => {
    const s = data.stats || {}
    const rd = data.roleDetails || {}
    const bookingData = [
      { label: 'Completed', value: s.bookings?.completed || 0, color: '#10b981' },
      { label: 'Pending', value: s.bookings?.pending || 0, color: '#f59e0b' },
      { label: 'Cancelled', value: s.bookings?.cancelled || 0, color: '#ef4444' },
    ].filter(i => i.value > 0)

    return (
      <>
        {/* Availability + Verification Badges */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
            borderRadius: '24px', fontSize: '0.8rem', fontWeight: 600,
            background: s.isAvailable ? '#dcfce7' : '#fee2e2', color: s.isAvailable ? '#16a34a' : '#dc2626'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.isAvailable ? '#16a34a' : '#dc2626', display: 'inline-block' }}></span>
            {s.isAvailable ? 'Available' : 'Unavailable'}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
            borderRadius: '24px', fontSize: '0.8rem', fontWeight: 600,
            background: s.isVerified ? '#dbeafe' : '#fef3c7', color: s.isVerified ? '#2563eb' : '#d97706'
          }}>
            <i className={`fas ${s.isVerified ? 'fa-check-circle' : 'fa-clock'}`}></i>
            {s.isVerified ? 'Verified' : 'Unverified'}
          </span>
        </div>

        {/* Worker Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <StatMini icon="fa-briefcase" label="Total Jobs" value={s.bookings?.total || 0} color="#6366f1" />
          <StatMini icon="fa-check-circle" label="Completed" value={s.bookings?.completed || 0} color="#10b981" />
          <StatMini icon="fa-rupee-sign" label="Total Earnings" value={formatCurrency(s.earnings?.total)} color="#059669" />
          <StatMini icon="fa-calendar" label="This Month" value={formatCurrency(s.earnings?.monthly)} color="#0ea5e9" />
        </div>

        {/* Rating + Chart Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="sk-card" style={{ margin: 0 }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-star"></i> Rating</h4></div>
            <div className="sk-card-body" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>
                {(s.rating || 0).toFixed(1)}
              </div>
              <div style={{ color: '#f59e0b', fontSize: '1rem', margin: '4px 0' }}>
                {[1,2,3,4,5].map(i => <i key={i} className={`fas fa-star`} style={{ opacity: i <= Math.round(s.rating || 0) ? 1 : 0.2 }}></i>)}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.totalRatings || 0} review(s)</p>
            </div>
          </div>
          <div className="sk-card" style={{ margin: 0 }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-chart-pie"></i> Job Status</h4></div>
            <div className="sk-card-body" style={{ padding: '12px', textAlign: 'center' }}>
              {bookingData.length > 0 ? <PieChart data={bookingData} size={110} innerRadius={0.6} showLegend /> : <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No jobs</p>}
            </div>
          </div>
        </div>

        {/* Skills */}
        {rd.skills?.length > 0 && (
          <div className="sk-card" style={{ margin: '0 0 16px' }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-cogs"></i> Skills & Category</h4></div>
            <div className="sk-card-body" style={{ padding: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>Category: <strong style={{ textTransform: 'capitalize', color: '#0ea5e9' }}>{rd.serviceCategory || 'N/A'}</strong></p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {rd.skills.map((skill, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: '16px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 600 }}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        {s.bookings?.recent?.length > 0 && (
          <div className="sk-card" style={{ margin: '0 0 16px' }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-history"></i> Recent Jobs</h4></div>
            <div className="sk-card-body no-padding">
              <div className="sk-activity-list">
                {s.bookings.recent.map(b => (
                  <div key={b._id} className="sk-activity-item" style={{ padding: '10px 16px' }}>
                    <div className="sk-activity-icon" style={{ background: '#0ea5e915', color: '#0ea5e9', width: '32px', height: '32px', fontSize: '0.7rem' }}><i className="fas fa-tools"></i></div>
                    <div className="sk-activity-content" style={{ flex: 1, minWidth: 0 }}>
                      <p className="sk-activity-title" style={{ fontSize: '0.8rem' }}>{b.service?.name || 'Service'}</p>
                      <p className="sk-activity-meta" style={{ fontSize: '0.7rem' }}>Customer: {b.customer?.name || 'N/A'} • {formatDate(b.createdAt)}</p>
                    </div>
                    <span className={`sk-badge ${getStatusBadge(b.status)}`} style={{ fontSize: '0.65rem' }}>{formatStatus(b.status)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {s.reviews?.length > 0 && (
          <div className="sk-card" style={{ margin: 0 }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-comments"></i> Recent Reviews</h4></div>
            <div className="sk-card-body" style={{ padding: '12px' }}>
              {s.reviews.slice(0, 5).map((r, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < s.reviews.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b' }}>{r.customer?.name || 'Customer'}</span>
                    <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>{[...Array(5)].map((_, j) => <i key={j} className="fas fa-star" style={{ opacity: j < r.rating ? 1 : 0.2 }}></i>)}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{r.comment || 'No comment'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    )
  }

  const renderSellerDashboard = () => {
    const s = data.stats || {}
    const rd = data.roleDetails || {}

    const orderData = [
      { label: 'Delivered', value: s.orders?.delivered || 0, color: '#10b981' },
      { label: 'Pending', value: s.orders?.pending || 0, color: '#f59e0b' },
    ].filter(i => i.value > 0)

    const revenueData = [
      { label: 'Total Revenue', value: s.revenue?.total || 0, color: '#10b981' },
      { label: 'Monthly Revenue', value: s.revenue?.monthly || 0, color: '#0ea5e9' },
    ].filter(i => i.value > 0)

    return (
      <>
        {/* Shop Info */}
        <div style={{
          padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
          background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #a7f3d0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 700, color: '#065f46', fontSize: '1rem' }}><i className="fas fa-store" style={{ marginRight: '8px' }}></i>{s.shopName || rd.shopName || 'Shop'}</p>
              <p style={{ fontSize: '0.75rem', color: '#047857' }}>{rd.businessDescription || 'No description'}</p>
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600,
              background: s.isVerified ? '#dbeafe' : '#fef3c7', color: s.isVerified ? '#2563eb' : '#d97706'
            }}>
              {s.isVerified ? '✅ Verified' : '⏳ Unverified'}
            </span>
          </div>
        </div>

        {/* Seller Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <StatMini icon="fa-box-open" label="Total Products" value={s.products?.total || 0} color="#6366f1" />
          <StatMini icon="fa-check" label="Active Products" value={s.products?.active || 0} color="#10b981" />
          <StatMini icon="fa-rupee-sign" label="Total Revenue" value={formatCurrency(s.revenue?.total)} color="#059669" />
          <StatMini icon="fa-calendar" label="Monthly Revenue" value={formatCurrency(s.revenue?.monthly)} color="#0ea5e9" />
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="sk-card" style={{ margin: 0 }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-chart-pie"></i> Orders</h4></div>
            <div className="sk-card-body" style={{ padding: '12px', textAlign: 'center' }}>
              {orderData.length > 0 ? <PieChart data={orderData} size={110} innerRadius={0.6} showLegend /> : <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No orders</p>}
            </div>
          </div>
          <div className="sk-card" style={{ margin: 0 }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-star"></i> Rating</h4></div>
            <div className="sk-card-body" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>{(s.rating || 0).toFixed(1)}</div>
              <div style={{ color: '#f59e0b', fontSize: '1rem', margin: '4px 0' }}>
                {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star" style={{ opacity: i <= Math.round(s.rating || 0) ? 1 : 0.2 }}></i>)}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.totalRatings || 0} rating(s)</p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        {s.topProducts?.length > 0 && (
          <div className="sk-card" style={{ margin: '0 0 16px' }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-trophy"></i> Top Products</h4></div>
            <div className="sk-card-body no-padding">
              <div className="sk-activity-list">
                {s.topProducts.map((p, i) => (
                  <div key={p._id} className="sk-activity-item" style={{ padding: '10px 16px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i === 0 ? '#fef3c7' : '#f1f5f9', color: i === 0 ? '#d97706' : '#64748b', fontSize: '0.75rem', fontWeight: 700
                    }}>{i + 1}</div>
                    <div className="sk-activity-content" style={{ flex: 1 }}>
                      <p className="sk-activity-title" style={{ fontSize: '0.8rem' }}>{p.name}</p>
                      <p className="sk-activity-meta" style={{ fontSize: '0.7rem' }}>₹{p.price || 0} • Rating: {(p.rating || 0).toFixed(1)}</p>
                    </div>
                    <span className={`sk-badge ${p.inStock ? 'sk-badge-success' : 'sk-badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {s.orders?.recent?.length > 0 && (
          <div className="sk-card" style={{ margin: 0 }}>
            <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-history"></i> Recent Orders</h4></div>
            <div className="sk-card-body no-padding">
              <div className="sk-activity-list">
                {s.orders.recent.map(o => (
                  <div key={o._id} className="sk-activity-item" style={{ padding: '10px 16px' }}>
                    <div className="sk-activity-icon" style={{ background: '#10b98115', color: '#10b981', width: '32px', height: '32px', fontSize: '0.7rem' }}><i className="fas fa-box"></i></div>
                    <div className="sk-activity-content" style={{ flex: 1, minWidth: 0 }}>
                      <p className="sk-activity-title" style={{ fontSize: '0.8rem' }}>{o.orderNumber || `#${o._id?.slice(-6)}`}</p>
                      <p className="sk-activity-meta" style={{ fontSize: '0.7rem' }}>{o.customer?.name || 'Customer'} • {formatDate(o.createdAt)}</p>
                    </div>
                    <span className={`sk-badge ${getStatusBadge(o.status)}`} style={{ fontSize: '0.65rem' }}>{formatStatus(o.status)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  const renderDeliveryDashboard = () => {
    const s = data.stats || {}
    const rd = data.roleDetails || {}

    const deliveryData = [
      { label: 'Completed', value: s.deliveries?.completed || 0, color: '#10b981' },
      { label: 'Pending', value: (s.deliveries?.total || 0) - (s.deliveries?.completed || 0), color: '#f59e0b' },
    ].filter(i => i.value > 0)

    return (
      <>
        {/* Vehicle Info */}
        {rd && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
            background: 'linear-gradient(135deg, #fefce8, #fef9c3)', border: '1px solid #fde68a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fas fa-motorcycle" style={{ fontSize: '1.5rem', color: '#d97706' }}></i>
              <div>
                <p style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>{(rd.vehicleType || 'N/A').toUpperCase()}</p>
                <p style={{ fontSize: '0.75rem', color: '#a16207' }}>Vehicle: {rd.vehicleNumber || 'N/A'}</p>
              </div>
              <span style={{
                marginLeft: 'auto', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600,
                background: rd.isAvailable ? '#dcfce7' : '#fee2e2', color: rd.isAvailable ? '#16a34a' : '#dc2626'
              }}>
                {rd.isAvailable ? '🟢 Available' : '🔴 Busy'}
              </span>
            </div>
          </div>
        )}

        {/* Delivery Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <StatMini icon="fa-truck" label="Total Deliveries" value={s.deliveries?.total || 0} color="#6366f1" />
          <StatMini icon="fa-check-circle" label="Completed" value={s.deliveries?.completed || 0} color="#10b981" />
          <StatMini icon="fa-rupee-sign" label="Total Earnings" value={formatCurrency(s.earnings?.total)} color="#059669" />
          <StatMini icon="fa-star" label="Rating" value={(rd?.rating || 0).toFixed(1)} color="#f59e0b" />
        </div>

        {/* Chart */}
        <div className="sk-card" style={{ margin: '0 0 16px' }}>
          <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-chart-pie"></i> Delivery Breakdown</h4></div>
          <div className="sk-card-body" style={{ padding: '16px', textAlign: 'center' }}>
            {deliveryData.length > 0 ? <PieChart data={deliveryData} size={140} innerRadius={0.6} showLegend /> : <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No deliveries yet</p>}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="sk-card" style={{ margin: 0 }}>
          <div className="sk-card-header"><h4 className="sk-card-title" style={{ fontSize: '0.85rem' }}><i className="fas fa-percentage"></i> Performance</h4></div>
          <div className="sk-card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>Completion Rate</p>
                <div style={{ width: '100%', height: '10px', borderRadius: '5px', background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{
                    width: `${s.deliveries?.total ? Math.round((s.deliveries?.completed / s.deliveries?.total) * 100) : 0}%`,
                    height: '100%', borderRadius: '5px',
                    background: 'linear-gradient(90deg, #10b981, #059669)', transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#059669' }}>
                {s.deliveries?.total ? Math.round((s.deliveries?.completed / s.deliveries?.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </>
    )
  }

  const renderGenericDashboard = () => (
    <div className="sk-card" style={{ margin: 0 }}>
      <div className="sk-card-body" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👤</div>
        <h4 style={{ color: '#1e293b', marginBottom: '8px' }}>User Profile</h4>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>This user's role ({data?.user?.role}) does not have a specialized dashboard view.</p>
      </div>
    </div>
  )

  // ============ RENDER ============

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '560px', maxWidth: '95vw',
      background: '#fff', boxShadow: '-8px 0 30px rgba(0,0,0,0.15)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease'
    }}>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', top: 0, left: 0, right: '560px', bottom: 0,
        background: 'rgba(0,0,0,0.3)', zIndex: -1
      }}></div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#1e293b' }}>Failed to load</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</p>
          <button onClick={onClose} className="sk-btn sk-btn-primary sk-btn-sm">Close</button>
        </div>
      ) : data ? (
        <>
          {/* Panel Header */}
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
            background: `linear-gradient(135deg, ${getRoleColor(data.user.role)}15, ${getRoleColor(data.user.role)}08)`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                {imgSrc(data.user.profilePicture) ? (
                  <img
                    src={imgSrc(data.user.profilePicture)}
                    alt={data.user.name}
                    style={{ width: '52px', height: '52px', borderRadius: '14px', objectFit: 'cover', border: `2px solid ${getRoleColor(data.user.role)}40` }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }}
                  />
                ) : null}
                <div className="sk-user-initial" style={{
                  width: '52px', height: '52px', borderRadius: '14px', fontSize: '1.2rem', fontWeight: 700,
                  background: `${getRoleColor(data.user.role)}20`, color: getRoleColor(data.user.role),
                  display: imgSrc(data.user.profilePicture) ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {data.user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{data.user.name}</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{data.user.email}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                    <span className={`sk-badge`} style={{ background: `${getRoleColor(data.user.role)}20`, color: getRoleColor(data.user.role), fontSize: '0.7rem', fontWeight: 600 }}>
                      <i className={`fas ${getRoleIcon(data.user.role)}`} style={{ marginRight: '4px' }}></i>{data.user.role}
                    </span>
                    {data.user.phone && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}><i className="fas fa-phone" style={{ marginRight: '4px' }}></i>{data.user.phone}</span>}
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
                borderRadius: '8px', color: '#94a3b8', fontSize: '1.2rem', lineHeight: 1
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            {/* Quick Info Bar */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
              <InfoChip icon="fa-calendar" label="Joined" value={formatDate(data.user.createdAt)} />
              <InfoChip icon="fa-envelope" label="Email" value={data.user.isEmailVerified ? '✅ Verified' : '❌ Unverified'} />
              {data.user.address?.city && <InfoChip icon="fa-map-marker-alt" label="City" value={data.user.address.city} />}
            </div>
          </div>

          {/* Scrollable Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {data.user.role === 'customer' && renderCustomerDashboard()}
            {data.user.role === 'worker' && renderWorkerDashboard()}
            {data.user.role === 'seller' && renderSellerDashboard()}
            {data.user.role === 'delivery' && renderDeliveryDashboard()}
            {!['customer', 'worker', 'seller', 'delivery'].includes(data.user.role) && renderGenericDashboard()}
          </div>
        </>
      ) : null}

      {/* Inline animation keyframe */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ============ SUB-COMPONENTS ============

const StatMini = ({ icon, label, value, color }) => (
  <div style={{
    padding: '14px', borderRadius: '12px', background: `${color}08`, border: `1px solid ${color}20`,
    textAlign: 'center', transition: 'transform 0.2s'
  }}>
    <i className={`fas ${icon}`} style={{ color, fontSize: '1rem', marginBottom: '6px', display: 'block' }}></i>
    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{value}</div>
    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{label}</div>
  </div>
)

const InfoChip = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
    <i className={`fas ${icon}`} style={{ opacity: 0.6 }}></i>
    <span>{label}:</span>
    <span style={{ fontWeight: 600, color: '#1e293b' }}>{value}</span>
  </div>
)

export default AdminUserDetailPanel
