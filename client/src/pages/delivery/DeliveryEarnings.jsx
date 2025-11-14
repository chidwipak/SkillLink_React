import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const DeliveryEarnings = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.get('/delivery/stats'),
        api.get('/delivery/history')
      ])
      setStats(statsRes.data.stats || {})
      setHistory(historyRes.data.deliveries || [])
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'delivery') {
    return <Navigate to="/dashboard" />
  }

  if (loading) return <LoadingSpinner />

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekData = days.map(day => ({ day, earnings: 0, deliveries: 0 }))
    
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    history.forEach(delivery => {
      const date = new Date(delivery.actualDeliveryDate)
      if (date >= oneWeekAgo) {
        const dayIndex = date.getDay()
        weekData[dayIndex].earnings += 50
        weekData[dayIndex].deliveries += 1
      }
    })
    
    return weekData
  }

  const weeklyData = getWeeklyData()

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h4 className="mb-1 fw-semibold">Earnings</h4>
          <p className="text-muted mb-0 small">Track your delivery earnings</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>💰</span>
              </div>
              <p className="text-muted small mb-0">Total Earnings</p>
            </div>
            <h3 className="mb-0 fw-bold">₹{(stats?.totalEarnings || 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>💵</span>
              </div>
              <p className="text-muted small mb-0">Today's Earnings</p>
            </div>
            <h3 className="mb-0 fw-bold">₹{(stats?.todayEarnings || 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>📦</span>
              </div>
              <p className="text-muted small mb-0">Total Deliveries</p>
            </div>
            <h3 className="mb-0 fw-bold">{stats?.totalDeliveries || 0}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>🚚</span>
              </div>
              <p className="text-muted small mb-0">Today's Deliveries</p>
            </div>
            <h3 className="mb-0 fw-bold">{stats?.todayDeliveries || 0}</h3>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Weekly Earnings Chart */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent py-3">
              <h6 className="mb-0 fw-semibold">Weekly Earnings</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [name === 'earnings' ? `₹${value}` : value, name === 'earnings' ? 'Earnings' : 'Deliveries']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #eee' }}
                  />
                  <Bar dataKey="earnings" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Earnings Info */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent py-3">
              <h6 className="mb-0 fw-semibold">Earnings Info</h6>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">Rate per Delivery</span>
                  <strong>₹50</strong>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">Today's Deliveries</span>
                  <strong>{stats?.todayDeliveries || 0}</strong>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">Today's Earnings</span>
                  <strong>₹{(stats?.todayEarnings || 0).toLocaleString()}</strong>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">Average per Day</span>
                  <strong>
                    ₹{stats?.totalDeliveries > 0 ? Math.round(stats.totalEarnings / Math.max(1, Math.ceil(stats.totalDeliveries / 30))).toLocaleString() : 0}
                  </strong>
                </li>
              </ul>
              
              <div className="mt-3 p-2 bg-light rounded small text-muted">
                Earnings are credited after successful OTP verification.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent py-3">
          <h6 className="mb-0 fw-semibold">Recent Deliveries</h6>
        </div>
        <div className="card-body p-0">
          {history.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="fw-medium">Order #</th>
                    <th className="fw-medium">Customer</th>
                    <th className="fw-medium">Delivered At</th>
                    <th className="fw-medium">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((delivery) => (
                    <tr key={delivery._id}>
                      <td>#{delivery.orderNumber || delivery._id?.substring(0, 8)}</td>
                      <td>{delivery.customer?.name || 'Customer'}</td>
                      <td className="text-muted">{new Date(delivery.actualDeliveryDate).toLocaleString()}</td>
                      <td className="fw-medium">₹50</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-1">No deliveries yet</p>
              <small className="text-muted">Complete your first delivery to see earnings here</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeliveryEarnings
