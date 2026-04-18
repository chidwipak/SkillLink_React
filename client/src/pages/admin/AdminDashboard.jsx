import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DashboardSkeleton from '../../components/common/DashboardSkeleton'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import PieChart from '../../components/ui/PieChart'
import AdminUserDetailPanel from '../../components/admin/AdminUserDetailPanel'

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [approvedUsers, setApprovedUsers] = useState([])
  const [rejectedUsers, setRejectedUsers] = useState([])
  const [verStatusLoading, setVerStatusLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastRefresh, setLastRefresh] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/dashboard/admin/stats')
      setStats(response.data)
      setError(null)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchedRef.current = false
    setApprovedUsers([])
    setRejectedUsers([])
    fetchStats()
  }

  const totalPendingVerifications =
    (stats?.verifications?.pendingWorkers || 0) +
    (stats?.verifications?.pendingSellers || 0) +
    (stats?.verifications?.pendingDelivery || 0)

  const activeBookings = (stats?.bookings?.pending || 0) + (stats?.bookings?.accepted || 0) + (stats?.bookings?.inProgress || 0)
  const activeOrders = (stats?.orders?.pending || 0) + (stats?.orders?.assigned || 0) + (stats?.orders?.outForDelivery || 0)

  const userChartData = useMemo(() => {
    if (!stats?.users) return []
    return [
      { label: 'Customers', value: stats.users.customers || 0, color: '#6366f1' },
      { label: 'Workers', value: stats.users.workers || 0, color: '#0ea5e9' },
      { label: 'Sellers', value: stats.users.sellers || 0, color: '#10b981' },
      { label: 'Delivery', value: stats.users.delivery || 0, color: '#f59e0b' },
    ].filter(item => item.value > 0)
  }, [stats?.users])

  const bookingChartData = useMemo(() => {
    if (!stats?.bookings) return []
    return [
      { label: 'Pending', value: stats.bookings.pending || 0, color: '#f59e0b' },
      { label: 'Accepted', value: stats.bookings.accepted || 0, color: '#0ea5e9' },
      { label: 'In Progress', value: stats.bookings.inProgress || 0, color: '#6366f1' },
      { label: 'Completed', value: stats.bookings.completed || 0, color: '#10b981' },
      { label: 'Cancelled', value: stats.bookings.cancelled || 0, color: '#ef4444' },
    ].filter(item => item.value > 0)
  }, [stats?.bookings])

  const orderChartData = useMemo(() => {
    if (!stats?.orders) return []
    return [
      { label: 'Pending', value: stats.orders.pending || 0, color: '#f59e0b' },
      { label: 'Assigned', value: stats.orders.assigned || 0, color: '#0ea5e9' },
      { label: 'Out for Delivery', value: stats.orders.outForDelivery || 0, color: '#6366f1' },
      { label: 'Delivered', value: stats.orders.delivered || 0, color: '#10b981' },
      { label: 'Cancelled', value: stats.orders.cancelled || 0, color: '#ef4444' },
    ].filter(item => item.value > 0)
  }, [stats?.orders])

  const getBookingBadge = (status) => {
    const map = {
      pending: 'sk-badge-warning', accepted: 'sk-badge-info', 'in-progress': 'sk-badge-indigo',
      in_progress: 'sk-badge-indigo', completed: 'sk-badge-success', cancelled: 'sk-badge-danger', rejected: 'sk-badge-danger'
    }
    return map[status] || 'sk-badge-default'
  }

  const getOrderBadge = (status) => {
    const map = {
      pending: 'sk-badge-warning', confirmed: 'sk-badge-info', assigned_delivery: 'sk-badge-indigo',
      out_for_delivery: 'sk-badge-indigo', delivered: 'sk-badge-success', cancelled: 'sk-badge-danger', returned: 'sk-badge-danger'
    }
    return map[status] || 'sk-badge-default'
  }

  const getRoleBadge = (role) => {
    const map = { admin: 'sk-badge-danger', worker: 'sk-badge-info', seller: 'sk-badge-success', delivery: 'sk-badge-warning', customer: 'sk-badge-indigo', verifier: 'sk-badge-default' }
    return map[role] || 'sk-badge-default'
  }

  const formatStatus = (s) => s?.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'N/A'

  const exportUsersCSV = useCallback((users, filename) => {
    if (!users?.length) return
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Registered', 'Status']
    const rows = users.map(u => [
      u.name || '', u.email || '', u.phone || '', u.role || '',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
      u.isEmailVerified ? 'Verified' : 'Pending'
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${filename}.csv`; a.click()
    URL.revokeObjectURL(url)
  }, [])

  const filterBySearch = useCallback((list) => {
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(u =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) || u.phone?.includes(q)
    )
  }, [searchQuery])

  const ClickableUser = ({ user: u, showAvatar = true }) => (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); setSelectedUserId(u._id) }}
      title="Click to view user details"
    >
      {showAvatar && <div className={`sk-user-initial role-${u.role}`}>{u.name?.charAt(0)?.toUpperCase()}</div>}
      <div>
        <p className="sk-table-primary" style={{ margin: 0, color: '#6366f1', fontWeight: 600, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}>{u.name}</p>
        <p className="sk-table-secondary" style={{ margin: 0 }}>{u.email}</p>
      </div>
    </div>
  )

  const fetchVerificationUsers = async (type) => {
    try {
      setVerStatusLoading(true)
      const res = await api.get(`/admin/users/${type}`)
      if (type === 'approved') setApprovedUsers(res.data.users || [])
      else setRejectedUsers(res.data.users || [])
    } catch (err) {
      console.error(`Failed to fetch ${type} users:`, err)
    } finally {
      setVerStatusLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'approved' && approvedUsers.length === 0) fetchVerificationUsers('approved')
    if (activeTab === 'rejected' && rejectedUsers.length === 0) fetchVerificationUsers('rejected')
  }, [activeTab])

  if (user?.role !== 'admin') return <Navigate to="/dashboard" />
  if (loading) return <DashboardSkeleton cards={6} rows={6} />
  if (error) {
    return (
      <div className="sk-dashboard"><div className="sk-dashboard-container"><div className="sk-card"><div className="sk-empty">
        <div className="sk-empty-icon">⚠️</div><h3 className="sk-empty-title">{error}</h3>
        <button onClick={handleRefresh} className="sk-btn sk-btn-primary" style={{ marginTop: '16px' }}>Retry</button>
      </div></div></div></div>
    )
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'fa-th-large' },
    { key: 'bookings', label: 'Service Bookings', icon: 'fa-calendar-check', count: stats?.bookings?.total },
    { key: 'orders', label: 'Product Orders', icon: 'fa-shopping-bag', count: stats?.orders?.total },
    { key: 'users', label: 'Users', icon: 'fa-users', count: stats?.users?.total },
    { key: 'approved', label: 'Approved', icon: 'fa-user-check' },
    { key: 'rejected', label: 'Rejected', icon: 'fa-user-times' },
  ]

  return (
    <div className="sk-dashboard">
      <div className="sk-dashboard-container">
        <header className="sk-dash-header sk-animate">
          <div className="sk-dash-header-left">
            <div className="sk-dash-avatar"><ImageWithFallback src={user?.profilePicture} alt={user?.name} type="user" /></div>
            <div>
              <h1 className="sk-dash-title">Admin Dashboard</h1>
              <p className="sk-dash-subtitle">Complete platform overview — all services being processed</p>
            </div>
          </div>
          <div className="sk-dash-header-actions">
            <button onClick={handleRefresh} className="sk-btn sk-btn-ghost sk-btn-sm" title="Refresh data">
              <i className="fas fa-sync-alt"></i>
              {lastRefresh && <span style={{ fontSize: '0.65rem', marginLeft: '6px', color: '#94a3b8' }}>{lastRefresh.toLocaleTimeString()}</span>}
            </button>
            <Link to="/dashboard/admin/users" className="sk-btn sk-btn-primary"><i className="fas fa-users"></i> Manage Users</Link>
            <Link to="/dashboard/admin/analytics" className="sk-btn sk-btn-secondary"><i className="fas fa-chart-line"></i> Analytics</Link>
          </div>
        </header>

        <div className="sk-stats-grid">
          <div className="sk-stat-card gradient-emerald sk-animate sk-delay-1">
            <div className="sk-stat-icon"><i className="fas fa-rupee-sign"></i></div>
            <div className="sk-stat-value">₹{(stats?.revenue?.total || 0).toLocaleString()}</div>
            <div className="sk-stat-label">Total Revenue</div>
            <div className="sk-stat-change positive"><i className="fas fa-arrow-up" style={{ fontSize: '0.625rem' }}></i> ₹{(stats?.revenue?.monthly || 0).toLocaleString()} this month</div>
          </div>
          <div className="sk-stat-card gradient-indigo sk-animate sk-delay-2">
            <div className="sk-stat-icon"><i className="fas fa-calendar-check"></i></div>
            <div className="sk-stat-value">{activeBookings}</div>
            <div className="sk-stat-label">Active Bookings</div>
            <div className="sk-stat-change"><span style={{ color: '#94a3b8' }}>{stats?.bookings?.total || 0} total</span></div>
          </div>
          <div className="sk-stat-card gradient-sky sk-animate sk-delay-3">
            <div className="sk-stat-icon"><i className="fas fa-shopping-bag"></i></div>
            <div className="sk-stat-value">{activeOrders}</div>
            <div className="sk-stat-label">Active Orders</div>
            <div className="sk-stat-change"><span style={{ color: '#94a3b8' }}>{stats?.orders?.total || 0} total</span></div>
          </div>
          <Link to="/dashboard/admin/verification" style={{ textDecoration: 'none' }}>
            <div className="sk-stat-card gradient-amber sk-animate sk-delay-4" style={{ cursor: 'pointer', height: '100%' }}>
              <div className="sk-stat-icon"><i className="fas fa-user-check"></i></div>
              <div className="sk-stat-value">{totalPendingVerifications}</div>
              <div className="sk-stat-label">Pending Verifications</div>
            </div>
          </Link>
        </div>

        <div className="sk-filter-tabs" style={{ marginBottom: '24px' }}>
          {tabs.map(tab => (
            <div key={tab.key} className={`sk-filter-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => { setActiveTab(tab.key); setSearchQuery('') }}>
              <div className="sk-filter-tab-icon"><i className={`fas ${tab.icon}`}></i></div>
              {tab.count != null && <div className="sk-filter-tab-count">{tab.count}</div>}
              <div className="sk-filter-tab-label">{tab.label}</div>
            </div>
          ))}
        </div>

        {['users', 'approved', 'rejected'].includes(activeTab) && (
          <div className="sk-card sk-animate" style={{ marginBottom: '20px', padding: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px' }}>
              <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users by name, email, role, or phone..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: '#1e293b', background: 'transparent', padding: '4px 0' }} />
              {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem' }}><i className="fas fa-times"></i></button>}
              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '12px', display: 'flex', gap: '8px' }}>
                <button onClick={() => { const list = activeTab === 'approved' ? approvedUsers : activeTab === 'rejected' ? rejectedUsers : stats?.users?.recent; exportUsersCSV(list, `skilllink-${activeTab}-users`) }} className="sk-btn sk-btn-ghost sk-btn-sm" title="Export to CSV"><i className="fas fa-download"></i> CSV</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (<>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-chart-pie"></i> User Distribution</h3></div><div className="sk-card-body sk-chart-container">{userChartData.length > 0 ? <PieChart data={userChartData} size={170} innerRadius={0.6} showLegend={true} /> : <div className="sk-empty"><p className="sk-empty-text">No data</p></div>}</div></div>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-chart-pie"></i> Booking Status</h3></div><div className="sk-card-body sk-chart-container">{bookingChartData.length > 0 ? <PieChart data={bookingChartData} size={170} innerRadius={0.6} showLegend={true} /> : <div className="sk-empty"><p className="sk-empty-text">No data</p></div>}</div></div>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-chart-pie"></i> Order Status</h3></div><div className="sk-card-body sk-chart-container">{orderChartData.length > 0 ? <PieChart data={orderChartData} size={170} innerRadius={0.6} showLegend={true} /> : <div className="sk-empty"><p className="sk-empty-text">No data</p></div>}</div></div>
          </div>
          <div className="sk-row sk-row-2" style={{ marginBottom: '24px' }}>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-th-large"></i> Platform Overview</h3></div><div className="sk-card-body"><div className="sk-perf-grid">
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#6366f1' }}>{stats?.users?.total || 0}</div><div className="sk-perf-label">Total Users</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#10b981' }}>{stats?.products?.total || 0}</div><div className="sk-perf-label">Products</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#0ea5e9' }}>{stats?.services?.total || 0}</div><div className="sk-perf-label">Services</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#f59e0b' }}>{stats?.bookings?.completed || 0}</div><div className="sk-perf-label">Completed Bookings</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#8b5cf6' }}>{stats?.orders?.delivered || 0}</div><div className="sk-perf-label">Delivered Orders</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#059669' }}>₹{((stats?.revenue?.bookings || 0) + (stats?.revenue?.orders || 0)).toLocaleString()}</div><div className="sk-perf-label">Revenue (B+O)</div></div>
            </div></div></div>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-user-check"></i> Pending Verifications</h3><Link to="/dashboard/admin/verification" className="sk-btn sk-btn-ghost sk-btn-sm">View all <i className="fas fa-arrow-right"></i></Link></div><div className="sk-card-body">
              {totalPendingVerifications > 0 ? (<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[{ key: 'pendingWorkers', label: 'Workers', icon: 'fa-tools', color: '#0ea5e9' },{ key: 'pendingSellers', label: 'Sellers', icon: 'fa-store', color: '#10b981' },{ key: 'pendingDelivery', label: 'Delivery', icon: 'fa-truck', color: '#f59e0b' }].filter(v => stats?.verifications?.[v.key] > 0).map(v => (
                  <div key={v.key} className="sk-activity-item" style={{ padding: '10px 0' }}><div className="sk-activity-icon" style={{ background: `${v.color}15`, color: v.color }}><i className={`fas ${v.icon}`}></i></div><div className="sk-activity-content"><p className="sk-activity-title">{v.label}</p></div><span className="sk-badge sk-badge-warning">{stats.verifications[v.key]}</span></div>
                ))}
              </div>) : (<div className="sk-empty" style={{ padding: '28px' }}><div className="sk-empty-icon">✅</div><h4 className="sk-empty-title" style={{ color: '#059669' }}>All Clear!</h4><p className="sk-empty-text">All verifications complete</p></div>)}
            </div></div>
          </div>
          <div className="sk-row sk-row-2" style={{ marginBottom: '24px' }}>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-calendar-check"></i> Recent Bookings</h3><button onClick={() => setActiveTab('bookings')} className="sk-btn sk-btn-ghost sk-btn-sm">View all <i className="fas fa-arrow-right"></i></button></div><div className="sk-card-body">
              {stats?.bookings?.recent?.length > 0 ? (<div className="sk-activity-list">{stats.bookings.recent.slice(0, 5).map(b => (
                <div key={b._id} className="sk-activity-item"><div className="sk-activity-icon" style={{ background: '#6366f115', color: '#6366f1' }}><i className="fas fa-tools"></i></div><div className="sk-activity-content">
                  <p className="sk-activity-title">{b.service?.name || 'Service'}</p>
                  <p className="sk-activity-meta"><span style={{ cursor: 'pointer', color: '#6366f1', textDecoration: 'underline dotted', textUnderlineOffset: '2px' }} onClick={() => b.customer?._id && setSelectedUserId(b.customer._id)}>{b.customer?.name || 'Customer'}</span> → <span style={{ cursor: 'pointer', color: '#0ea5e9', textDecoration: 'underline dotted', textUnderlineOffset: '2px' }} onClick={() => b.worker?._id && setSelectedUserId(b.worker._id)}>{b.worker?.name || 'Worker'}</span></p>
                </div><div style={{ textAlign: 'right' }}><span className={`sk-badge ${getBookingBadge(b.status)}`}>{formatStatus(b.status)}</span><p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '4px 0 0' }}>₹{b.price || 0}</p></div></div>
              ))}</div>) : (<div className="sk-empty"><div className="sk-empty-icon">📋</div><h4 className="sk-empty-title">No bookings yet</h4></div>)}
            </div></div>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-shopping-bag"></i> Recent Orders</h3><button onClick={() => setActiveTab('orders')} className="sk-btn sk-btn-ghost sk-btn-sm">View all <i className="fas fa-arrow-right"></i></button></div><div className="sk-card-body">
              {stats?.orders?.recent?.length > 0 ? (<div className="sk-activity-list">{stats.orders.recent.slice(0, 5).map(o => (
                <div key={o._id} className="sk-activity-item"><div className="sk-activity-icon" style={{ background: '#10b98115', color: '#10b981' }}><i className="fas fa-box"></i></div><div className="sk-activity-content">
                  <p className="sk-activity-title">{o.orderNumber || o.orderId || `Order #${o._id?.slice(-6)}`}</p>
                  <p className="sk-activity-meta"><span style={{ cursor: 'pointer', color: '#6366f1', textDecoration: 'underline dotted', textUnderlineOffset: '2px' }} onClick={() => o.customer?._id && setSelectedUserId(o.customer._id)}>{o.customer?.name || 'Customer'}</span> • {o.items?.length || 0} items</p>
                </div><div style={{ textAlign: 'right' }}><span className={`sk-badge ${getOrderBadge(o.status)}`}>{formatStatus(o.status)}</span><p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '4px 0 0' }}>₹{o.totalAmount || o.total || 0}</p></div></div>
              ))}</div>) : (<div className="sk-empty"><div className="sk-empty-icon">📦</div><h4 className="sk-empty-title">No orders yet</h4></div>)}
            </div></div>
          </div>
        </>)}

        {activeTab === 'bookings' && (<>
          <div className="sk-row sk-row-2" style={{ marginBottom: '24px' }}>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-chart-pie"></i> Booking Breakdown</h3></div><div className="sk-card-body sk-chart-container">{bookingChartData.length > 0 ? <PieChart data={bookingChartData} size={180} innerRadius={0.6} showLegend={true} /> : <div className="sk-empty"><p className="sk-empty-text">No data</p></div>}</div></div>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-info-circle"></i> Booking Stats</h3></div><div className="sk-card-body"><div className="sk-perf-grid">
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#f59e0b' }}>{stats?.bookings?.pending || 0}</div><div className="sk-perf-label">Pending</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#0ea5e9' }}>{stats?.bookings?.accepted || 0}</div><div className="sk-perf-label">Accepted</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#6366f1' }}>{stats?.bookings?.inProgress || 0}</div><div className="sk-perf-label">In Progress</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#10b981' }}>{stats?.bookings?.completed || 0}</div><div className="sk-perf-label">Completed</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#ef4444' }}>{stats?.bookings?.cancelled || 0}</div><div className="sk-perf-label">Cancelled</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#64748b' }}>{stats?.bookings?.rejected || 0}</div><div className="sk-perf-label">Rejected</div></div>
            </div></div></div>
          </div>
          <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-list"></i> All Service Bookings</h3><span className="sk-badge sk-badge-info">{stats?.bookings?.total || 0} total</span></div><div className="sk-card-body no-padding">
            {stats?.bookings?.recent?.length > 0 ? (<div style={{ overflowX: 'auto' }}><table className="sk-table"><thead><tr><th>Service</th><th>Customer</th><th>Worker</th><th>Date & Time</th><th>Price</th><th>Status</th></tr></thead><tbody>
              {stats.bookings.recent.map(b => (<tr key={b._id}>
                <td><div><p className="sk-table-primary" style={{ margin: 0 }}>{b.service?.name || 'N/A'}</p><p className="sk-table-secondary" style={{ margin: 0 }}>{b.service?.category || ''}</p></div></td>
                <td><div style={{ cursor: 'pointer' }} onClick={() => b.customer?._id && setSelectedUserId(b.customer._id)}><p className="sk-table-primary" style={{ margin: 0, color: '#6366f1', textDecoration: 'underline dotted', textUnderlineOffset: '3px' }}>{b.customer?.name || 'N/A'}</p><p className="sk-table-secondary" style={{ margin: 0 }}>{b.customer?.phone || b.customer?.email || ''}</p></div></td>
                <td><p className="sk-table-primary" style={{ margin: 0, cursor: b.worker?._id ? 'pointer' : 'default', color: b.worker?._id ? '#0ea5e9' : '#94a3b8', textDecoration: b.worker?._id ? 'underline dotted' : 'none', textUnderlineOffset: '3px' }} onClick={() => b.worker?._id && setSelectedUserId(b.worker._id)}>{b.worker?.name || 'Not Assigned'}</p></td>
                <td><div><p className="sk-table-primary" style={{ margin: 0 }}>{b.date ? new Date(b.date).toLocaleDateString() : 'N/A'}</p><p className="sk-table-secondary" style={{ margin: 0 }}>{b.time || ''}</p></div></td>
                <td><span style={{ fontWeight: 600, color: '#1e293b' }}>₹{b.price || 0}</span></td>
                <td><span className={`sk-badge ${getBookingBadge(b.status)}`}>{formatStatus(b.status)}</span></td>
              </tr>))}
            </tbody></table></div>) : (<div className="sk-empty" style={{ padding: '40px' }}><div className="sk-empty-icon">📋</div><h4 className="sk-empty-title">No bookings found</h4><p className="sk-empty-text">Service bookings will appear here</p></div>)}
          </div></div>
        </>)}

        {activeTab === 'orders' && (<>
          <div className="sk-row sk-row-2" style={{ marginBottom: '24px' }}>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-chart-pie"></i> Order Breakdown</h3></div><div className="sk-card-body sk-chart-container">{orderChartData.length > 0 ? <PieChart data={orderChartData} size={180} innerRadius={0.6} showLegend={true} /> : <div className="sk-empty"><p className="sk-empty-text">No data</p></div>}</div></div>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-info-circle"></i> Order Stats</h3></div><div className="sk-card-body"><div className="sk-perf-grid">
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#f59e0b' }}>{stats?.orders?.pending || 0}</div><div className="sk-perf-label">Pending</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#0ea5e9' }}>{stats?.orders?.assigned || 0}</div><div className="sk-perf-label">Assigned</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#6366f1' }}>{stats?.orders?.outForDelivery || 0}</div><div className="sk-perf-label">Out for Delivery</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#10b981' }}>{stats?.orders?.delivered || 0}</div><div className="sk-perf-label">Delivered</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#ef4444' }}>{stats?.orders?.cancelled || 0}</div><div className="sk-perf-label">Cancelled</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#059669' }}>₹{((stats?.revenue?.orders || 0)).toLocaleString()}</div><div className="sk-perf-label">Order Revenue</div></div>
            </div></div></div>
          </div>
          <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-list"></i> All Product Orders</h3><span className="sk-badge sk-badge-info">{stats?.orders?.total || 0} total</span></div><div className="sk-card-body no-padding">
            {stats?.orders?.recent?.length > 0 ? (<div style={{ overflowX: 'auto' }}><table className="sk-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>
              {stats.orders.recent.map(o => (<tr key={o._id}>
                <td><p className="sk-table-primary" style={{ margin: 0, fontFamily: 'monospace' }}>{o.orderNumber || o.orderId || `#${o._id?.slice(-6)}`}</p></td>
                <td><div style={{ cursor: 'pointer' }} onClick={() => o.customer?._id && setSelectedUserId(o.customer._id)}><p className="sk-table-primary" style={{ margin: 0, color: '#6366f1', textDecoration: 'underline dotted', textUnderlineOffset: '3px' }}>{o.customer?.name || 'N/A'}</p><p className="sk-table-secondary" style={{ margin: 0 }}>{o.customer?.phone || o.customer?.email || ''}</p></div></td>
                <td><div>{o.items?.slice(0, 2).map((item, idx) => (<p key={idx} className="sk-table-secondary" style={{ margin: 0, fontSize: '0.8rem' }}>{item.product?.name || 'Product'} × {item.quantity || 1}</p>))}{o.items?.length > 2 && <p className="sk-table-secondary" style={{ margin: 0, fontSize: '0.75rem', color: '#6366f1' }}>+{o.items.length - 2} more</p>}</div></td>
                <td><span style={{ fontWeight: 600, color: '#1e293b' }}>₹{o.totalAmount || o.total || 0}</span></td>
                <td className="sk-table-secondary">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td><span className={`sk-badge ${getOrderBadge(o.status)}`}>{formatStatus(o.status)}</span></td>
              </tr>))}
            </tbody></table></div>) : (<div className="sk-empty" style={{ padding: '40px' }}><div className="sk-empty-icon">📦</div><h4 className="sk-empty-title">No orders found</h4><p className="sk-empty-text">Product orders will appear here</p></div>)}
          </div></div>
        </>)}

        {activeTab === 'users' && (<>
          <div className="sk-row sk-row-2" style={{ marginBottom: '24px' }}>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-chart-pie"></i> User Distribution</h3></div><div className="sk-card-body sk-chart-container">{userChartData.length > 0 ? <PieChart data={userChartData} size={180} innerRadius={0.6} showLegend={true} /> : <div className="sk-empty"><p className="sk-empty-text">No data</p></div>}</div></div>
            <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-info-circle"></i> User Counts</h3></div><div className="sk-card-body"><div className="sk-perf-grid">
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#6366f1' }}>{stats?.users?.customers || 0}</div><div className="sk-perf-label">Customers</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#0ea5e9' }}>{stats?.users?.workers || 0}</div><div className="sk-perf-label">Workers</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#10b981' }}>{stats?.users?.sellers || 0}</div><div className="sk-perf-label">Sellers</div></div>
              <div className="sk-perf-item"><div className="sk-perf-value" style={{ color: '#f59e0b' }}>{stats?.users?.delivery || 0}</div><div className="sk-perf-label">Delivery</div></div>
            </div></div></div>
          </div>
          <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-users"></i> Recent Users</h3><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{searchQuery && <span className="sk-badge sk-badge-info">{filterBySearch(stats?.users?.recent || []).length} match(es)</span>}<Link to="/dashboard/admin/users" className="sk-btn sk-btn-ghost sk-btn-sm">Manage all <i className="fas fa-arrow-right"></i></Link></div></div><div className="sk-card-body no-padding">
            {stats?.users?.recent?.length > 0 ? (<table className="sk-table"><thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead><tbody>
              {filterBySearch(stats.users.recent).map((u) => (<tr key={u._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedUserId(u._id)}>
                <td><ClickableUser user={u} /></td>
                <td><span className={`sk-badge ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                <td className="sk-table-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>{u.isEmailVerified ? <span className="sk-badge sk-badge-success">Verified</span> : <span className="sk-badge sk-badge-warning">Pending</span>}</td>
              </tr>))}
              {filterBySearch(stats.users.recent).length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No users match "{searchQuery}"</td></tr>}
            </tbody></table>) : (<div className="sk-empty"><div className="sk-empty-icon">👥</div><h4 className="sk-empty-title">No recent users</h4></div>)}
          </div></div>
        </>)}

        {activeTab === 'approved' && (<>{verStatusLoading ? (<div className="sk-card sk-animate"><div className="sk-card-body" style={{ padding: '40px', textAlign: 'center' }}><LoadingSpinner /></div></div>) : (
          <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-user-check" style={{ color: '#10b981' }}></i> Approved Users ({filterBySearch(approvedUsers).length})</h3><div style={{ display: 'flex', gap: '8px' }}><button onClick={() => fetchVerificationUsers('approved')} className="sk-btn sk-btn-ghost sk-btn-sm"><i className="fas fa-sync-alt"></i> Refresh</button></div></div><div className="sk-card-body no-padding">
            {approvedUsers.length > 0 ? (<table className="sk-table"><thead><tr><th>User</th><th>Role</th><th>Phone</th><th>Registered</th><th>Status</th></tr></thead><tbody>
              {filterBySearch(approvedUsers).map((u) => (<tr key={u._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedUserId(u._id)}>
                <td><ClickableUser user={u} /></td>
                <td><span className={`sk-badge ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                <td className="sk-table-secondary">{u.phone || 'N/A'}</td>
                <td className="sk-table-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td><span className="sk-badge sk-badge-success">Approved</span></td>
              </tr>))}
              {filterBySearch(approvedUsers).length === 0 && searchQuery && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No matches for "{searchQuery}"</td></tr>}
            </tbody></table>) : (<div className="sk-empty" style={{ padding: '40px' }}><div className="sk-empty-icon">📋</div><h4 className="sk-empty-title">No approved users yet</h4></div>)}
          </div></div>
        )}</>)}

        {activeTab === 'rejected' && (<>{verStatusLoading ? (<div className="sk-card sk-animate"><div className="sk-card-body" style={{ padding: '40px', textAlign: 'center' }}><LoadingSpinner /></div></div>) : (
          <div className="sk-card sk-animate"><div className="sk-card-header"><h3 className="sk-card-title"><i className="fas fa-user-times" style={{ color: '#ef4444' }}></i> Rejected Users ({filterBySearch(rejectedUsers).length})</h3><div style={{ display: 'flex', gap: '8px' }}><button onClick={() => fetchVerificationUsers('rejected')} className="sk-btn sk-btn-ghost sk-btn-sm"><i className="fas fa-sync-alt"></i> Refresh</button></div></div><div className="sk-card-body no-padding">
            {rejectedUsers.length > 0 ? (<table className="sk-table"><thead><tr><th>User</th><th>Role</th><th>Rejection Feedback</th><th>Registered</th><th>Status</th></tr></thead><tbody>
              {filterBySearch(rejectedUsers).map((u) => (<tr key={u._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedUserId(u._id)}>
                <td><ClickableUser user={u} /></td>
                <td><span className={`sk-badge ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                <td><p className="sk-table-secondary" style={{ margin: 0, maxWidth: '300px' }}>{u.rejection_feedback || 'No feedback'}</p></td>
                <td className="sk-table-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td><span className="sk-badge sk-badge-danger">Rejected</span></td>
              </tr>))}
              {filterBySearch(rejectedUsers).length === 0 && searchQuery && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No matches for "{searchQuery}"</td></tr>}
            </tbody></table>) : (<div className="sk-empty" style={{ padding: '40px' }}><div className="sk-empty-icon">📋</div><h4 className="sk-empty-title">No rejected users</h4></div>)}
          </div></div>
        )}</>)}
      </div>

      {selectedUserId && <AdminUserDetailPanel userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
    </div>
  )
}

export default AdminDashboard