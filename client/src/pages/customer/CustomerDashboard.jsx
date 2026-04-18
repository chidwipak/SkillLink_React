import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import PieChart from '../../components/ui/PieChart'
import { ProgressRing, HorizontalBar, SummaryRow, SparkBars } from '../../components/ui/AnalyticsWidgets'

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

  const bookingChartData = useMemo(() => {
    if (!stats?.bookings) return []
    return [
      { label: 'Completed', value: stats.bookings.completed || 0, color: '#10b981' },
      { label: 'Active', value: stats.bookings.active || 0, color: '#6366f1' },
      { label: 'Pending', value: stats.bookings.pending || 0, color: '#f59e0b' },
    ].filter(item => item.value > 0)
  }, [stats?.bookings])

  const orderChartData = useMemo(() => {
    if (!stats?.orders) return []
    return [
      { label: 'Delivered', value: stats.orders.delivered || 0, color: '#10b981' },
      { label: 'In Transit', value: stats.orders.inTransit || 0, color: '#6366f1' },
      { label: 'Pending', value: stats.orders.pending || 0, color: '#f59e0b' },
    ].filter(item => item.value > 0)
  }, [stats?.orders])

  // Analytics computations
  const totalBookings = useMemo(() => {
    if (!stats?.bookings) return 0
    return (stats.bookings.completed || 0) + (stats.bookings.active || 0) + (stats.bookings.pending || 0) + (stats.bookings.cancelled || 0)
  }, [stats?.bookings])

  const totalOrders = useMemo(() => {
    if (!stats?.orders) return 0
    return (stats.orders.delivered || 0) + (stats.orders.inTransit || 0) + (stats.orders.pending || 0) + (stats.orders.cancelled || 0)
  }, [stats?.orders])

  const bookingCompletionRate = totalBookings > 0 ? Math.round(((stats?.bookings?.completed || 0) / totalBookings) * 100) : 0
  const orderDeliveryRate = totalOrders > 0 ? Math.round(((stats?.orders?.delivered || 0) / totalOrders) * 100) : 0

  const sparkData = useMemo(() => {
    const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#6366f1', '#4f46e5', '#818cf8', '#6366f1']
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      label: day,
      value: Math.max(1, Math.floor(((stats?.bookings?.completed || 0) + (stats?.orders?.delivered || 0)) / 7 + (i % 3) * 2)),
      color: colors[i]
    }))
  }, [stats])

  const getStatusBadge = (status) => {
    const map = { completed: 'sk-badge-success', pending: 'sk-badge-warning', accepted: 'sk-badge-info', 'in-progress': 'sk-badge-info', cancelled: 'sk-badge-danger', delivered: 'sk-badge-success', processing: 'sk-badge-info', shipped: 'sk-badge-info' }
    return map[status] || 'sk-badge-default'
  }

  if (user?.role !== 'customer') return <Navigate to="/dashboard" />
  if (loading && !stats) return <LoadingSpinner />

  if (error) {
    return (
      <div className="sk-dashboard">
        <div className="sk-dashboard-container">
          <div className="sk-card"><div className="sk-empty">
            <div className="sk-empty-icon">⚠️</div>
            <h3 className="sk-empty-title">{error}</h3>
            <button onClick={fetchStats} className="sk-btn sk-btn-primary" style={{ marginTop: '16px' }}>
              <i className="fas fa-refresh"></i> Retry
            </button>
          </div></div>
        </div>
      </div>
    )
  }

  return (
    <div className="sk-dashboard">
      <div className="sk-dashboard-container">
        {/* Header */}
        <header className="sk-dash-header sk-animate">
          <div className="sk-dash-header-left">
            <div className="sk-dash-avatar">
              <ImageWithFallback src={user?.profilePicture} alt={user?.name} type="user" />
            </div>
            <div>
              <h1 className="sk-dash-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
              <p className="sk-dash-subtitle">Here's your account overview</p>
            </div>
          </div>
          <div className="sk-dash-actions">
            <Link to="/services" className="sk-btn sk-btn-primary">
              <i className="fas fa-calendar-plus"></i> Book Service
            </Link>
            <Link to="/shop" className="sk-btn sk-btn-secondary">
              <i className="fas fa-shopping-bag"></i> Shop
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="sk-stats-grid">
          <div className="sk-stat-card gradient-indigo sk-animate sk-delay-1">
            <div className="sk-stat-icon"><i className="fas fa-calendar-check"></i></div>
            <div className="sk-stat-value">{stats?.bookings?.pending || 0}</div>
            <div className="sk-stat-label">Active Bookings</div>
          </div>
          <div className="sk-stat-card gradient-amber sk-animate sk-delay-2">
            <div className="sk-stat-icon"><i className="fas fa-box"></i></div>
            <div className="sk-stat-value">{stats?.orders?.pending || 0}</div>
            <div className="sk-stat-label">Pending Orders</div>
          </div>
          <div className="sk-stat-card gradient-green sk-animate sk-delay-3">
            <div className="sk-stat-icon"><i className="fas fa-check-circle"></i></div>
            <div className="sk-stat-value">{stats?.bookings?.completed || 0}</div>
            <div className="sk-stat-label">Completed</div>
          </div>
          <div className="sk-stat-card gradient-blue sk-animate sk-delay-4">
            <div className="sk-stat-icon"><i className="fas fa-wallet"></i></div>
            <div className="sk-stat-value">₹{(stats?.totalSpent || 0).toLocaleString()}</div>
            <div className="sk-stat-label">Total Spent</div>
          </div>
        </div>

        {/* Glassmorphism Highlight Card */}
        <div className="sk-glass-card sk-animate" style={{ marginBottom: '22px' }}>
          <div className="sk-glass-card-row">
            <div className="sk-glass-card-info">
              <h4>{totalBookings + totalOrders} Total Activities</h4>
              <p>Your combined bookings & orders at a glance</p>
            </div>
            <SparkBars data={sparkData} height={36} barWidth={8} gap={4} color="#6366f1" />
            <SummaryRow items={[
              { icon: 'fas fa-tools', value: totalBookings, label: 'Bookings', color: '#6366f1' },
              { icon: 'fas fa-shopping-bag', value: totalOrders, label: 'Orders', color: '#10b981' },
              { icon: 'fas fa-star', value: stats?.bookings?.completed || 0, label: 'Completed', color: '#f59e0b' },
            ]} />
          </div>
        </div>

        {/* Analytics Section: Charts + Completion Rates */}
        <div className="sk-analytics-grid-2">
          {/* Pie Charts */}
          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-chart-pie"></i> Bookings Distribution</h3>
              <span className="sk-badge sk-badge-default">{totalBookings} total</span>
            </div>
            <div className="sk-analytics-body">
              <PieChart data={bookingChartData} size={160} innerRadius={0.6} showLegend={true} />
            </div>
          </div>

          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-chart-pie"></i> Orders Distribution</h3>
              <span className="sk-badge sk-badge-default">{totalOrders} total</span>
            </div>
            <div className="sk-analytics-body">
              <PieChart data={orderChartData} size={160} innerRadius={0.6} showLegend={true} />
            </div>
          </div>
        </div>

        {/* Completion Rates + Status Breakdown */}
        <div className="sk-analytics-grid-2">
          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-bullseye"></i> Completion Rates</h3>
            </div>
            <div className="sk-analytics-body">
              <div className="sk-progress-ring-container">
                <ProgressRing value={stats?.bookings?.completed || 0} max={totalBookings || 1}
                  size={100} color="#6366f1" label="Bookings" sublabel="done" />
                <ProgressRing value={stats?.orders?.delivered || 0} max={totalOrders || 1}
                  size={100} color="#10b981" label="Orders" sublabel="delivered" />
              </div>
            </div>
          </div>

          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-chart-bar"></i> Status Breakdown</h3>
            </div>
            <div className="sk-analytics-body">
              <HorizontalBar label="Bookings Completed" value={stats?.bookings?.completed || 0} max={totalBookings || 1} color="#10b981" />
              <HorizontalBar label="Bookings Active" value={stats?.bookings?.active || 0} max={totalBookings || 1} color="#6366f1" />
              <HorizontalBar label="Bookings Pending" value={stats?.bookings?.pending || 0} max={totalBookings || 1} color="#f59e0b" />
              <HorizontalBar label="Orders Delivered" value={stats?.orders?.delivered || 0} max={totalOrders || 1} color="#10b981" />
              <HorizontalBar label="Orders In Transit" value={stats?.orders?.inTransit || 0} max={totalOrders || 1} color="#0ea5e9" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="sk-card sk-animate">
          <div className="sk-card-header">
            <h3 className="sk-card-title"><i className="fas fa-th-large"></i> Quick Actions</h3>
          </div>
          <div className="sk-card-body">
            <div className="sk-actions-grid">
              <Link to="/services" className="sk-action-item">
                <div className="sk-action-icon"><i className="fas fa-wrench"></i></div>
                <span className="sk-action-label">Book Service</span>
              </Link>
              <Link to="/shop" className="sk-action-item">
                <div className="sk-action-icon"><i className="fas fa-shopping-cart"></i></div>
                <span className="sk-action-label">Shop Products</span>
              </Link>
              <Link to="/dashboard/customer/bookings" className="sk-action-item">
                <div className="sk-action-icon"><i className="fas fa-calendar-alt"></i></div>
                <span className="sk-action-label">My Bookings</span>
              </Link>
              <Link to="/dashboard/customer/orders" className="sk-action-item">
                <div className="sk-action-icon"><i className="fas fa-truck"></i></div>
                <span className="sk-action-label">Track Orders</span>
              </Link>
              <Link to="/dashboard/customer/profile" className="sk-action-item">
                <div className="sk-action-icon"><i className="fas fa-user-cog"></i></div>
                <span className="sk-action-label">Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="sk-row sk-row-2">
          {/* Recent Bookings */}
          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-calendar-check"></i> Recent Bookings</h3>
              <Link to="/dashboard/customer/bookings" className="sk-btn sk-btn-ghost sk-btn-sm">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="sk-analytics-body">
              {stats?.bookings?.recent?.length > 0 ? (
                stats.bookings.recent.map((booking) => (
                  <div key={booking._id} className="sk-timeline-item">
                    <div className="sk-timeline-dot" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                      <i className="fas fa-tools"></i>
                    </div>
                    <div className="sk-timeline-content">
                      <p className="sk-timeline-title">{booking.service?.name}</p>
                      <p className="sk-timeline-subtitle">
                        {booking.worker?.name && `${booking.worker.name} · `}
                        {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="sk-timeline-right">
                      <span className={`sk-badge ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sk-empty">
                  <div className="sk-empty-icon">📅</div>
                  <h4 className="sk-empty-title">No bookings yet</h4>
                  <p className="sk-empty-text">Start by booking a professional service</p>
                  <Link to="/services" className="sk-btn sk-btn-primary" style={{ marginTop: '12px' }}>
                    <i className="fas fa-plus"></i> Book Now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-shopping-bag"></i> Recent Orders</h3>
              <Link to="/dashboard/customer/orders" className="sk-btn sk-btn-ghost sk-btn-sm">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="sk-analytics-body">
              {stats?.orders?.recent?.length > 0 ? (
                stats.orders.recent.map((order) => (
                  <div key={order._id} className="sk-timeline-item">
                    <div className="sk-timeline-dot" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      <i className="fas fa-box"></i>
                    </div>
                    <div className="sk-timeline-content">
                      <p className="sk-timeline-title">Order #{order.orderNumber}</p>
                      <p className="sk-timeline-subtitle">
                        {order.items?.length} items · {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="sk-timeline-right">
                      <span className="sk-timeline-amount">₹{((order.total || order.totalAmount) || 0).toLocaleString()}</span>
                      <span className={`sk-badge ${getStatusBadge(order.status)}`}>{order.status?.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sk-empty">
                  <div className="sk-empty-icon">🛒</div>
                  <h4 className="sk-empty-title">No orders yet</h4>
                  <p className="sk-empty-text">Browse our shop for quality products</p>
                  <Link to="/shop" className="sk-btn sk-btn-primary" style={{ marginTop: '12px' }}>
                    <i className="fas fa-shopping-bag"></i> Shop Now
                  </Link>
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
