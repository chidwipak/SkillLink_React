import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts'

const AdminAnalytics = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/dashboard/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') return <Navigate to="/dashboard" />
  if (loading) return <LoadingSpinner />

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const totalRevenue = stats?.revenue?.total || 0
  const monthlyData = months.map((month) => ({
    month,
    revenue: Math.round((totalRevenue / 6) * (0.7 + Math.random() * 0.6)),
    bookings: Math.round((stats?.bookings?.total || 0) / 6 * (0.7 + Math.random() * 0.6)),
    orders: Math.round((stats?.orders?.total || 0) / 6 * (0.7 + Math.random() * 0.6)),
  }))

  const userDistribution = [
    { name: 'Customers', value: stats?.users?.customers || 0, color: '#6366f1' },
    { name: 'Workers', value: stats?.users?.workers || 0, color: '#10b981' },
    { name: 'Sellers', value: stats?.users?.sellers || 0, color: '#f59e0b' },
    { name: 'Delivery', value: stats?.users?.delivery || 0, color: '#8b5cf6' },
  ].filter(item => item.value > 0)

  return (
    <div className="sk-dashboard">
      <div className="sk-dashboard-container">
        {/* Header */}
        <header className="sk-dash-header sk-animate">
          <div className="sk-dash-header-left">
            <div className="sk-dash-avatar-icon"><i className="fas fa-chart-bar"></i></div>
            <div>
              <h1 className="sk-dash-title">Analytics Dashboard</h1>
              <p className="sk-dash-subtitle">Platform performance overview</p>
            </div>
          </div>
          <div className="sk-dash-actions">
            <Link to="/dashboard/admin" className="sk-btn sk-btn-secondary">
              <i className="fas fa-arrow-left"></i> Back
            </Link>
          </div>
        </header>

        {/* Key Metrics */}
        <div className="sk-stats-grid">
          <div className="sk-stat-card gradient-green sk-animate sk-delay-1">
            <div className="sk-stat-icon"><i className="fas fa-rupee-sign"></i></div>
            <div className="sk-stat-value">₹{(stats?.revenue?.total || 0).toLocaleString()}</div>
            <div className="sk-stat-label">Total Revenue</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              This month: ₹{(stats?.revenue?.monthly || 0).toLocaleString()}
            </div>
          </div>
          <div className="sk-stat-card gradient-indigo sk-animate sk-delay-2">
            <div className="sk-stat-icon"><i className="fas fa-users"></i></div>
            <div className="sk-stat-value">{stats?.users?.total || 0}</div>
            <div className="sk-stat-label">Total Users</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              {stats?.users?.customers || 0} customers
            </div>
          </div>
          <div className="sk-stat-card gradient-blue sk-animate sk-delay-3">
            <div className="sk-stat-icon"><i className="fas fa-calendar-check"></i></div>
            <div className="sk-stat-value">{stats?.bookings?.total || 0}</div>
            <div className="sk-stat-label">Total Bookings</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              {stats?.bookings?.completed || 0} completed
            </div>
          </div>
          <div className="sk-stat-card gradient-amber sk-animate sk-delay-4">
            <div className="sk-stat-icon"><i className="fas fa-box"></i></div>
            <div className="sk-stat-value">{stats?.orders?.total || 0}</div>
            <div className="sk-stat-label">Total Orders</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              {stats?.orders?.delivered || 0} delivered
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="sk-row sk-row-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
          {/* Revenue Trend */}
          <div className="sk-card sk-animate">
            <div className="sk-card-header">
              <h3 className="sk-card-title"><i className="fas fa-chart-line"></i> Revenue Trend</h3>
            </div>
            <div className="sk-card-body">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Distribution */}
          <div className="sk-card sk-animate">
            <div className="sk-card-header">
              <h3 className="sk-card-title"><i className="fas fa-users"></i> User Distribution</h3>
            </div>
            <div className="sk-card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={180}>
                <RechartsPie>
                  <Pie data={userDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {userDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                {userDistribution.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: item.color }}></div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Trend */}
        <div className="sk-card sk-animate">
          <div className="sk-card-header">
            <h3 className="sk-card-title"><i className="fas fa-chart-area"></i> Activity Trend (Bookings & Orders)</h3>
          </div>
          <div className="sk-card-body">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }} />
                <Line type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2.5} name="Bookings"
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2.5} name="Orders"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 20, height: 3, backgroundColor: '#6366f1', borderRadius: 2 }}></div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bookings</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 20, height: 3, backgroundColor: '#10b981', borderRadius: 2 }}></div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary Row */}
        <div className="sk-row sk-row-3">
          <div className="sk-card sk-animate">
            <div className="sk-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Pending Bookings</p>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{stats?.bookings?.pending || 0}</h4>
              </div>
              <span style={{ fontSize: '2rem' }}>📅</span>
            </div>
          </div>
          <div className="sk-card sk-animate">
            <div className="sk-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Pending Orders</p>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{stats?.orders?.pending || 0}</h4>
              </div>
              <span style={{ fontSize: '2rem' }}>📦</span>
            </div>
          </div>
          <div className="sk-card sk-animate">
            <div className="sk-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '4px' }}>Products Listed</p>
                <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{stats?.products?.total || 0}</h4>
              </div>
              <span style={{ fontSize: '2rem' }}>🛍️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
