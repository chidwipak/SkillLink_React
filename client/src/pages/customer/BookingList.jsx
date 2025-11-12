import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const BookingList = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const fetchedRef = useRef(false)

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
    try {
      await api.post(`/bookings/${selectedBooking._id}/cancel`)
      toast.success('Booking cancelled successfully')
      setShowCancelModal(false)
      setSelectedBooking(null)
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
                    <tr key={booking._id}>
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
                        {booking.status === 'rejected' && <span className="badge bg-danger">Rejected</span>}
                        {booking.status === 'cancelled' && <span className="badge bg-secondary">Cancelled</span>}
                      </td>
                      <td>
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
                            <i className="fas fa-star me-1"></i> Rate Worker
                          </button>
                        )}
                        {booking.status === 'completed' && booking.isReviewed && (
                          <span className="text-success">
                            <i className="fas fa-check-circle me-1"></i> Rated ({booking.rating}/5)
                          </span>
                        )}
                        {booking.status === 'pending' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowCancelModal(true)
                            }}
                          >
                            <i className="fas fa-times me-1"></i> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
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
                <p className="text-muted">Service: {selectedBooking.service?.name}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                  No, Keep It
                </button>
                <button type="button" className="btn btn-danger" onClick={handleCancelBooking}>
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
    </div>
  )
}

export default BookingList
