import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Modal, Button, Form } from 'react-bootstrap'

// Order tracking bar component
const OrderTrackingBar = ({ status, trackingUpdates }) => {
  const steps = [
    { key: 'placed', label: 'Order Placed', icon: '📦' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ]

  const getStepStatus = (stepKey) => {
    const statusOrder = ['pending', 'confirmed', 'assigned_delivery', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(status)
    
    if (stepKey === 'placed') return currentIndex >= 0 ? 'completed' : 'pending'
    if (stepKey === 'out_for_delivery') return currentIndex >= 3 ? 'completed' : currentIndex >= 1 ? 'active' : 'pending'
    if (stepKey === 'delivered') return status === 'delivered' ? 'completed' : 'pending'
    return 'pending'
  }

  const getStepTime = (stepKey) => {
    if (!trackingUpdates) return null
    const statusMap = {
      'placed': ['pending'],
      'out_for_delivery': ['out_for_delivery'],
      'delivered': ['delivered']
    }
    const update = trackingUpdates.find(u => statusMap[stepKey]?.includes(u.status))
    return update ? new Date(update.timestamp).toLocaleString('en-IN', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    }) : null
  }

  if (status === 'cancelled') {
    return (
      <div className="text-center py-4">
        <span className="badge bg-danger fs-6 px-4 py-2">Order Cancelled</span>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-start position-relative">
        {/* Progress line */}
        <div 
          className="position-absolute" 
          style={{ 
            top: '24px', 
            left: '15%', 
            right: '15%', 
            height: '4px', 
            background: '#e9ecef',
            zIndex: 0
          }}
        >
          <div 
            style={{ 
              width: status === 'delivered' ? '100%' : status === 'out_for_delivery' ? '50%' : '0%',
              height: '100%',
              background: '#28a745',
              transition: 'width 0.5s ease'
            }}
          />
        </div>

        {steps.map((step) => {
          const stepStatus = getStepStatus(step.key)
          const stepTime = getStepTime(step.key)
          return (
            <div key={step.key} className="text-center position-relative" style={{ zIndex: 1, flex: 1 }}>
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                style={{
                  width: '48px',
                  height: '48px',
                  background: stepStatus === 'completed' ? '#28a745' : stepStatus === 'active' ? '#ffc107' : '#e9ecef',
                  color: stepStatus === 'completed' ? 'white' : stepStatus === 'active' ? '#333' : '#999',
                  fontSize: '20px',
                  border: stepStatus === 'active' ? '3px solid #ffc107' : 'none',
                  boxShadow: stepStatus !== 'pending' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {stepStatus === 'completed' ? '✓' : step.icon}
              </div>
              <p className={`mb-1 fw-semibold ${stepStatus === 'completed' ? 'text-success' : stepStatus === 'active' ? 'text-warning' : 'text-muted'}`}>
                {step.label}
              </p>
              {stepTime && (
                <small className="text-muted d-block">{stepTime}</small>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const OrderDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deliveryPerson, setDeliveryPerson] = useState(null)
  const [deliveryOTP, setDeliveryOTP] = useState(null)
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewItem, setReviewItem] = useState(null)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  // Auto-open review modal if review=true query param is present
  useEffect(() => {
    const shouldOpenReview = searchParams.get('review') === 'true'
    if (shouldOpenReview && order && order.status === 'delivered') {
      // Find first unreviewed item
      const unreviewedItem = order.items?.find(item => !item.isReviewed)
      if (unreviewedItem) {
        openReviewModal(unreviewedItem)
      }
    }
  }, [order, searchParams])

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data.order)
      
      // Fetch delivery person info if order is out for delivery
      if (['assigned_delivery', 'out_for_delivery'].includes(response.data.order.status)) {
        try {
          const dpResponse = await api.get(`/delivery/info/${id}`)
          setDeliveryPerson(dpResponse.data.deliveryPerson)
          setDeliveryOTP(dpResponse.data.deliveryOTP)
        } catch (e) {
          console.log('No delivery person info yet')
        }
      }
    } catch (error) {
      toast.error('Failed to load order details')
      navigate('/dashboard/customer/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      await api.put(`/orders/${id}/cancel`)
      toast.success('Order cancelled successfully')
      fetchOrderDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    }
  }

  // Open review modal for a product
  const openReviewModal = (item) => {
    setReviewItem(item)
    setReviewData({ rating: 5, comment: '' })
    setShowReviewModal(true)
  }

  // Submit product review
  const handleSubmitReview = async () => {
    if (!reviewItem || !reviewData.rating) {
      toast.error('Please provide a rating')
      return
    }

    setSubmittingReview(true)
    try {
      await api.post('/reviews/product', {
        productId: reviewItem.product?._id,
        orderId: order._id,
        rating: reviewData.rating,
        comment: reviewData.comment
      })
      toast.success('Review submitted successfully!')
      setShowReviewModal(false)
      setReviewItem(null)
      fetchOrderDetails() // Refresh to show review status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const downloadReceipt = () => {
    // Create receipt content
    const receiptContent = `
=====================================
        SKILLLINK - ORDER RECEIPT
=====================================

Order Number: ${order.orderNumber || order._id}
Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
Status: ${order.status.toUpperCase()}

-------------------------------------
ITEMS:
-------------------------------------
${order.items?.map(item => 
  `${item.product?.name || 'Product'}
   Qty: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}`
).join('\n\n')}

-------------------------------------
SHIPPING ADDRESS:
-------------------------------------
${order.shippingAddress?.name || ''}
${order.shippingAddress?.phone || ''}
${order.shippingAddress?.street || order.shippingAddress?.address || ''}
${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}
${order.shippingAddress?.zipCode || order.shippingAddress?.pincode || ''}

-------------------------------------
PAYMENT SUMMARY:
-------------------------------------
Subtotal:      ₹${order.subtotal || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0}
Platform Fee:  ₹${order.platformFee || Math.round((order.subtotal || 0) * 0.02)}
Delivery Fee:  ₹${order.deliveryFee || 50}
-------------------------------------
TOTAL:         ₹${order.totalAmount || 0}
-------------------------------------

Payment Method: Cash on Delivery

Thank you for shopping with SkillLink!

=====================================
    `

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SkillLink_Receipt_${order.orderNumber || order._id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Receipt downloaded!')
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'warning', text: 'dark', label: 'Order Placed' },
      confirmed: { bg: 'info', text: 'white', label: 'Confirmed' },
      assigned_delivery: { bg: 'primary', text: 'white', label: 'Delivery Assigned' },
      out_for_delivery: { bg: 'info', text: 'white', label: 'Out for Delivery' },
      delivered: { bg: 'success', text: 'white', label: 'Delivered' },
      cancelled: { bg: 'danger', text: 'white', label: 'Cancelled' },
    }
    const badge = badges[status] || { bg: 'secondary', text: 'white', label: status }
    return <span className={`badge bg-${badge.bg} text-${badge.text} fs-6 px-3 py-2`}>{badge.label}</span>
  }

  if (loading) return <LoadingSpinner />
  if (!order) return <div className="text-center py-5">Order not found</div>

  const subtotal = order.subtotal || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0

  return (
    <div className="container py-4">
      {/* Back button */}
      <button 
        onClick={() => navigate('/dashboard/customer/orders')} 
        className="btn btn-link text-decoration-none mb-4 ps-0"
      >
        ← Back to Orders
      </button>

      {/* Order Header */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h4 className="mb-1">Order #{order.orderNumber || order._id?.substring(0, 8)}</h4>
              <p className="text-muted mb-0">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              {getStatusBadge(order.status)}
              <button onClick={downloadReceipt} className="btn btn-outline-primary btn-sm">
                <i className="bi bi-download me-1"></i> Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Tracking */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">📍 Track Order</h5>
        </div>
        <div className="card-body">
          <OrderTrackingBar status={order.status} trackingUpdates={order.trackingUpdates} />
        </div>
      </div>

      {/* Delivery Person Info */}
      {deliveryPerson && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">🚚 Delivery Partner</h5>
          </div>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h6 className="mb-1">{deliveryPerson.name}</h6>
                <p className="mb-1 text-muted">
                  <i className="bi bi-telephone me-2"></i>
                  {deliveryPerson.phone}
                </p>
                <p className="mb-0">
                  <span className="badge bg-warning text-dark me-2">
                    ⭐ {deliveryPerson.rating?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="text-muted">{deliveryPerson.vehicleType} - {deliveryPerson.vehicleNumber}</span>
                </p>
              </div>
              {deliveryOTP && order.status === 'out_for_delivery' && (
                <div className="col-md-6 text-md-end mt-3 mt-md-0">
                  <p className="mb-1 text-muted">Delivery OTP</p>
                  <h2 className="text-primary mb-0 font-monospace">{deliveryOTP}</h2>
                  <small className="text-muted">Share this code with delivery partner</small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Order Items */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">📦 Order Items</h5>
            </div>
            <div className="card-body">
              {order.items?.map((item, idx) => (
                <div key={idx} className={`d-flex gap-3 py-3 ${idx > 0 ? 'border-top' : ''}`}>
                  <div 
                    className="bg-light rounded d-flex align-items-center justify-content-center"
                    style={{ width: '80px', height: '80px', flexShrink: 0 }}
                  >
                    {item.product?.images?.[0] ? (
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="img-fluid rounded"
                        style={{ maxHeight: '80px', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '32px' }}>📦</span>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.product?.name || 'Product'}</h6>
                    <p className="text-muted mb-1 small">Qty: {item.quantity}</p>
                    {item.seller && (
                      <p className="mb-0 small">
                        <span className="badge bg-light text-dark border">
                          🏪 {item.seller?.businessName || item.seller?.user?.name || 'Seller'}
                        </span>
                      </p>
                    )}
                    {/* Review button for delivered items */}
                    {order.status === 'delivered' && (
                      <div className="mt-2">
                        {item.isReviewed ? (
                          <span className="badge bg-success">
                            ✓ Reviewed
                          </span>
                        ) : (
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openReviewModal(item)}
                          >
                            ⭐ Write a Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-end">
                    <p className="mb-0 fw-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <small className="text-muted">₹{item.price} each</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">📍 Shipping Address</h5>
            </div>
            <div className="card-body">
              <p className="fw-semibold mb-1">{order.shippingAddress?.name}</p>
              <p className="mb-1">{order.shippingAddress?.phone}</p>
              <p className="mb-1">{order.shippingAddress?.street || order.shippingAddress?.address}</p>
              <p className="mb-0">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode || order.shippingAddress?.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">💰 Payment Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Platform Fee (2%)</span>
                <span>₹{(order.platformFee || Math.round(subtotal * 0.02)).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Delivery Fee</span>
                <span>₹{(order.deliveryFee || 50).toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold fs-5">Total</span>
                <span className="fw-bold fs-5 text-primary">₹{(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="mt-3 pt-3 border-top">
                <small className="text-muted">
                  <i className="bi bi-cash me-2"></i>
                  Payment Method: Cash on Delivery
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewItem && (
            <div>
              <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded">
                {reviewItem.product?.images?.[0] ? (
                  <img 
                    src={reviewItem.product.images[0]} 
                    alt={reviewItem.product.name}
                    className="rounded"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-secondary rounded d-flex align-items-center justify-content-center" 
                       style={{ width: '60px', height: '60px' }}>
                    📦
                  </div>
                )}
                <div>
                  <h6 className="mb-0">{reviewItem.product?.name || 'Product'}</h6>
                  <small className="text-muted">
                    {reviewItem.seller?.businessName || 'Seller'}
                  </small>
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Rating</Form.Label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      style={{ fontSize: '2rem' }}
                    >
                      {star <= reviewData.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                <small className="text-muted">
                  {reviewData.rating === 1 && 'Poor'}
                  {reviewData.rating === 2 && 'Fair'}
                  {reviewData.rating === 3 && 'Good'}
                  {reviewData.rating === 4 && 'Very Good'}
                  {reviewData.rating === 5 && 'Excellent'}
                </small>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Your Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Share your experience with this product..."
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitReview}
            disabled={submittingReview}
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default OrderDetails
