import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

// Order tracking status bar component
const OrderTrackingBar = ({ status }) => {
  const steps = [
    { key: 'placed', label: 'Order Placed', icon: '📦' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ]

  const getStepStatus = (stepKey) => {
    const statusOrder = ['pending', 'confirmed', 'assigned_delivery', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(status)
    
    if (stepKey === 'placed') {
      return currentIndex >= 0 ? 'completed' : 'pending'
    }
    if (stepKey === 'out_for_delivery') {
      return currentIndex >= 3 ? 'completed' : currentIndex >= 1 ? 'active' : 'pending'
    }
    if (stepKey === 'delivered') {
      return status === 'delivered' ? 'completed' : 'pending'
    }
    return 'pending'
  }

  if (status === 'cancelled') {
    return (
      <div className="text-center py-2">
        <span className="badge bg-danger">Order Cancelled</span>
      </div>
    )
  }

  return (
    <div className="d-flex justify-content-between align-items-center py-2 px-3" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(step.key)
        return (
          <div key={step.key} className="d-flex align-items-center">
            <div className="text-center">
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1`}
                style={{
                  width: '32px',
                  height: '32px',
                  background: stepStatus === 'completed' ? '#28a745' : stepStatus === 'active' ? '#ffc107' : '#dee2e6',
                  color: stepStatus === 'completed' ? 'white' : stepStatus === 'active' ? '#333' : '#999',
                  fontSize: '14px'
                }}
              >
                {stepStatus === 'completed' ? '✓' : step.icon}
              </div>
              <small className={`d-block ${stepStatus === 'completed' ? 'text-success fw-bold' : stepStatus === 'active' ? 'text-warning fw-bold' : 'text-muted'}`} style={{ fontSize: '10px' }}>
                {step.label}
              </small>
            </div>
            {index < steps.length - 1 && (
              <div 
                className="mx-2" 
                style={{ 
                  width: '40px', 
                  height: '3px', 
                  background: getStepStatus(steps[index + 1].key) !== 'pending' ? '#28a745' : '#dee2e6',
                  marginBottom: '15px'
                }} 
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const OrderList = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const fetchedRef = useRef(false)

  useEffect(() => {
    // Prevent double fetch
    if (fetchedRef.current) return
    fetchedRef.current = true
    
    const loadOrders = async () => {
      try {
        const response = await api.get('/orders/customer')
        setOrders(response.data.orders || [])
      } catch (error) {
        console.error('Orders fetch error:', error.response?.data || error)
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    
    loadOrders()
  }, [])

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    
    try {
      await api.put(`/orders/${orderId}/cancel`)
      toast.success('Order cancelled successfully')
      // Refresh the list
      fetchedRef.current = false
      const response = await api.get('/orders/customer')
      setOrders(response.data.orders || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    }
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
    return <span className={`badge bg-${badge.bg} text-${badge.text}`}>{badge.label}</span>
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="card border-0 shadow-sm rounded-lg">
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3 px-4">
          <h5 className="mb-0 font-weight-bold">My Orders</h5>
          <select 
            className="form-select form-select-sm" 
            style={{width: 'auto'}}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Order Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="card-body p-3">
          {filteredOrders && filteredOrders.length > 0 ? (
            <div className="row g-3">
              {filteredOrders.map((order) => (
                <div key={order._id} className="col-12">
                  <div className="card border shadow-sm">
                    <div className="card-body">
                      {/* Order Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="mb-1">Order #{order.orderNumber || order._id.substring(0, 8)}</h6>
                          <small className="text-muted">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', month: 'short', year: 'numeric' 
                            })}
                          </small>
                        </div>
                        <div className="text-end">
                          {getStatusBadge(order.status)}
                          <div className="mt-1">
                            <strong className="text-primary">₹{order.totalAmount?.toFixed(2) || '0.00'}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Order Tracking Bar */}
                      <OrderTrackingBar status={order.status} />

                      {/* Order Items Preview */}
                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="bg-light rounded px-2 py-1">
                              <small className="d-block">{item.product?.name || 'Product'} × {item.quantity}</small>
                              {item.seller && (
                                <small className="text-muted" style={{ fontSize: '10px' }}>
                                  🏪 {item.seller?.businessName || 'Seller'}
                                </small>
                              )}
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <small className="text-muted">+{order.items.length - 3} more</small>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2 mt-3 pt-3 border-top">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/dashboard/customer/orders/${order._id}`)}
                        >
                          <i className="bi bi-eye me-1"></i> View Details
                        </button>
                        {order.status === 'delivered' && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => navigate(`/dashboard/customer/orders/${order._id}`)}
                          >
                            <i className="bi bi-download me-1"></i> Download Receipt
                          </button>
                        )}
                        {order.status === 'delivered' && order.items?.some(item => !item.isReviewed) && (
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => navigate(`/dashboard/customer/orders/${order._id}?review=true`)}
                          >
                            <i className="bi bi-star me-1"></i> Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-3" style={{ fontSize: '48px' }}>📦</div>
              <h6 className="text-muted">You haven't placed any orders yet</h6>
              <button onClick={() => navigate('/shop')} className="btn btn-primary mt-3">
                Shop Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderList
