import { useState, useEffect } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const WorkerEarnings = () => {
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('all')

  useEffect(() => {
    fetchEarnings()
  }, [timeFilter])

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/dashboard/worker/stats`)
      setEarnings(response.data.earnings)
    } catch (error) {
      toast.error('Failed to fetch earnings')
      console.error('Earnings fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="dashboard-table-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Earnings Breakdown</h5>
          <select 
            className="form-select w-auto"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>

        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          Your earnings are calculated based on completed jobs. Pending payments will be processed within 2-3 business days.
        </div>

        <div className="row mt-4">
          <div className="col-md-12 mb-4">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="text-muted mb-3 text-center">Earnings Distribution</h6>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Accepted Jobs', value: earnings?.pending || 0 },
                        { name: 'Completed & Paid', value: earnings?.total || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#ffc107" />
                      <Cell fill="#28a745" />
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-3">
                  <small className="text-muted">Total Revenue: ₹{((earnings?.pending || 0) + (earnings?.total || 0)).toLocaleString()}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="text-muted mb-3">Payment Summary</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Completed Jobs:</span>
                  <strong>{earnings?.completedJobs || 0}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Pending Payments:</span>
                  <strong className="text-warning">₹{earnings?.pending?.toLocaleString() || 0}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Paid:</span>
                  <strong className="text-success">₹{earnings?.total?.toLocaleString() || 0}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Average per Job:</strong>
                  <strong className="text-primary">₹{earnings?.completedJobs > 0 ? Math.round(earnings?.total / earnings?.completedJobs).toLocaleString() : 0}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="text-muted mb-3">Performance Stats</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>This Month:</span>
                  <strong className="text-primary">₹{earnings?.monthly?.toLocaleString() || 0}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Last Month:</span>
                  <strong>₹{earnings?.lastMonth?.toLocaleString() || 0}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Growth:</span>
                  <strong className={earnings?.monthly > earnings?.lastMonth ? 'text-success' : 'text-danger'}>
                    {earnings?.monthly && earnings?.lastMonth 
                      ? `${((earnings.monthly - earnings.lastMonth) / earnings.lastMonth * 100).toFixed(1)}%`
                      : 'N/A'}
                  </strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Projected Monthly:</strong>
                  <strong className="text-info">₹{earnings?.projected?.toLocaleString() || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerEarnings
