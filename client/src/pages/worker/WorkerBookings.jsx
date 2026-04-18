import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import { SkeletonList } from '../../components/ui/SkeletonLoader'
import { useCelebration } from '../../contexts/CelebrationContext'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

const WorkerBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [finalPrice, setFinalPrice] = useState('')
  const [customerLocation, setCustomerLocation] = useState(null)
  const { celebrate } = useCelebration()
  const fetchedRef = useRef(false)
  const socketRef = useRef(null)
  const locationPollRef = useRef(null)

  const refreshBookings = async () => {
    try {
      const response = await api.get('/bookings')
      setBookings(response.data.bookings || [])
    } catch (error) {
      console.error('Refresh bookings error:', error)
    }
  }

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

    // Setup socket connection for real-time updates
    const token = localStorage.getItem('token')
    if (token) {
      socketRef.current = io('http://localhost:3001', {
        auth: { token }
      })

      // Listen for booking rejection events (when another worker accepts)
      socketRef.current.on('booking-rejected', (data) => {
        console.log('Booking rejected event:', data)
        if (data.reason === 'accepted_by_another') {
          // Remove the rejected booking from the list immediately
          setBookings(prev => prev.filter(b => b._id !== data.booking._id))
          toast.info('This booking was accepted by another worker', {
            duration: 3000,
            icon: 'ℹ️'
          })
        }
      })

      // Listen for new bookings
      socketRef.current.on('new-booking', () => {
        console.log('New booking received')
        refreshBookings()
      })
    }

    // Cleanup socket on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      if (locationPollRef.current) {
        clearInterval(locationPollRef.current)
      }
    }
  }, [])

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

  // View customer location
  const handleViewLocation = async (booking) => {
    setSelectedBooking(booking)
    setShowLocationModal(true)
    
    // Fetch current location
    try {
      const response = await api.get(`/bookings/${booking._id}`)
      if (response.data.booking?.customerLocation) {
        setCustomerLocation(response.data.booking.customerLocation)
      } else {
        setCustomerLocation(null)
      }
    } catch (error) {
      console.error('Failed to fetch location:', error)
    }
    
    // Poll for location updates
    locationPollRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/bookings/${booking._id}`)
        if (response.data.booking?.customerLocation) {
          setCustomerLocation(response.data.booking.customerLocation)
        }
      } catch (error) {
        console.error('Location poll error:', error)
      }
    }, 5000) // Poll every 5 seconds
  }

  const closeLocationModal = () => {
    setShowLocationModal(false)
    setSelectedBooking(null)
    setCustomerLocation(null)
    if (locationPollRef.current) {
      clearInterval(locationPollRef.current)
      locationPollRef.current = null
    }
  }

  const openInGoogleMaps = () => {
    if (customerLocation) {
      const url = `https://www.google.com/maps?q=${customerLocation.latitude},${customerLocation.longitude}`
      window.open(url, '_blank')
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

  // Calculate allowed price range (±30% of original price)
  const getPriceRange = () => {
    if (!selectedBooking || !selectedBooking.price) {
      return { min: 0, max: 10000 }
    }
    const basePrice = selectedBooking.price
    const minPrice = Math.floor(basePrice * 0.7) // -30%
    const maxPrice = Math.ceil(basePrice * 1.5) // +50%
    return { min: minPrice, max: maxPrice }
  }

  const handleComplete = async () => {
    if (!finalPrice || parseFloat(finalPrice) <= 0) {
      toast.error('Please enter a valid final price')
      return
    }

    const priceRange = getPriceRange()
    const enteredPrice = parseFloat(finalPrice)
    
    if (enteredPrice < priceRange.min) {
      toast.error(`Price cannot be less than ₹${priceRange.min} (70% of original price)`)
      return
    }
    
    if (enteredPrice > priceRange.max) {
      toast.error(`Price cannot exceed ₹${priceRange.max} (150% of original price)`)
      return
    }

    try {
      const response = await api.put(`/bookings/${selectedBooking._id}/complete`, {
        finalPrice: enteredPrice
      })
      toast.success('Booking completed successfully! Earnings updated.')
      celebrate({ count: 200 })
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
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-info" 
                            onClick={() => handleViewLocation(booking)}
                            title="View Customer Location"
                          >
                            <i className="fas fa-map-marker-alt"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => handleCompleteClick(booking)}
                            title="Mark Completed & Enter Final Price"
                          >
                            <i className="fas fa-check-circle me-1"></i> Complete
                          </button>
                        </div>
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
                          {typeof selectedBooking.address === 'string' 
                            ? selectedBooking.address 
                            : `${selectedBooking.address.street}, ${selectedBooking.address.city}, ${selectedBooking.address.state} - ${selectedBooking.address.zipCode}`
                          }
                        </strong>
                      </>
                    )}
                  </p>
                  
                  {/* Price Range Info */}
                  <div className="alert alert-info mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Price Range:</strong> ₹{getPriceRange().min} - ₹{getPriceRange().max}
                    <br/>
                    <small>Final price must be within 70% to 150% of the original service price to ensure fair pricing.</small>
                  </div>
                  
                  <label className="form-label">Final Service Price</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      value={finalPrice}
                      onChange={(e) => setFinalPrice(e.target.value)}
                      placeholder="Enter final price"
                      min={getPriceRange().min}
                      max={getPriceRange().max}
                      step="1"
                      required
                    />
                  </div>
                  <small className="text-muted">
                    Enter the final price charged for this service. This will be added to your earnings.
                  </small>
                  
                  {/* Price validation feedback */}
                  {finalPrice && (
                    <div className="mt-2">
                      {parseFloat(finalPrice) < getPriceRange().min && (
                        <span className="text-danger small">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          Price too low. Minimum: ₹{getPriceRange().min}
                        </span>
                      )}
                      {parseFloat(finalPrice) > getPriceRange().max && (
                        <span className="text-danger small">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          Price too high. Maximum: ₹{getPriceRange().max}
                        </span>
                      )}
                      {parseFloat(finalPrice) >= getPriceRange().min && parseFloat(finalPrice) <= getPriceRange().max && (
                        <span className="text-success small">
                          <i className="fas fa-check-circle me-1"></i>
                          Price is within valid range
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={handleComplete}
                  disabled={!finalPrice || parseFloat(finalPrice) < getPriceRange().min || parseFloat(finalPrice) > getPriceRange().max}
                >
                  <i className="fas fa-check-circle me-1"></i> Complete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Location Modal */}
      {showLocationModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={closeLocationModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-map-marker-alt text-danger me-2"></i>
                  Customer Live Location
                </h5>
                <button type="button" className="btn-close" onClick={closeLocationModal}></button>
              </div>
              <div className="modal-body">
                {selectedBooking && (
                  <div className="mb-3">
                    <p className="text-muted mb-2">
                      <strong>Customer:</strong> {selectedBooking.customer?.name}<br/>
                      <strong>Service:</strong> {selectedBooking.service?.name}
                    </p>
                  </div>
                )}
                
                {customerLocation ? (
                  <div className="text-center">
                    <div className="alert alert-success mb-3">
                      <i className="fas fa-broadcast-tower me-2"></i>
                      <strong>Location is being shared</strong>
                    </div>
                    
                    <div className="bg-light p-3 rounded mb-3">
                      <div className="row text-center">
                        <div className="col-6">
                          <small className="text-muted">Latitude</small>
                          <p className="mb-0 fw-bold">{customerLocation.latitude?.toFixed(6)}</p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Longitude</small>
                          <p className="mb-0 fw-bold">{customerLocation.longitude?.toFixed(6)}</p>
                        </div>
                      </div>
                      {customerLocation.accuracy && (
                        <div className="mt-2">
                          <small className="text-muted">
                            <i className="fas fa-crosshairs me-1"></i>
                            Accuracy: ±{customerLocation.accuracy?.toFixed(0)}m
                          </small>
                        </div>
                      )}
                      {customerLocation.timestamp && (
                        <div className="mt-1">
                          <small className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            Updated: {new Date(customerLocation.timestamp).toLocaleTimeString()}
                          </small>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="btn btn-primary btn-lg w-100"
                      onClick={openInGoogleMaps}
                    >
                      <i className="fas fa-directions me-2"></i>
                      Open in Google Maps
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-map-marker-alt text-muted mb-3" style={{fontSize: '3rem'}}></i>
                    <p className="text-muted mb-0">
                      Customer has not shared their location yet.
                    </p>
                    <small className="text-muted">
                      Ask the customer to enable location sharing from their booking details page.
                    </small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeLocationModal}>
                  Close
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
