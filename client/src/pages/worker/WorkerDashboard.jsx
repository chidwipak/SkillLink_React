import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const WorkerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
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

  if (user?.role !== 'worker') {
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

  return (
    <div className="container-fluid">
      {/* Header with Profile Quick Access */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle overflow-hidden" style={{ width: '50px', height: '50px', border: '2px solid #e2e8f0' }}>
            <ImageWithFallback
              src={user?.profilePicture}
              alt={user?.name}
              type="worker"
              className="w-100 h-100 object-fit-cover"
            />
          </div>
          <div>
            <h4 className="mb-1 fw-semibold">Worker Dashboard</h4>
            <p className="text-muted mb-0 small">Manage your jobs and track earnings</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link to="/dashboard/worker/profile" className="btn btn-outline-primary btn-sm">
            ✏️ Edit Profile
          </Link>
          <Link to="/dashboard/worker/bookings" className="btn btn-outline-secondary btn-sm">
            View Jobs
          </Link>
          <Link to="/dashboard/worker/earnings" className="btn btn-outline-secondary btn-sm">
            Earnings
          </Link>
        </div>
      </div>

      {!stats?.worker?.isVerified && (
        <div className="alert alert-warning py-2 mb-4 small">
          Your account is pending verification. You'll be able to receive bookings once verified.
        </div>
      )}

      {/* Stats Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>⏳</span>
              </div>
              <p className="text-muted small mb-0">Pending Jobs</p>
            </div>
            <h3 className="mb-0 fw-bold">{stats?.bookings?.pending || 0}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>🔧</span>
              </div>
              <p className="text-muted small mb-0">Active Jobs</p>
            </div>
            <h3 className="mb-0 fw-bold">{(stats?.bookings?.accepted || 0) + (stats?.bookings?.inProgress || 0)}</h3>
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
            <h3 className="mb-0 fw-bold">{stats?.bookings?.completed || 0}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>💰</span>
              </div>
              <p className="text-muted small mb-0">Total Earnings</p>
            </div>
            <h3 className="mb-1 fw-bold">₹{(stats?.earnings?.total || 0).toLocaleString()}</h3>
            <small className="text-muted">This month: ₹{(stats?.earnings?.monthly || 0).toLocaleString()}</small>
          </div>
        </div>
      </div>

      {/* Quick Info Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">Rating</p>
                <h4 className="mb-0 fw-semibold">⭐ {stats?.worker?.rating?.toFixed(1) || 'N/A'}</h4>
              </div>
              <span className="text-muted small">{stats?.worker?.totalRatings || 0} reviews</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">Status</p>
                <h5 className={`mb-0 fw-semibold ${stats?.worker?.isAvailable ? 'text-success' : 'text-danger'}`}>
                  {stats?.worker?.isAvailable ? 'Available' : 'Unavailable'}
                </h5>
              </div>
              <Link to="/dashboard/worker/availability" className="btn btn-sm btn-outline-secondary">Update</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">Jobs Done</p>
                <h4 className="mb-0 fw-semibold">{stats?.earnings?.completedJobs || 0}</h4>
              </div>
              <span className="text-muted small">Total: {stats?.bookings?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      {stats?.chartData && (stats.chartData.accepted.value > 0 || stats.chartData.completed.value > 0) && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-transparent py-3">
            <h6 className="mb-0 fw-semibold">Service Value Overview</h6>
          </div>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-5">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Accepted', value: stats.chartData.accepted.value, count: stats.chartData.accepted.count },
                        { name: 'Completed', value: stats.chartData.completed.value, count: stats.chartData.completed.count }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#6c757d" />
                      <Cell fill="#212529" />
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="col-md-7">
                <div className="d-flex align-items-center mb-3">
                  <div style={{width: '12px', height: '12px', backgroundColor: '#6c757d', marginRight: '12px', borderRadius: '2px'}}></div>
                  <div>
                    <p className="mb-0 fw-medium">Accepted Jobs</p>
                    <small className="text-muted">₹{stats.chartData.accepted.value.toLocaleString()} ({stats.chartData.accepted.count} jobs)</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{width: '12px', height: '12px', backgroundColor: '#212529', marginRight: '12px', borderRadius: '2px'}}></div>
                  <div>
                    <p className="mb-0 fw-medium">Completed (Earned)</p>
                    <small className="text-muted">₹{stats.chartData.completed.value.toLocaleString()} ({stats.chartData.completed.count} jobs)</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-3">
          <h6 className="mb-0 fw-semibold">Recent Bookings</h6>
          <Link to="/dashboard/worker/bookings" className="text-decoration-none small">View all →</Link>
        </div>
        <div className="card-body p-0">
          {stats?.bookings?.recent?.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="fw-medium">Customer</th>
                    <th className="fw-medium">Service</th>
                    <th className="fw-medium">Date</th>
                    <th className="fw-medium">Price</th>
                    <th className="fw-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.bookings.recent.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.customer?.name}</td>
                      <td>{booking.service?.name}</td>
                      <td className="text-muted">{new Date(booking.date).toLocaleDateString()}</td>
                      <td>₹{booking.finalPrice || booking.price}</td>
                      <td>
                        <span className={`badge rounded-pill ${
                          booking.status === 'completed' ? 'bg-success' :
                          booking.status === 'pending' ? 'bg-warning text-dark' :
                          booking.status === 'accepted' ? 'bg-info' :
                          'bg-secondary'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-1">No bookings yet</p>
              <small className="text-muted">Bookings will appear here once customers book your services</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkerDashboard
