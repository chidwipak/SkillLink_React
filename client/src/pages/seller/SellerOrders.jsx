import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const SellerOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [assigningOrder, setAssigningOrder] = useState(null)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpOrderId, setOtpOrderId] = useState(null)
  const [otpItems, setOtpItems] = useState([])
  const [verifyingOTP, setVerifyingOTP] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/seller')
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Seller orders error:', error.response?.data || error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignDelivery = async (orderId) => {
    setAssigningOrder(orderId)
    try {
      const response = await api.put(`/delivery/assign/${orderId}`)
      toast.success(response.data.message || 'Order assigned to delivery partners')
      fetchedRef.current = false
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign delivery')
    } finally {
      setAssigningOrder(null)
    }
  }

  const handleHandedToDelivery = async (orderId) => {
    try {
      const response = await api.put(`/delivery/handed/${orderId}`)
      toast.success(response.data.message || 'Order marked as handed to delivery')
      fetchedRef.current = false
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order')
    }
  }

  // View pickup OTPs for an order
  const handleViewPickupOTPs = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/pickup-otps`)
      setOtpItems(response.data.items || [])
      setOtpOrderId(orderId)
      setShowOTPModal(true)
    } catch (error) {
      toast.error('Failed to load pickup OTPs')
    }
  }

  // Verify pickup OTP (delivery person enters OTP, seller confirms)
  const handleVerifyPickupOTP = async (otp) => {
    if (!otp || otp.length !== 4) {
      toast.error('Please enter a 4-digit OTP')
      return
    }
    setVerifyingOTP(true)
    try {
      const response = await api.post('/orders/verify-pickup-otp', {
        orderId: otpOrderId,
        otp
      })
      toast.success(response.data.message)
      setShowOTPModal(false)
      fetchedRef.current = false
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setVerifyingOTP(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {  
      pending: { bg: 'warning', text: 'dark', label: 'New Order' },
      confirmed: { bg: 'info', text: 'white', label: 'Confirmed - Finding Delivery' },
      assigned_delivery: { bg: 'primary', text: 'white', label: 'Delivery Assigned' },
      out_for_delivery: { bg: 'info', text: 'white', label: 'Out for Delivery' },
      delivered: { bg: 'success', text: 'white', label: 'Delivered' },
      cancelled: { bg: 'danger', text: 'white', label: 'Cancelled' },
    }
    const badge = badges[status] || { bg: 'secondary', text: 'white', label: status }
    return <span className={`badge bg-${badge.bg} text-${badge.text}`}>{badge.label}</span>
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  // Calculate stats
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => ['confirmed', 'assigned_delivery', 'out_for_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-enter">
      <h4 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-5 flex items-center gap-2">
        <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        Orders Management
      </h4>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white shadow-lg shadow-amber-200">
          <h3 className="text-2xl font-extrabold mb-0">{stats.pending}</h3>
          <span className="text-amber-100 text-xs font-medium">New Orders</span>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 p-4 text-white shadow-lg shadow-sky-200">
          <h3 className="text-2xl font-extrabold mb-0">{stats.inProgress}</h3>
          <span className="text-sky-100 text-xs font-medium">In Progress</span>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 p-4 text-white shadow-lg shadow-emerald-200">
          <h3 className="text-2xl font-extrabold mb-0">{stats.delivered}</h3>
          <span className="text-emerald-100 text-xs font-medium">Delivered</span>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-lg shadow-indigo-200">
          <h3 className="text-2xl font-extrabold mb-0">₹{stats.revenue.toLocaleString()}</h3>
          <span className="text-indigo-100 text-xs font-medium">Total Revenue</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { value: 'all', label: 'All Orders' },
          { value: 'pending', label: 'New' },
          { value: 'confirmed', label: 'Finding Delivery' },
          { value: 'assigned_delivery', label: 'Delivery Assigned' },
          { value: 'out_for_delivery', label: 'Out for Delivery' },
          { value: 'delivered', label: 'Delivered' },
        ].map(({ value, label }) => (
          <button 
            key={value} 
            onClick={() => setFilter(value)} 
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              filter === value 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredOrders.length > 0 ? (
        <div className="row g-3">
          {filteredOrders.map((order) => (
            <div key={order._id} className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="row">
                    {/* Order Info */}
                    <div className="col-md-8">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <h5 className="mb-0">Order #{order.orderNumber || order._id?.substring(0, 8)}</h5>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-sm-6">
                          <small className="text-muted d-block">Customer</small>
                          <p className="mb-1 fw-semibold">{order.customer?.name || 'N/A'}</p>
                          <p className="mb-0 small text-muted">{order.customer?.phone}</p>
                        </div>
                        <div className="col-sm-6">
                          <small className="text-muted d-block">Delivery Address</small>
                          <p className="mb-0 small">
                            {order.shippingAddress?.street || order.shippingAddress?.address}, {order.shippingAddress?.city}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-light rounded p-2 mb-3">
                        <small className="text-muted d-block mb-2">Items:</small>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="d-flex justify-content-between small">
                            <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                            <span className="fw-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Toggle full address */}
                      <button 
                        onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)} 
                        className="btn btn-link btn-sm p-0 text-decoration-none"
                      >
                        {selectedOrder === order._id ? '▼ Hide' : '▶ View'} Full Address
                      </button>
                      
                      {selectedOrder === order._id && (
                        <div className="mt-2 p-3 bg-light rounded">
                          <p className="mb-1"><strong>Name:</strong> {order.shippingAddress?.name}</p>
                          <p className="mb-1"><strong>Phone:</strong> {order.shippingAddress?.phone}</p>
                          <p className="mb-1"><strong>Address:</strong> {order.shippingAddress?.street || order.shippingAddress?.address}</p>
                          <p className="mb-0"><strong>City:</strong> {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode || order.shippingAddress?.pincode}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                      <p className="mb-1 text-muted small">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                          day: 'numeric', month: 'short', year: 'numeric' 
                        })}
                      </p>
                      <h4 className="text-primary mb-3">₹{(order.totalAmount || 0).toFixed(2)}</h4>
                      
                      <div className="d-grid gap-2">
                        {/* Pending - Show Assign button */}
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => handleAssignDelivery(order._id)} 
                            className="btn btn-primary"
                            disabled={assigningOrder === order._id}
                          >
                            {assigningOrder === order._id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Finding Delivery...
                              </>
                            ) : (
                              <>🚚 Assign Delivery</>
                            )}
                          </button>
                        )}

                        {/* Confirmed - Waiting for delivery person */}
                        {order.status === 'confirmed' && (
                          <div className="alert alert-info mb-0 py-2 small">
                            <i className="bi bi-hourglass-split me-1"></i>
                            Waiting for delivery partner to accept...
                          </div>
                        )}

                        {/* Delivery Assigned - Show View OTP button */}
                        {order.status === 'assigned_delivery' && (
                          <div className="d-grid gap-2">
                            <button 
                              onClick={() => handleViewPickupOTPs(order._id)} 
                              className="btn btn-info"
                            >
                              🔐 View Pickup OTPs
                            </button>
                            <small className="text-muted text-center">
                              Show OTP to delivery person for verification
                            </small>
                          </div>
                        )}

                        {/* Out for delivery */}
                        {order.status === 'out_for_delivery' && (
                          <div className="alert alert-primary mb-0 py-2 small">
                            <i className="bi bi-truck me-1"></i>
                            Out for delivery
                          </div>
                        )}

                        {/* Delivered */}
                        {order.status === 'delivered' && (
                          <div className="alert alert-success mb-0 py-2 small">
                            <i className="bi bi-check-circle me-1"></i>
                            Delivered on {order.actualDeliveryDate ? 
                              new Date(order.actualDeliveryDate).toLocaleDateString('en-IN') : 
                              'N/A'
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sk-empty-state">
          <div className="sk-empty-state-icon">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
          </div>
          <p className="sk-empty-state-title">No orders found</p>
          <p className="sk-empty-state-desc">Orders will appear here when customers purchase from your shop.</p>
        </div>
      )}

      {/* Pickup OTP Modal */}
      {showOTPModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowOTPModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="fas fa-lock me-2"></i>
                  Pickup OTP Verification
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOTPModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info mb-4">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Show this OTP to the delivery person.</strong> They will enter it in their app to confirm pickup.
                </div>

                {otpItems.length > 0 ? (
                  <div className="space-y-3">
                    {otpItems.map((item, idx) => (
                      <div key={idx} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{item.product || 'Product'}</h6>
                              <small className="text-muted">Qty: {item.quantity}</small>
                            </div>
                            {item.handedToDelivery ? (
                              <span className="badge bg-success">
                                <i className="fas fa-check me-1"></i>
                                Handed Over
                              </span>
                            ) : (
                              <div className="text-center">
                                <div className="bg-primary text-white px-4 py-2 rounded-3 fw-bold" style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', fontFamily: 'monospace' }}>
                                  {item.pickupOTP}
                                </div>
                                <small className="text-muted">Pickup OTP</small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted">No items found</p>
                )}

                {/* Delivery person enters OTP section */}
                <div className="mt-4 pt-3 border-top">
                  <h6 className="mb-3">Delivery Person Verification</h6>
                  <p className="small text-muted mb-3">
                    When the delivery person shows their app with the OTP, click the corresponding button above or enter their OTP below:
                  </p>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control text-center"
                      placeholder="Enter delivery person's OTP"
                      maxLength={4}
                      id="deliveryOTPInput"
                      style={{ fontSize: '1.25rem', letterSpacing: '0.3rem', fontFamily: 'monospace' }}
                    />
                    <button 
                      className="btn btn-success"
                      onClick={() => handleVerifyPickupOTP(document.getElementById('deliveryOTPInput').value)}
                      disabled={verifyingOTP}
                    >
                      {verifyingOTP ? 'Verifying...' : 'Verify & Handover'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOTPModal(false)}>
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

export default SellerOrders
