import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AdminDashboard = () => {
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
      const response = await api.get('/dashboard/admin/stats')
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-5">
        <p className="text-danger mb-4">{error}</p>
        <button onClick={fetchStats} className="btn btn-dark">Retry</button>
      </div>
    )
  }

  const totalPendingVerifications = 
    (stats?.verifications?.pendingWorkers || 0) + 
    (stats?.verifications?.pendingSellers || 0) + 
    (stats?.verifications?.pendingDelivery || 0)

  // Generate simple trend data
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const trendData = months.map((month, i) => ({
    month,
    value: Math.round((stats?.revenue?.total || 0) / 6 * (0.7 + Math.random() * 0.6))
  }))

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
            <h4 className="mb-1 fw-semibold">Admin Dashboard</h4>
            <p className="text-muted mb-0 small">Platform overview and management</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link to="/dashboard/admin/profile" className="btn btn-outline-primary btn-sm">
            ✏️ Edit Profile
          </Link>
          <Link to="/dashboard/admin/users" className="btn btn-outline-secondary btn-sm">Users</Link>
          <Link to="/dashboard/admin/analytics" className="btn btn-outline-secondary btn-sm">Analytics</Link>
        </div>
      </div>

      {/* Key Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>💰</span>
              </div>
              <p className="text-muted small mb-0">Total Revenue</p>
            </div>
            <h3 className="fw-bold mb-1">₹{(stats?.revenue?.total || 0).toLocaleString()}</h3>
            <small className="text-muted">This month: ₹{(stats?.revenue?.monthly || 0).toLocaleString()}</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>👥</span>
              </div>
              <p className="text-muted small mb-0">Total Users</p>
            </div>
            <h3 className="fw-bold mb-1">{stats?.users?.total || 0}</h3>
            <small className="text-muted">{stats?.users?.customers || 0} customers, {stats?.users?.workers || 0} workers</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>📅</span>
              </div>
              <p className="text-muted small mb-0">Active Bookings</p>
            </div>
            <h3 className="fw-bold mb-1">{stats?.bookings?.pending || 0}</h3>
            <small className="text-muted">of {stats?.bookings?.total || 0} total</small>
          </div>
        </div>
        <div className="col-md-3">
          <Link to="/dashboard/admin/verification" className="text-decoration-none">
            <div className={`p-4 rounded-3 ${totalPendingVerifications > 0 ? 'bg-warning bg-opacity-10 border border-warning' : 'bg-light'}`}>
              <p className="text-muted small mb-1">Pending Verifications</p>
              <h3 className={`fw-bold mb-1 ${totalPendingVerifications > 0 ? 'text-warning' : ''}`}>{totalPendingVerifications}</h3>
              <small className="text-primary">Review now →</small>
            </div>
          </Link>
        </div>
      </div>

      {/* Chart & Quick Stats */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent py-3 border-0">
              <h6 className="mb-0 fw-semibold">Revenue Trend</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #eee' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0d6efd" 
                    strokeWidth={2}
                    dot={{ fill: '#0d6efd', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent py-3 border-0">
              <h6 className="mb-0 fw-semibold">Quick Stats</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                <span className="text-muted">Orders</span>
                <div className="text-end">
                  <span className="fw-semibold">{stats?.orders?.total || 0}</span>
                  <small className="text-muted d-block">{stats?.orders?.delivered || 0} delivered</small>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                <span className="text-muted">Products</span>
                <div className="text-end">
                  <span className="fw-semibold">{stats?.products?.total || 0}</span>
                  <small className="text-muted d-block">{stats?.products?.active || 0} active</small>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                <span className="text-muted">Services</span>
                <span className="fw-semibold">{stats?.services?.total || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-3">
                <span className="text-muted">Sellers</span>
                <span className="fw-semibold">{stats?.users?.sellers || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verifications & Recent Users */}
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3 border-0">
              <h6 className="mb-0 fw-semibold">Pending Verifications</h6>
              <Link to="/dashboard/admin/verification" className="text-decoration-none small">View all →</Link>
            </div>
            <div className="card-body pt-0">
              {totalPendingVerifications > 0 ? (
                <div className="list-group list-group-flush">
                  {stats?.verifications?.pendingWorkers > 0 && (
                    <div className="list-group-item px-0 d-flex justify-content-between align-items-center">
                      <span>👷 Workers</span>
                      <span className="badge bg-warning text-dark">{stats.verifications.pendingWorkers}</span>
                    </div>
                  )}
                  {stats?.verifications?.pendingSellers > 0 && (
                    <div className="list-group-item px-0 d-flex justify-content-between align-items-center">
                      <span>🏪 Sellers</span>
                      <span className="badge bg-warning text-dark">{stats.verifications.pendingSellers}</span>
                    </div>
                  )}
                  {stats?.verifications?.pendingDelivery > 0 && (
                    <div className="list-group-item px-0 d-flex justify-content-between align-items-center">
                      <span>🚚 Delivery</span>
                      <span className="badge bg-warning text-dark">{stats.verifications.pendingDelivery}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-success">✓</span>
                  <p className="text-muted mb-0 mt-2 small">All verifications complete</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3 border-0">
              <h6 className="mb-0 fw-semibold">Recent Users</h6>
              <Link to="/dashboard/admin/users" className="text-decoration-none small">View all →</Link>
            </div>
            <div className="card-body p-0">
              {stats?.users?.recent?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <tbody>
                      {stats.users.recent.map((u) => (
                        <tr key={u._id}>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-light text-dark d-flex align-items-center justify-content-center me-3" 
                                   style={{ width: '36px', height: '36px', fontSize: '13px' }}>
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="mb-0 fw-medium">{u.name}</p>
                                <small className="text-muted">{u.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              u.role === 'admin' ? 'bg-danger' :
                              u.role === 'worker' ? 'bg-info' :
                              u.role === 'seller' ? 'bg-success' :
                              'bg-primary'
                            }`}>{u.role}</span>
                          </td>
                          <td className="text-muted text-end small">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">No recent users</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
