import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import PieChart from '../../components/ui/PieChart'
import EarningsOverview from '../../components/ui/EarningsOverview'
import { ProgressRing, HorizontalBar, SummaryRow, SparkBars } from '../../components/ui/AnalyticsWidgets'

const WorkerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(false)

  const fetchStats = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)
      const response = await api.get('/dashboard/worker/stats')
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchStats()
    const handleEarningsUpdate = () => fetchStats(false)
    window.addEventListener('earningsUpdated', handleEarningsUpdate)
    return () => window.removeEventListener('earningsUpdated', handleEarningsUpdate)
  }, [])

  const getStatusBadge = (status) => {
    const map = { completed: 'sk-badge-success', pending: 'sk-badge-warning', accepted: 'sk-badge-info', 'in-progress': 'sk-badge-info', inProgress: 'sk-badge-info', cancelled: 'sk-badge-danger' }
    return map[status] || 'sk-badge-default'
  }

  const bookingChartData = useMemo(() => {
    if (!stats?.bookings) return []
    return [
      { label: 'Completed', value: stats.bookings.completed || 0, color: '#10b981' },
      { label: 'Active', value: (stats.bookings.accepted || 0) + (stats.bookings.inProgress || 0), color: '#6366f1' },
      { label: 'Pending', value: stats.bookings.pending || 0, color: '#f59e0b' },
      { label: 'Cancelled', value: stats.bookings.cancelled || 0, color: '#ef4444' },
    ].filter(item => item.value > 0)
  }, [stats?.bookings])

  // Analytics computations
  const totalJobs = useMemo(() => {
    if (!stats?.bookings) return 0
    return (stats.bookings.completed || 0) + (stats.bookings.accepted || 0) + (stats.bookings.inProgress || 0) + (stats.bookings.pending || 0) + (stats.bookings.cancelled || 0)
  }, [stats?.bookings])

  const successRate = totalJobs > 0 ? Math.round(((stats?.bookings?.completed || 0) / (totalJobs - (stats?.bookings?.pending || 0) || 1)) * 100) : 0
  const activeJobs = (stats?.bookings?.accepted || 0) + (stats?.bookings?.inProgress || 0)

  const earningsSparkData = useMemo(() => {
    const colors = ['#10b981', '#059669', '#34d399', '#10b981', '#047857', '#6ee7b7', '#10b981']
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      label: day,
      value: Math.max(1, Math.floor((stats?.earnings?.total || 0) / 30 + (i % 4) * 50)),
      color: colors[i]
    }))
  }, [stats])

  if (user?.role !== 'worker') return <Navigate to="/dashboard" />
  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="sk-dashboard">
        <div className="sk-dashboard-container">
          <div className="sk-card"><div className="sk-empty">
            <div className="sk-empty-icon">⚠️</div>
            <h3 className="sk-empty-title">{error}</h3>
            <button onClick={fetchStats} className="sk-btn sk-btn-primary" style={{ marginTop: '16px' }}>
              <i className="fas fa-redo"></i> Retry
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
              <ImageWithFallback src={user?.profilePicture} alt={user?.name} type="worker" />
            </div>
            <div>
              <h1 className="sk-dash-title">Worker Dashboard</h1>
              <p className="sk-dash-subtitle">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="sk-dash-actions">
            <Link to="/notifications" className="sk-btn sk-btn-secondary" title="Notifications" style={{ position: 'relative' }}>
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '0.625rem', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/dashboard/worker/profile" className="sk-btn sk-btn-secondary">
              <i className="fas fa-user-edit"></i> Profile
            </Link>
            <Link to="/dashboard/worker/bookings" className="sk-btn sk-btn-primary">
              <i className="fas fa-briefcase"></i> My Jobs
            </Link>
          </div>
        </header>

        {!stats?.worker?.isVerified && (
          <div className="sk-alert sk-alert-warning">
            <i className="fas fa-exclamation-triangle"></i>
            Your account is pending verification. You'll be able to receive bookings once verified.
          </div>
        )}

        {/* Stats Grid */}
        <div className="sk-stats-grid">
          <div className="sk-stat-card gradient-green sk-animate sk-delay-1">
            <div className="sk-stat-icon"><i className="fas fa-rupee-sign"></i></div>
            <div className="sk-stat-value">₹{(stats?.earnings?.total || 0).toLocaleString()}</div>
            <div className="sk-stat-label">Total Earnings</div>
          </div>
          <div className="sk-stat-card gradient-blue sk-animate sk-delay-2">
            <div className="sk-stat-icon"><i className="fas fa-calendar-check"></i></div>
            <div className="sk-stat-value">₹{(stats?.earnings?.monthly || 0).toLocaleString()}</div>
            <div className="sk-stat-label">Monthly Earnings</div>
          </div>
          <div className="sk-stat-card gradient-indigo sk-animate sk-delay-3">
            <div className="sk-stat-icon"><i className="fas fa-check-circle"></i></div>
            <div className="sk-stat-value">{stats?.bookings?.completed || 0}</div>
            <div className="sk-stat-label">Completed Jobs</div>
          </div>
          <div className="sk-stat-card gradient-amber sk-animate sk-delay-4">
            <div className="sk-stat-icon"><i className="fas fa-clock"></i></div>
            <div className="sk-stat-value">{stats?.bookings?.pending || 0}</div>
            <div className="sk-stat-label">Pending Jobs</div>
          </div>
        </div>

        {/* Glassmorphism Earnings Highlight */}
        <div className="sk-glass-card sk-animate" style={{ marginBottom: '22px' }}>
          <div className="sk-glass-card-row">
            <div className="sk-glass-card-info">
              <h4>₹{(stats?.earnings?.total || 0).toLocaleString()} Earned</h4>
              <p>Your earnings overview across all completed jobs</p>
            </div>
            <SparkBars data={earningsSparkData} height={36} barWidth={8} gap={4} color="#10b981" />
            <SummaryRow items={[
              { icon: 'fas fa-briefcase', value: totalJobs, label: 'Total Jobs', color: '#6366f1' },
              { icon: 'fas fa-star', value: stats?.worker?.rating?.toFixed(1) || 'N/A', label: 'Rating', color: '#f59e0b' },
              { icon: 'fas fa-trophy', value: `${successRate}%`, label: 'Success', color: '#10b981' },
            ]} />
          </div>
        </div>

        {/* Info Row */}
        <div className="sk-row sk-row-3">
          <div className="sk-card sk-animate">
            <div className="sk-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Your Rating</p>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
                  ⭐ {stats?.worker?.rating?.toFixed(1) || 'N/A'}
                </h4>
              </div>
              <span className="sk-badge sk-badge-default">{stats?.worker?.totalRatings || 0} reviews</span>
            </div>
          </div>
          <div className="sk-card sk-animate">
            <div className="sk-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Status</p>
                <h5 style={{ margin: 0, fontWeight: 600, color: stats?.worker?.isAvailable ? '#10b981' : '#ef4444' }}>
                  {stats?.worker?.isAvailable ? '● Available' : '○ Unavailable'}
                </h5>
              </div>
              <Link to="/dashboard/worker/availability" className="sk-btn sk-btn-secondary sk-btn-sm">Update</Link>
            </div>
          </div>
          <div className="sk-card sk-animate">
            <div className="sk-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Active Jobs</p>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#6366f1' }}>
                  {activeJobs}
                </h4>
              </div>
              <Link to="/dashboard/worker/earnings" className="sk-btn sk-btn-ghost sk-btn-sm">Earnings</Link>
            </div>
          </div>
        </div>

        {/* Analytics: Charts + Performance */}
        <div className="sk-analytics-grid-2">
          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-chart-pie"></i> Booking Overview</h3>
              <span className="sk-badge sk-badge-default">{totalJobs} total</span>
            </div>
            <div className="sk-analytics-body">
              <PieChart data={bookingChartData} size={180} innerRadius={0.6} showLegend={true} />
            </div>
          </div>

          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-bullseye"></i> Performance Metrics</h3>
            </div>
            <div className="sk-analytics-body">
              <div className="sk-progress-ring-container">
                <ProgressRing value={stats?.bookings?.completed || 0} max={totalJobs || 1}
                  size={90} color="#10b981" label="Completion" sublabel="rate" />
                <ProgressRing value={successRate} max={100}
                  size={90} color="#6366f1" label="Success" sublabel="rate" />
              </div>
              <div style={{ marginTop: '18px' }}>
                <HorizontalBar label="Completed" value={stats?.bookings?.completed || 0} max={totalJobs || 1} color="#10b981" />
                <HorizontalBar label="Active" value={activeJobs} max={totalJobs || 1} color="#6366f1" />
                <HorizontalBar label="Pending" value={stats?.bookings?.pending || 0} max={totalJobs || 1} color="#f59e0b" />
                <HorizontalBar label="Cancelled" value={stats?.bookings?.cancelled || 0} max={totalJobs || 1} color="#ef4444" />
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown - Daily/Weekly/Monthly/Yearly */}
        <EarningsOverview
          apiUrl="/dashboard/earnings/breakdown"
          title="Earnings Breakdown"
          currencyLabel="Earnings"
        />

        {/* Customer Feedback Section */}
        <div className="sk-analytics-card sk-animate">
          <div className="sk-analytics-header">
            <h3><i className="fas fa-comments"></i> Customer Feedback</h3>
            <span className="sk-badge sk-badge-default">{stats?.worker?.totalRatings || 0} reviews</span>
          </div>
          <div className="sk-analytics-body">
            {stats?.reviews?.length > 0 ? (
              stats.reviews.slice(0, 6).map((r, i) => (
                <div key={i} className="sk-review-item">
                  <div className="sk-review-avatar">{r.customer?.name?.charAt(0) || r.user?.name?.charAt(0) || '?'}</div>
                  <div className="sk-review-content">
                    <p className="sk-review-name">{r.customer?.name || r.user?.name || 'Customer'}</p>
                    <div className="sk-review-stars">{'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5 - Math.round(r.rating))}</div>
                    {r.comment && <p className="sk-review-text">{r.comment}</p>}
                    {r.service?.name && <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Service: {r.service.name}</p>}
                    <div className="sk-review-date">{new Date(r.createdAt || r.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="sk-empty">
                <div className="sk-empty-icon">💬</div>
                <h4 className="sk-empty-title">No feedback yet</h4>
                <p className="sk-empty-text">Customer feedback will appear here after completing services</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="sk-analytics-card sk-animate">
          <div className="sk-analytics-header">
            <h3><i className="fas fa-history"></i> Recent Bookings</h3>
            <Link to="/dashboard/worker/bookings" className="sk-btn sk-btn-ghost sk-btn-sm">
              View all <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="sk-analytics-body" style={{ padding: 0 }}>
            {stats?.bookings?.recent?.length > 0 ? (
              <table className="sk-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.bookings.recent.map((booking) => (
                    <tr key={booking._id}>
                      <td className="sk-table-primary">{booking.customer?.name}</td>
                      <td>{booking.service?.name}</td>
                      <td className="sk-table-secondary">{new Date(booking.date).toLocaleDateString()}</td>
                      <td className="sk-table-primary">₹{booking.finalPrice || booking.price}</td>
                      <td>
                        <span className={`sk-badge ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="sk-empty" style={{ padding: '24px' }}>
                <div className="sk-empty-icon">📋</div>
                <h4 className="sk-empty-title">No bookings yet</h4>
                <p className="sk-empty-text">Bookings will appear here once customers book your services</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerDashboard
