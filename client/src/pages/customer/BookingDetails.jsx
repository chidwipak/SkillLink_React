import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const BookingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)
  const [review, setReview] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    fetchBookingDetails()
  }, [id])

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/bookings/${id}`)
      setBooking(response.data.booking)
    } catch (error) {
      toast.error('Failed to load booking details')
      navigate('/dashboard/customer/bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      await api.put(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled successfully')
      fetchBookingDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/bookings/${id}/review`, review)
      toast.success('Review submitted successfully')
      setShowReview(false)
      fetchBookingDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate('/dashboard/customer/bookings')} className="mb-4 text-primary-600 hover:text-primary-700">← Back to Bookings</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{booking?.service?.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking?.status)}`}>{booking?.status}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2"><span className="font-semibold">👤 Worker:</span><span>{booking?.worker?.name}</span></div>
              <div className="flex items-center gap-2"><span className="font-semibold">📅 Date:</span><span>{new Date(booking?.date).toLocaleDateString()}</span></div>
              <div className="flex items-center gap-2"><span className="font-semibold">🕐 Time:</span><span>{booking?.time}</span></div>
              <div className="flex items-start gap-2"><span className="font-semibold">📍 Address:</span><span>{booking?.address}</span></div>
              {booking?.description && <div className="flex items-start gap-2"><span className="font-semibold">📝 Details:</span><span>{booking?.description}</span></div>}
            </div>
          </div>
          {booking?.status === 'completed' && !booking?.rating && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
              {!showReview ? (
                <button onClick={() => setShowReview(true)} className="btn btn-primary">Write Review</button>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setReview({ ...review, rating: star })} className={`text-3xl ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <textarea rows="4" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Share your experience..." />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                    <button type="button" onClick={() => setShowReview(false)} className="btn btn-secondary">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
          {booking?.rating && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Your Review</h2>
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">⭐</span><span className="text-xl font-semibold">{booking.rating}/5</span></div>
              {booking.review && <p className="text-gray-600">{booking.review}</p>}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Payment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">Base Price</span><span>₹{booking?.service?.basePrice}</span></div>
              {booking?.finalPrice && <div className="flex justify-between font-semibold text-lg border-t pt-2"><span>Total</span><span className="text-primary-600">₹{booking.finalPrice}</span></div>}
            </div>
          </div>
          {booking?.status === 'pending' && <button onClick={handleCancel} className="w-full btn btn-danger">Cancel Booking</button>}
        </div>
      </div>
    </div>
  )
}

export default BookingDetails
