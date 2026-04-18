import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const getRoleBadge = (role) => {
  const map = { admin: 'sk-badge-danger', customer: 'sk-badge-indigo', worker: 'sk-badge-info', seller: 'sk-badge-success', delivery: 'sk-badge-warning' }
  return map[role] || 'sk-badge-default'
}

/* ─── User Detail Modal ─── */
const UserDetailModal = ({ userId, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)
    api.get(`/admin/users/${userId}`)
      .then(res => setData(res.data))
      .catch(err => {
        console.error('User detail error:', err)
        setError(err.response?.data?.message || 'Failed to load user details')
      })
      .finally(() => setLoading(false))
  }, [userId])

  if (!userId) return null

  const u = data?.user
  const s = data?.stats
  const rd = data?.roleDetails

  return (
    <div className="sk-modal-overlay" onClick={onClose}>
      <div className="sk-modal" onClick={e => e.stopPropagation()}>
        <div className="sk-modal-header">
          <h3 className="sk-modal-title">User Details</h3>
          <button className="sk-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="sk-modal-body">
          {loading ? (
            <div className="sk-loading"><div className="sk-spinner"></div></div>
          ) : error ? (
            <div className="sk-empty"><div className="sk-empty-icon">⚠️</div><h4 className="sk-empty-title">{error}</h4><p className="sk-empty-text">Please try again</p></div>
          ) : !u ? (
            <div className="sk-empty"><div className="sk-empty-icon">❌</div><h4 className="sk-empty-title">User not found</h4></div>
          ) : (
            <>
              {/* User Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                <div className={`sk-user-initial role-${u.role}`} style={{ width: '56px', height: '56px', fontSize: '1.25rem', borderRadius: '14px' }}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '1.1rem' }}>{u.name}</h4>
                  <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '0.875rem' }}>{u.email}</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`sk-badge ${getRoleBadge(u.role)}`}>{u.role}</span>
                    {u.isEmailVerified
                      ? <span className="sk-badge sk-badge-success">Verified</span>
                      : <span className="sk-badge sk-badge-warning">Unverified</span>
                    }
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: '#64748b' }}>
                  <div><i className="fas fa-phone" style={{ marginRight: '6px' }}></i>{u.phone || 'N/A'}</div>
                  <div style={{ marginTop: '4px' }}><i className="fas fa-calendar" style={{ marginRight: '6px' }}></i>Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Role-specific stats */}
              {u.role === 'customer' && s && <CustomerStats stats={s} />}
              {u.role === 'worker' && s && <WorkerStats stats={s} details={rd} />}
              {u.role === 'seller' && s && <SellerStats stats={s} details={rd} />}
              {u.role === 'delivery' && s && <DeliveryStats stats={s} />}
              {u.role === 'admin' && (
                <div className="sk-empty" style={{ padding: '20px' }}>
                  <div className="sk-empty-icon">🛡️</div>
                  <h4 className="sk-empty-title">Administrator Account</h4>
                  <p className="sk-empty-text">Full platform access</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Customer Stats ─── */
const CustomerStats = ({ stats: s }) => (
  <>
    <div className="sk-detail-stats">
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #6366f1' }}>
        <div className="sk-detail-stat-value">{s.bookings?.total || 0}</div>
        <div className="sk-detail-stat-label">Total Bookings</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #10b981' }}>
        <div className="sk-detail-stat-value">{s.bookings?.completed || 0}</div>
        <div className="sk-detail-stat-label">Completed</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #0ea5e9' }}>
        <div className="sk-detail-stat-value">{s.orders?.total || 0}</div>
        <div className="sk-detail-stat-label">Total Orders</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #f59e0b' }}>
        <div className="sk-detail-stat-value">₹{(s.totalSpent || 0).toLocaleString()}</div>
        <div className="sk-detail-stat-label">Total Spent</div>
      </div>
    </div>
    <div className="sk-row sk-row-2" style={{ marginBottom: '16px' }}>
      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px' }}>
        <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Booking Spend</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{(s.bookingSpent || 0).toLocaleString()}</div>
      </div>
      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px' }}>
        <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Order Spend</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{(s.orderSpent || 0).toLocaleString()}</div>
      </div>
    </div>
    {s.bookings?.recent?.length > 0 && (
      <div style={{ marginTop: '16px' }}>
        <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: '#1e293b' }}>Recent Bookings</h5>
        {s.bookings.recent.map(b => (
          <div key={b._id} className="sk-activity-item" style={{ padding: '8px 0' }}>
            <div className="sk-activity-icon"><i className="fas fa-tools"></i></div>
            <div className="sk-activity-content">
              <p className="sk-activity-title">{b.service?.name || 'Service'}</p>
              <p className="sk-activity-desc">{new Date(b.date || b.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`sk-badge ${b.status === 'completed' ? 'sk-badge-success' : b.status === 'cancelled' ? 'sk-badge-danger' : 'sk-badge-warning'}`}>{b.status}</span>
          </div>
        ))}
      </div>
    )}
    {s.orders?.recent?.length > 0 && (
      <div style={{ marginTop: '16px' }}>
        <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: '#1e293b' }}>Recent Orders</h5>
        {s.orders.recent.map(o => (
          <div key={o._id} className="sk-activity-item" style={{ padding: '8px 0' }}>
            <div className="sk-activity-icon" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}><i className="fas fa-box"></i></div>
            <div className="sk-activity-content">
              <p className="sk-activity-title">Order #{o.orderNumber || o._id?.substring(0, 8)}</p>
              <p className="sk-activity-desc">{o.items?.length} items · ₹{(o.totalAmount || o.total || 0).toLocaleString()}</p>
            </div>
            <span className={`sk-badge ${o.status === 'delivered' ? 'sk-badge-success' : o.status === 'cancelled' ? 'sk-badge-danger' : 'sk-badge-warning'}`}>{o.status}</span>
          </div>
        ))}
      </div>
    )}
  </>
)

/* ─── Worker Stats ─── */
const WorkerStats = ({ stats: s, details }) => (
  <>
    <div className="sk-detail-stats">
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #6366f1' }}>
        <div className="sk-detail-stat-value">{s.bookings?.total || 0}</div>
        <div className="sk-detail-stat-label">Total Jobs</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #10b981' }}>
        <div className="sk-detail-stat-value">{s.bookings?.completed || 0}</div>
        <div className="sk-detail-stat-label">Completed</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #f59e0b' }}>
        <div className="sk-detail-stat-value">₹{(s.earnings?.total || 0).toLocaleString()}</div>
        <div className="sk-detail-stat-label">Total Earnings</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #0ea5e9' }}>
        <div className="sk-detail-stat-value">₹{(s.earnings?.monthly || 0).toLocaleString()}</div>
        <div className="sk-detail-stat-label">Monthly Earnings</div>
      </div>
    </div>
    <div className="sk-row sk-row-3" style={{ marginBottom: '16px' }}>
      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem' }}>⭐</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.rating?.toFixed(1) || 'N/A'}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rating</div>
      </div>
      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem' }}>{s.isAvailable ? '🟢' : '🔴'}</div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.isAvailable ? 'Available' : 'Unavailable'}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Status</div>
      </div>
      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem' }}>{s.isVerified ? '✅' : '⏳'}</div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.isVerified ? 'Verified' : 'Pending'}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Verification</div>
      </div>
    </div>
    {/* Reviews */}
    {s.reviews?.length > 0 && (
      <div style={{ marginTop: '16px' }}>
        <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Customer Feedback ({s.totalRatings} reviews)</h5>
        {s.reviews.slice(0, 5).map((r, i) => (
          <div key={i} className="sk-review-item">
            <div className="sk-review-avatar">{r.customer?.name?.charAt(0) || '?'}</div>
            <div className="sk-review-content">
              <p className="sk-review-name">{r.customer?.name || 'Customer'}</p>
              <div className="sk-review-stars">{'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5 - Math.round(r.rating))}</div>
              {r.comment && <p className="sk-review-text">{r.comment}</p>}
              <div className="sk-review-date">{new Date(r.date).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    )}
    {s.recentBookings?.length > 0 && (
      <div style={{ marginTop: '16px' }}>
        <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Recent Jobs</h5>
        {s.recentBookings.map(b => (
          <div key={b._id} className="sk-activity-item" style={{ padding: '8px 0' }}>
            <div className="sk-activity-icon"><i className="fas fa-tools"></i></div>
            <div className="sk-activity-content">
              <p className="sk-activity-title">{b.service?.name || 'Service'}</p>
              <p className="sk-activity-desc">{b.customer?.name} · ₹{b.finalPrice || b.price}</p>
            </div>
            <span className={`sk-badge ${b.status === 'completed' ? 'sk-badge-success' : b.status === 'cancelled' ? 'sk-badge-danger' : 'sk-badge-warning'}`}>{b.status}</span>
          </div>
        ))}
      </div>
    )}
  </>
)

/* ─── Seller Stats ─── */
const SellerStats = ({ stats: s }) => (
  <>
    <div className="sk-detail-stats">
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #10b981' }}>
        <div className="sk-detail-stat-value">₹{(s.revenue?.total || 0).toLocaleString()}</div>
        <div className="sk-detail-stat-label">Total Revenue</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #6366f1' }}>
        <div className="sk-detail-stat-value">₹{(s.revenue?.monthly || 0).toLocaleString()}</div>
        <div className="sk-detail-stat-label">Monthly Revenue</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #0ea5e9' }}>
        <div className="sk-detail-stat-value">{s.products?.total || 0}</div>
        <div className="sk-detail-stat-label">Products</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #f59e0b' }}>
        <div className="sk-detail-stat-value">{s.orders?.total || 0}</div>
        <div className="sk-detail-stat-label">Total Orders</div>
      </div>
    </div>
    <div className="sk-row sk-row-3" style={{ marginBottom: '16px' }}>
      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem' }}>⭐</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.rating?.toFixed(1) || 'N/A'}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rating ({s.totalRatings} reviews)</div>
      </div>
      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem' }}>🏪</div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.shopName || 'N/A'}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Shop</div>
      </div>
      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem' }}>{s.isVerified ? '✅' : '⏳'}</div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.isVerified ? 'Verified' : 'Pending'}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Status</div>
      </div>
    </div>
    {/* Top Products */}
    {s.topProducts?.length > 0 && (
      <div style={{ marginTop: '16px' }}>
        <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Top Products</h5>
        {s.topProducts.map(p => (
          <div key={p._id} className="sk-activity-item" style={{ padding: '8px 0' }}>
            <div className="sk-activity-icon" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}><i className="fas fa-box"></i></div>
            <div className="sk-activity-content">
              <p className="sk-activity-title">{p.name}</p>
              <p className="sk-activity-desc">₹{p.price} · ⭐ {p.rating?.toFixed(1) || 'N/A'}</p>
            </div>
            <span className={`sk-badge ${p.inStock ? 'sk-badge-success' : 'sk-badge-danger'}`}>{p.inStock ? 'In Stock' : 'Out'}</span>
          </div>
        ))}
      </div>
    )}
    {s.orders?.recent?.length > 0 && (
      <div style={{ marginTop: '16px' }}>
        <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Recent Orders</h5>
        {s.orders.recent.map(o => (
          <div key={o._id} className="sk-activity-item" style={{ padding: '8px 0' }}>
            <div className="sk-activity-icon" style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}><i className="fas fa-shopping-bag"></i></div>
            <div className="sk-activity-content">
              <p className="sk-activity-title">{o.customer?.name || 'Customer'}</p>
              <p className="sk-activity-desc">₹{(o.totalAmount || o.total || 0).toLocaleString()}</p>
            </div>
            <span className={`sk-badge ${o.status === 'delivered' ? 'sk-badge-success' : 'sk-badge-warning'}`}>{o.status}</span>
          </div>
        ))}
      </div>
    )}
  </>
)

/* ─── Delivery Stats ─── */
const DeliveryStats = ({ stats: s }) => (
  <>
    <div className="sk-detail-stats">
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #10b981' }}>
        <div className="sk-detail-stat-value">{s.deliveries?.total || 0}</div>
        <div className="sk-detail-stat-label">Total Deliveries</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #6366f1' }}>
        <div className="sk-detail-stat-value">{s.deliveries?.completed || 0}</div>
        <div className="sk-detail-stat-label">Completed</div>
      </div>
      <div className="sk-detail-stat" style={{ borderLeft: '3px solid #f59e0b' }}>
        <div className="sk-detail-stat-value">₹{(s.earnings?.total || 0).toLocaleString()}</div>
        <div className="sk-detail-stat-label">Total Earnings</div>
      </div>
    </div>
  </>
)

/* ─── Main AdminUsers Component ─── */
const AdminUsers = () => {
  const { user } = useSelector((state) => state.auth)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') return <Navigate to="/dashboard" />
  if (loading) return <LoadingSpinner />

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesSearch = search === '' ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    return matchesRole && matchesSearch
  })

  const roleCounts = {
    all: users.length,
    customer: users.filter(u => u.role === 'customer').length,
    worker: users.filter(u => u.role === 'worker').length,
    seller: users.filter(u => u.role === 'seller').length,
    delivery: users.filter(u => u.role === 'delivery').length,
  }

  const filterTabs = [
    { label: 'All Users', value: 'all', icon: '👥', count: roleCounts.all },
    { label: 'Customers', value: 'customer', icon: '🛒', count: roleCounts.customer },
    { label: 'Workers', value: 'worker', icon: '👷', count: roleCounts.worker },
    { label: 'Sellers', value: 'seller', icon: '🏪', count: roleCounts.seller },
    { label: 'Delivery', value: 'delivery', icon: '🚚', count: roleCounts.delivery },
  ]

  return (
    <div className="sk-dashboard">
      <div className="sk-dashboard-container">
        {/* User Detail Modal */}
        {selectedUserId && (
          <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
        )}

        {/* Header */}
        <header className="sk-dash-header sk-animate">
          <div className="sk-dash-header-left">
            <div className="sk-dash-avatar-icon"><i className="fas fa-users-cog"></i></div>
            <div>
              <h1 className="sk-dash-title">User Management</h1>
              <p className="sk-dash-subtitle">Manage all platform users · Click on any user to view full details</p>
            </div>
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="sk-filter-tabs">
          {filterTabs.map(tab => (
            <div
              key={tab.value}
              className={`sk-filter-tab ${roleFilter === tab.value ? 'active' : ''}`}
              onClick={() => setRoleFilter(tab.value)}
            >
              <div className="sk-filter-tab-icon">{tab.icon}</div>
              <div className="sk-filter-tab-count">{tab.count}</div>
              <div className="sk-filter-tab-label">{tab.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="sk-search-wrapper">
          <i className="fas fa-search sk-search-icon"></i>
          <input
            type="text"
            className="sk-search-bar"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Users Table */}
        <div className="sk-card sk-animate">
          <div className="sk-card-header">
            <h3 className="sk-card-title"><i className="fas fa-list"></i> Users ({filteredUsers.length})</h3>
          </div>
          <div className="sk-card-body no-padding">
            <table className="sk-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="sk-user-row" onClick={() => setSelectedUserId(u._id)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className={`sk-user-initial role-${u.role}`}>{u.name?.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="sk-table-primary" style={{ margin: 0 }}>{u.name}</p>
                            <p className="sk-table-secondary" style={{ margin: 0 }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={`sk-badge ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                      <td className="sk-table-secondary">{u.phone || '-'}</td>
                      <td className="sk-table-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.isEmailVerified
                          ? <span className="sk-badge sk-badge-success">● Verified</span>
                          : <span className="sk-badge sk-badge-warning">● Pending</span>
                        }
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">
                      <div className="sk-empty"><div className="sk-empty-icon">🔍</div><h4 className="sk-empty-title">No users found</h4></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
