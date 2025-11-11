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
    <div className="container-fluid py-4">
      <h4 className="mb-4">📦 Orders Management</h4>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-warning bg-opacity-10 border-warning">
            <div className="card-body text-center">
              <h3 className="text-warning mb-1">{stats.pending}</h3>
              <small className="text-muted">New Orders</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info bg-opacity-10 border-info">
            <div className="card-body text-center">
              <h3 className="text-info mb-1">{stats.inProgress}</h3>
              <small className="text-muted">In Progress</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success bg-opacity-10 border-success">
            <div className="card-body text-center">
              <h3 className="text-success mb-1">{stats.delivered}</h3>
              <small className="text-muted">Delivered</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-primary bg-opacity-10 border-primary">
            <div className="card-body text-center">
              <h3 className="text-primary mb-1">₹{stats.revenue.toLocaleString()}</h3>
              <small className="text-muted">Total Revenue</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
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
            className={`btn btn-sm ${filter === value ? 'btn-primary' : 'btn-outline-secondary'}`}
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

                        {/* Delivery Assigned - Show Handed button */}
                        {order.status === 'assigned_delivery' && (
                          <button 
                            onClick={() => handleHandedToDelivery(order._id)} 
                            className="btn btn-success"
                          >
                            ✅ Handed to Delivery
                          </button>
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
        <div className="text-center py-5">
          <div className="mb-3" style={{ fontSize: '48px' }}>📭</div>
          <p className="text-muted">No orders found</p>
        </div>
      )}
    </div>
  )
}

export default SellerOrders
