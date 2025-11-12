import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import { SkeletonList } from '../../components/ui/SkeletonLoader'
import toast from 'react-hot-toast'

const WorkerBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [finalPrice, setFinalPrice] = useState('')
  const fetchedRef = useRef(false)

  useEffect(() => {
    // Prevent double fetch
    if (fetchedRef.current) return
    fetchedRef.current = true
    
    const loadBookings = async () => {
      try {
        const response = await api.get('/bookings')
        setBookings(response.data.bookings || [])
      } catch (error) {
        console.error('Worker bookings error:', error.response?.data || error)
        toast.error('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }
    
    loadBookings()
  }, [])

  const refreshBookings = async () => {
    try {
      const response = await api.get('/bookings')
      setBookings(response.data.bookings || [])
    } catch (error) {
      console.error('Refresh bookings error:', error)
    }
  }

  const handleAccept = async (id) => {
    try {
      await api.put(`/bookings/${id}/accept`)
      toast.success('Job accepted successfully')
      refreshBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept booking')
    }
  }

  const handleStart = async (id) => {
    try {
      await api.put(`/bookings/${id}/start`)
      toast.success('Job started successfully')
      refreshBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start job')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    try {
      await api.put(`/bookings/${id}/reject`, { reason })
      toast.success('Booking rejected')
      refreshBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject booking')
    }
  }

  const handleCompleteClick = (booking) => {
    setSelectedBooking(booking)
    setFinalPrice(booking.price || '')
    setShowCompleteModal(true)
  }

  const handleComplete = async () => {
    if (!finalPrice || parseFloat(finalPrice) <= 0) {
      toast.error('Please enter a valid final price')
      return
    }

    try {
      const response = await api.put(`/bookings/${selectedBooking._id}/complete`, {
        finalPrice: parseFloat(finalPrice)
      })
      toast.success('Booking completed successfully! Earnings updated.')
      setShowCompleteModal(false)
      setSelectedBooking(null)
      setFinalPrice('')
      refreshBookings()
      // Optionally trigger a refresh of the dashboard stats
      window.dispatchEvent(new Event('earningsUpdated'))
    } catch (error) {
      console.error('Complete booking error:', error)
      toast.error(error.response?.data?.message || 'Failed to complete booking')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      <SkeletonList count={4} />
    </div>
  )

  return (
    <div>
      <div className="dashboard-header mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h2 mb-1">My Jobs</h1>
          <p className="text-muted">Manage all your assigned jobs and bookings.</p>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <select 
          className="form-select me-2" 
          style={{width: 'auto'}}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-muted small">Total bookings: {bookings.length}</span>
      </div>

      <div className="dashboard-table-card">
        <h5>Job Bookings</h5>
        <div className="table-responsive">
          <table className="dashboard-table table table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Price (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings && filteredBookings.length > 0 ? (
                filteredBookings.map((booking, i) => (
                  <tr key={booking._id}>
                    <td>{i + 1}</td>
                    <td>
                      <div>
                        <strong>{booking.customer?.name || '-'}</strong>
                        <br/>
                        <small className="text-muted">{booking.customer?.phone || booking.customer?.email || ''}</small>
                        <br/>
                        {/* Show booking address (string or object) */}
                        {booking.address ? (
                          <small className="text-info d-block mt-1">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {typeof booking.address === 'string' 
                              ? booking.address 
                              : `${booking.address.street || ''}, ${booking.address.city || ''} ${booking.address.zipCode || ''}`
                            }
                          </small>
                        ) : booking.customer?.address ? (
                          <small className="text-info d-block mt-1">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {typeof booking.customer.address === 'string'
                              ? booking.customer.address
                              : `${booking.customer.address.street || ''}, ${booking.customer.address.city || ''} ${booking.customer.address.zipCode || ''}`
                            }
                          </small>
                        ) : (
                          <small className="text-muted d-block mt-1">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            No address provided
                          </small>
                        )}
                      </div>
                    </td>
                    <td>{booking.service?.name || '—'}</td>
                    <td>{booking.date ? new Date(booking.date).toLocaleDateString() : ''}</td>
                    <td>{booking.time}</td>
                    <td>{booking.finalPrice ? booking.finalPrice.toLocaleString() : (booking.price ? booking.price.toLocaleString() : '—')}</td>
                    <td>
                      {booking.status === 'pending' && <span className="dashboard-badge warning">Pending</span>}
                      {booking.status === 'accepted' && <span className="dashboard-badge info">Accepted</span>}
                      {booking.status === 'in-progress' && <span className="dashboard-badge primary">In Progress</span>}
                      {booking.status === 'completed' && <span className="dashboard-badge success">Completed</span>}
                      {booking.status === 'rejected' && <span className="dashboard-badge danger">Rejected</span>}
                      {booking.status === 'cancelled' && <span className="dashboard-badge secondary">Cancelled</span>}
                    </td>
                    <td>
                      {booking.status === 'pending' && (
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => handleAccept(booking._id)}
                            title="Accept Job"
                          >
                            <i className="fas fa-check me-1"></i> Accept
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleReject(booking._id)}
                            title="Reject Job"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                      {(booking.status === 'accepted' || booking.status === 'in-progress') && (
                        <button 
                          className="btn btn-sm btn-success" 
                          onClick={() => handleCompleteClick(booking)}
                          title="Mark Completed & Enter Final Price"
                        >
                          <i className="fas fa-check-circle me-1"></i> Complete
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <span className="text-success small">
                          <i className="fas fa-check-circle me-1"></i> Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    No bookings found for selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Booking Modal */}
      {showCompleteModal && selectedBooking && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowCompleteModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Complete Job & Enter Final Price</h5>
                <button type="button" className="btn-close" onClick={() => setShowCompleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p className="text-muted mb-3">
                    Customer: <strong>{selectedBooking.customer?.name}</strong><br/>
                    Service: <strong>{selectedBooking.service?.name}</strong><br/>
                    Original Price: <strong>₹{selectedBooking.price}</strong><br/>
                    {selectedBooking.address && (
                      <>
                        Address: <strong>
                          {selectedBooking.address.street}, {selectedBooking.address.city}, {selectedBooking.address.state} - {selectedBooking.address.zipCode}
                        </strong>
                      </>
                    )}
                  </p>
                  <label className="form-label">Final Service Price</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      value={finalPrice}
                      onChange={(e) => setFinalPrice(e.target.value)}
                      placeholder="Enter final price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <small className="text-muted">
                    Enter the final price charged for this service. This will be added to your earnings.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-success" onClick={handleComplete}>
                  <i className="fas fa-check-circle me-1"></i> Complete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkerBookings
