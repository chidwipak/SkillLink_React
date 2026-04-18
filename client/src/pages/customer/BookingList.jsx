import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import '../../styles/dashboard.css'

const BookingList = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [sharingLocation, setSharingLocation] = useState({})
  const [locationInterval, setLocationInterval] = useState({})
  const fetchedRef = useRef(false)

  // ── Rejection Fallback State ──
  const [showRebookModal, setShowRebookModal] = useState(false)
  const [rebookBooking, setRebookBooking] = useState(null)
  const [alternativeWorkers, setAlternativeWorkers] = useState([])
  const [loadingAlternatives, setLoadingAlternatives] = useState(false)
  const [rebookingWorkerId, setRebookingWorkerId] = useState(null)
  const [broadcasting, setBroadcasting] = useState(false)

  const loadBookings = useCallback(async (showLoader = false) => {
    const controller = new AbortController()
    try {
      if (showLoader) setRefreshing(true)
      const response = await api.get('/bookings', {
        signal: controller.signal
      })
      setBookings(response.data.bookings || [])
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Bookings fetch error:', error.response?.data || error)
        toast.error('Failed to load bookings')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
    return () => controller.abort()
  }, [])

  useEffect(() => {
    // Prevent double fetch in StrictMode
    if (fetchedRef.current) return
    fetchedRef.current = true
    loadBookings()
  }, [loadBookings])

  const getServiceIcon = (category) => {
    const icons = {
      electrician: 'fa-bolt',
      plumber: 'fa-faucet',
      carpenter: 'fa-hammer',
    }
    return icons[category] || 'fa-tools'
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    const hasHalfStar = (rating || 0) % 1 >= 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star text-warning"></i>)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-warning"></i>)
      } else {
        stars.push(<i key={i} className="far fa-star text-warning"></i>)
      }
    }
    return stars
  }

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please select or enter a reason for cancellation')
      return
    }
    try {
      await api.put(`/bookings/${selectedBooking._id}/cancel`, { reason: cancelReason })
      toast.success('Booking cancelled successfully')
      setShowCancelModal(false)
      setSelectedBooking(null)
      setCancelReason('')
      // Refresh the list after cancellation
      loadBookings(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/bookings/${selectedBooking._id}/review`, {
        rating,
        review: reviewComment
      })
      toast.success('Review submitted successfully')
      setShowReviewModal(false)
      setRating(5)
      setReviewComment('')
      setSelectedBooking(null)
      // Refresh the list after review
      loadBookings(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    }
  }

  const shareLocation = async (bookingId) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    const shareLocationData = async (position) => {
      try {
        await api.post(`/bookings/${bookingId}/share-location`, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      } catch (error) {
        console.error('Location share error:', error)
      }
    }

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await shareLocationData(position)
        toast.success('Location sharing started')
        setSharingLocation(prev => ({ ...prev, [bookingId]: true }))

        // Update location every 10 seconds
        const interval = setInterval(() => {
          navigator.geolocation.getCurrentPosition(shareLocationData)
        }, 10000)

        setLocationInterval(prev => ({ ...prev, [bookingId]: interval }))
      },
      (error) => {
        toast.error('Failed to get your location. Please enable location access.')
        console.error('Geolocation error:', error)
      },
      { enableHighAccuracy: true }
    )
  }

  const stopSharingLocation = async (bookingId) => {
    try {
      await api.post(`/bookings/${bookingId}/stop-location`)
      
      // Clear interval
      if (locationInterval[bookingId]) {
        clearInterval(locationInterval[bookingId])
        setLocationInterval(prev => {
          const newIntervals = { ...prev }
          delete newIntervals[bookingId]
          return newIntervals
        })
      }

      setSharingLocation(prev => ({ ...prev, [bookingId]: false }))
      toast.success('Location sharing stopped')
    } catch (error) {
      toast.error('Failed to stop location sharing')
    }
  }

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(locationInterval).forEach(interval => clearInterval(interval))
    }
  }, [locationInterval])

  // ── Rejection Fallback Handlers ──
  const openRebookModal = async (booking) => {
    setRebookBooking(booking)
    setShowRebookModal(true)
    setLoadingAlternatives(true)
    setAlternativeWorkers([])
    try {
      const response = await api.get(`/bookings/${booking._id}/alternatives`)
      setAlternativeWorkers(response.data.alternatives || [])
    } catch (error) {
      console.error('Failed to load alternatives:', error)
      toast.error('Failed to load alternative workers')
    } finally {
      setLoadingAlternatives(false)
    }
  }

  const handleRebookWithWorker = async (workerId) => {
    if (!rebookBooking) return
    setRebookingWorkerId(workerId)
    try {
      await api.post(`/bookings/${rebookBooking._id}/rebook`, { workerId })
      toast.success('Booking re-sent to new worker! Awaiting confirmation.')
      setShowRebookModal(false)
      setRebookBooking(null)
      setAlternativeWorkers([])
      loadBookings(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to rebook')
    } finally {
      setRebookingWorkerId(null)
    }
  }

  const handleBroadcastRebook = async (bookingId) => {
    setBroadcasting(true)
    try {
      const response = await api.post(`/bookings/${bookingId || rebookBooking?._id}/broadcast-rebook`)
      toast.success(response.data.message || 'Booking broadcast to all available workers!')
      setShowRebookModal(false)
      setRebookBooking(null)
      setAlternativeWorkers([])
      loadBookings(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to broadcast booking')
    } finally {
      setBroadcasting(false)
    }
  }

  const getWorkerInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRejectionReason = (booking) => {
    if (!booking.statusHistory) return null
    const rejectedEntry = [...booking.statusHistory].reverse().find(h => h.status === 'rejected')
    return rejectedEntry?.notes || null
  }

  if (loading && bookings.length === 0) return <LoadingSpinner />

  return (
    <div className="container-fluid py-3">
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3 px-4">
          <h5 className="mb-0 fw-bold">📅 My Bookings</h5>
          <div className="d-flex gap-2 align-items-center">
            {refreshing && <span className="spinner-border spinner-border-sm text-primary"></span>}
            <button onClick={() => navigate('/services')} className="btn btn-sm btn-primary">
              <i className="fas fa-plus-circle me-1"></i> Book New Service
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Service</th>
                  <th>Worker</th>
                  <th>Date & Time</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings && bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <React.Fragment key={booking._id}>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="service-icon bg-light rounded p-2 me-3">
                            <i className={`fas ${getServiceIcon(booking.service?.category)} text-primary`}></i>
                          </div>
                          <div>
                            <h6 className="mb-0">{booking.service?.name}</h6>
                          </div>
                        </div>
                      </td>
                      <td>
                        {booking.worker ? (
                          <div className="d-flex align-items-center">
                            <img
                              src={booking.worker.user?.profilePicture || '/images/default-profile.png'}
                              alt="Worker"
                              className="rounded-circle me-2"
                              width="32"
                              height="32"
                              onError={(e) => e.target.src = '/images/default-profile.png'}
                            />
                            <div>
                              <h6 className="mb-0">{booking.worker.user?.name || booking.worker.name}</h6>
                              <div className="rating small">
                                {renderStars(booking.worker.rating)}
                                <span className="ms-1">{booking.worker.rating?.toFixed(1) || '0.0'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">Not Assigned</span>
                        )}
                      </td>
                      <td>
                        {new Date(booking.date).toLocaleDateString()}<br/>
                        <span className="text-muted">{booking.time}</span>
                      </td>
                      <td>₹{booking.price?.toFixed(2)}</td>
                      <td>
                        {booking.status === 'pending' && <span className="badge bg-warning text-dark">Pending</span>}
                        {booking.status === 'accepted' && <span className="badge bg-info">Accepted</span>}
                        {booking.status === 'in-progress' && <span className="badge bg-primary">In Progress</span>}
                        {booking.status === 'completed' && <span className="badge bg-success">Completed</span>}
                        {booking.status === 'rejected' && <span className="badge bg-danger">Declined</span>}
                        {booking.status === 'cancelled' && <span className="badge bg-secondary">Cancelled</span>}
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {/* ── REJECTION FALLBACK ACTIONS ── */}
                          {booking.status === 'rejected' && (
                            <>
                              <button
                                className="sk-btn-rebook"
                                onClick={() => openRebookModal(booking)}
                                title="Find another worker for this service"
                              >
                                <i className="fas fa-user-plus"></i> Find Another
                              </button>
                              <button
                                className="sk-btn-broadcast"
                                onClick={() => handleBroadcastRebook(booking._id)}
                                disabled={broadcasting}
                                title="Send to all available workers"
                              >
                                <i className="fas fa-broadcast-tower"></i> {broadcasting ? 'Sending...' : 'Broadcast'}
                              </button>
                            </>
                          )}
                          {booking.status === 'completed' && !booking.isReviewed && (
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setRating(5)
                                setReviewComment('')
                                setShowReviewModal(true)
                              }}
                            >
                              <i className="fas fa-star me-1"></i> Rate
                            </button>
                          )}
                          {booking.status === 'completed' && booking.isReviewed && (
                            <span className="text-success small">
                              <i className="fas fa-check-circle me-1"></i> Rated ({booking.rating}/5)
                            </span>
                          )}
                          {(booking.status === 'pending' || booking.status === 'accepted') && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setCancelReason('')
                                setShowCancelModal(true)
                              }}
                            >
                              <i className="fas fa-times me-1"></i> Cancel
                            </button>
                          )}
                          {(booking.status === 'accepted' || booking.status === 'in-progress') && (
                            <>
                              {!sharingLocation[booking._id] ? (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => shareLocation(booking._id)}
                                  title="Share live location with worker"
                                >
                                  <i className="fas fa-map-marker-alt me-1"></i> Share Location
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => stopSharingLocation(booking._id)}
                                  title="Stop sharing location"
                                >
                                  <i className="fas fa-broadcast-tower me-1 fa-pulse"></i> Sharing...
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* ── Inline Rejection Banner ── */}
                    {booking.status === 'rejected' && (
                      <tr>
                        <td colSpan="6" style={{ padding: '0 16px 12px', border: 'none' }}>
                          <div className="sk-rejection-banner">
                            <div className="sk-rejection-banner-header">
                              <div className="sk-rejection-banner-icon">
                                <i className="fas fa-exclamation-circle"></i>
                              </div>
                              <span className="sk-rejection-banner-title">
                                Booking Declined by {booking.worker?.user?.name || booking.worker?.name || 'Worker'}
                              </span>
                            </div>
                            {getRejectionReason(booking) && (
                              <div className="sk-rejection-banner-reason">
                                <i className="fas fa-quote-left me-1"></i> {getRejectionReason(booking)}
                              </div>
                            )}
                            <div className="sk-rejection-banner-actions">
                              <button className="sk-btn-rebook" onClick={() => openRebookModal(booking)}>
                                <i className="fas fa-user-plus"></i> Find Alternative Worker
                              </button>
                              <button 
                                className="sk-btn-broadcast" 
                                onClick={() => handleBroadcastRebook(booking._id)}
                                disabled={broadcasting}
                              >
                                <i className="fas fa-broadcast-tower"></i> {broadcasting ? 'Sending...' : 'Send to All Workers'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <p className="text-muted mb-3">No bookings found</p>
                      <button onClick={() => navigate('/services')} className="btn btn-primary">
                        Browse Services
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowDetailsModal(false)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Booking Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Service Information</h6>
                    <p>
                      <strong>Service:</strong> {selectedBooking.service?.name}<br/>
                      <strong>Price:</strong> ₹{selectedBooking.price?.toFixed(2)}<br/>
                      <strong>Date:</strong> {new Date(selectedBooking.date).toLocaleDateString()}<br/>
                      <strong>Time:</strong> {selectedBooking.time}<br/>
                      <strong>Status:</strong> {selectedBooking.status}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Worker Information</h6>
                    {selectedBooking.worker ? (
                      <p>
                        <strong>Name:</strong> {selectedBooking.worker.user?.name || selectedBooking.worker.name}<br/>
                        <strong>Rating:</strong> {renderStars(selectedBooking.worker.rating)} {selectedBooking.worker.rating?.toFixed(1)}<br/>
                        <strong>Experience:</strong> {selectedBooking.worker.experience || 0} years
                      </p>
                    ) : (
                      <p>Worker not yet assigned</p>
                    )}
                  </div>
                </div>
                <h6>Service Address</h6>
                <p>{selectedBooking.address}</p>
                {selectedBooking.description && (
                  <>
                    <h6>Notes</h6>
                    <p>{selectedBooking.description}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowCancelModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancel Booking</h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel this booking?</p>
                <p className="text-muted mb-3">Service: {selectedBooking.service?.name}</p>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Reason for cancellation *</label>
                  <select
                    className="form-select mb-2"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  >
                    <option value="">Select a reason</option>
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Found another provider">Found another provider</option>
                    <option value="Schedule conflict">Schedule conflict</option>
                    <option value="Too expensive">Too expensive</option>
                    <option value="Issue no longer exists">Issue no longer exists</option>
                    <option value="Other">Other</option>
                  </select>
                  {cancelReason === 'Other' && (
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Please describe your reason..."
                      onChange={(e) => setCancelReason(e.target.value || 'Other')}
                    ></textarea>
                  )}
                </div>

                {selectedBooking.status === 'accepted' && (
                  <div className="alert alert-warning py-2">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <small>A worker has already accepted this booking. They will be notified of the cancellation.</small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                  No, Keep It
                </button>
                <button type="button" className="btn btn-danger" onClick={handleCancelBooking} disabled={!cancelReason.trim()}>
                  Yes, Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowReviewModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rate & Review</h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitReview}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`fa${ star <= rating ? 's' : 'r'} fa-star fa-2x cursor-pointer text-warning`}
                          onClick={() => setRating(star)}
                          style={{cursor: 'pointer'}}
                        ></i>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Comment</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      placeholder="Share your experience..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═══ REBOOK MODAL — Rejection Fallback ═══ */}
      {showRebookModal && rebookBooking && (
        <div className="sk-rebook-overlay" onClick={() => setShowRebookModal(false)}>
          <div className="sk-rebook-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sk-rebook-modal-header">
              <h3>
                <i className="fas fa-exchange-alt"></i>
                Find Alternative Worker
              </h3>
              <button className="sk-close-btn" onClick={() => setShowRebookModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Body */}
            <div className="sk-rebook-modal-body">
              {/* Rejection Info */}
              <div className="sk-rebook-info">
                <div className="sk-rebook-info-icon">
                  <i className="fas fa-times-circle"></i>
                </div>
                <div className="sk-rebook-info-text">
                  <h4>
                    {rebookBooking.service?.name || 'Service'} — Declined by {rebookBooking.worker?.user?.name || rebookBooking.worker?.name || 'Worker'}
                  </h4>
                  <p>
                    {getRejectionReason(rebookBooking) 
                      ? `Reason: "${getRejectionReason(rebookBooking)}"` 
                      : 'No reason provided'}
                    {' • '}
                    {new Date(rebookBooking.date).toLocaleDateString()} at {rebookBooking.time}
                  </p>
                </div>
              </div>

              {/* Loading State */}
              {loadingAlternatives && (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <div className="spinner-border text-primary" role="status"></div>
                  <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.9rem' }}>
                    Searching for available workers...
                  </p>
                </div>
              )}

              {/* Alternative Workers List */}
              {!loadingAlternatives && alternativeWorkers.length > 0 && (
                <>
                  <div className="sk-alternatives-title">
                    <i className="fas fa-users" style={{ color: '#6366f1' }}></i>
                    Available Workers
                    <span className="count-badge">{alternativeWorkers.length} found</span>
                  </div>
                  <div className="sk-alternatives-grid">
                    {alternativeWorkers.map((w) => (
                      <div className="sk-worker-card" key={w.workerId}>
                        <div className="sk-worker-card-avatar">
                          {w.profilePicture ? (
                            <img 
                              src={w.profilePicture} 
                              alt={w.name}
                              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = getWorkerInitials(w.name) }}
                            />
                          ) : (
                            getWorkerInitials(w.name)
                          )}
                        </div>
                        <div className="sk-worker-card-details">
                          <div className="sk-worker-card-name">{w.name}</div>
                          <div className="sk-worker-card-meta">
                            <span><i className="fas fa-star star"></i> {w.rating?.toFixed(1) || '0.0'}</span>
                            <span><i className="fas fa-briefcase"></i> {w.experience || 0} yrs</span>
                            <span><i className="fas fa-check-circle"></i> {w.jobsCompleted || 0} jobs</span>
                          </div>
                        </div>
                        <div className="sk-worker-card-price">₹{w.price?.toFixed(0) || '0'}</div>
                        <button
                          className="sk-worker-card-book-btn"
                          onClick={() => handleRebookWithWorker(w.workerId)}
                          disabled={rebookingWorkerId === w.workerId}
                        >
                          {rebookingWorkerId === w.workerId ? (
                            <><i className="fas fa-spinner fa-spin"></i> Booking...</>
                          ) : (
                            <><i className="fas fa-paper-plane"></i> Book</>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Broadcast Option */}
                  <button 
                    className="sk-broadcast-all-btn"
                    onClick={() => handleBroadcastRebook()}
                    disabled={broadcasting}
                  >
                    {broadcasting ? (
                      <><i className="fas fa-spinner fa-spin"></i> Broadcasting...</>
                    ) : (
                      <><i className="fas fa-broadcast-tower"></i> Or send to ALL {alternativeWorkers.length} workers — first to accept wins</>
                    )}
                  </button>
                </>
              )}

              {/* No Alternatives */}
              {!loadingAlternatives && alternativeWorkers.length === 0 && (
                <div className="sk-no-alternatives">
                  <div className="sk-no-alternatives-icon">😔</div>
                  <h4>No Workers Available Right Now</h4>
                  <p>All workers in this category are either busy or unavailable. Please try again in a few minutes.</p>
                  <button
                    className="sk-btn-rebook"
                    style={{ marginTop: '16px', padding: '12px 24px' }}
                    onClick={() => { setShowRebookModal(false); navigate('/services') }}
                  >
                    <i className="fas fa-search"></i> Browse All Services
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingList
