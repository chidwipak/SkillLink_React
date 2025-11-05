import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const WorkerAvailability = () => {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const response = await api.put('/workers/availability', { isAvailable: !isAvailable })
      setIsAvailable(response.data.worker.isAvailable)
      toast.success(`Availability ${!isAvailable ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update availability')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="dashboard-header mb-4">
        <h1 className="h2 mb-1">Availability Settings</h1>
        <p className="text-muted">Manage when you're available to accept new job bookings.</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="card-title mb-2">Current Status</h5>
                  <p className="text-muted mb-0">Toggle your availability to control whether customers can book your services</p>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={loading}
                  className={`btn btn-lg ${isAvailable ? 'btn-success' : 'btn-secondary'}`}
                  style={{ minWidth: '120px' }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  ) : (
                    <i className={`fas fa-${isAvailable ? 'toggle-on' : 'toggle-off'} me-2`}></i>
                  )}
                  {isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>

              <div className={`alert ${isAvailable ? 'alert-success' : 'alert-warning'} mb-0`}>
                <div className="d-flex align-items-start">
                  <i className={`fas fa-${isAvailable ? 'check-circle' : 'exclamation-triangle'} me-3 mt-1`} style={{fontSize: '1.5rem'}}></i>
                  <div>
                    <h6 className="alert-heading mb-1">
                      {isAvailable ? 'You are currently available' : 'You are currently unavailable'}
                    </h6>
                    <p className="mb-0">
                      {isAvailable
                        ? 'Customers can see and book your services. You will receive notifications for new booking requests.'
                        : 'Customers cannot book your services right now. You will not receive new booking requests.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="fas fa-lightbulb text-warning me-2"></i>
                Tips for Managing Availability
              </h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Turn off availability when you're on vacation or unable to take new work
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Keep your availability updated to avoid disappointing customers
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  You can still complete ongoing bookings when unavailable
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Respond promptly to bookings to maintain high ratings
                </li>
                <li className="mb-0">
                  <i className="fas fa-check text-success me-2"></i>
                  Toggle availability as needed - there are no penalties
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">
                <i className="fas fa-info-circle text-primary me-2"></i>
                How It Works
              </h6>
              <p className="small text-muted mb-3">
                When you're available, your profile appears in search results and customers can send you booking requests.
              </p>
              <div className="small">
                <div className="mb-2">
                  <strong className="text-success">✓ Available</strong>
                  <p className="text-muted mb-0">Visible to customers, receive booking requests</p>
                </div>
                <hr />
                <div>
                  <strong className="text-secondary">✗ Unavailable</strong>
                  <p className="text-muted mb-0">Hidden from search, no new requests</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body text-center">
              <i className="fas fa-star text-warning" style={{fontSize: '2rem'}}></i>
              <h6 className="mt-2 mb-1">Pro Tip</h6>
              <p className="small text-muted mb-0">
                Workers who maintain consistent availability tend to get more bookings and better ratings!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerAvailability
