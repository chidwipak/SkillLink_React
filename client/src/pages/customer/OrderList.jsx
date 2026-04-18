import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

// Order tracking status bar component
const OrderTrackingBar = ({ status }) => {
  const steps = [
    { key: 'placed', label: 'Order Placed', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    )},
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
    )},
    { key: 'delivered', label: 'Delivered', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
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
      <div className="text-center py-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          Order Cancelled
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(step.key)
        return (
          <div key={step.key} className="flex items-center">
            <div className="text-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-1.5 transition-all duration-300 ${
                stepStatus === 'completed' 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-200' 
                  : stepStatus === 'active' 
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200 animate-pulse' 
                    : 'bg-gray-200 text-gray-400'
              }`}>
                {stepStatus === 'completed' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : step.icon}
              </div>
              <span className={`text-[10px] font-semibold leading-tight block ${
                stepStatus === 'completed' ? 'text-green-600' : stepStatus === 'active' ? 'text-indigo-600' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-10 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500 ${
                getStepStatus(steps[index + 1].key) !== 'pending' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
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
    <div className="page-enter">
      <div className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between py-4 px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-content text-white">
              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h5 className="text-lg font-bold text-gray-900 mb-0">My Orders</h5>
          </div>
          <select 
            className="sk-input text-sm py-2 px-3 w-auto min-w-[160px]"
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

        {/* Order Cards */}
        <div className="p-4">
          {filteredOrders && filteredOrders.length > 0 ? (
            <div className="space-y-4 stagger-children">
              {filteredOrders.map((order) => (
                <div key={order._id} className="fade-in-up visible rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                  <div className="p-5">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h6 className="text-base font-bold text-gray-900 mb-1">
                          Order #{order.orderNumber || order._id.substring(0, 8)}
                        </h6>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', month: 'short', year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <div className="mt-2">
                          <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ₹{order.totalAmount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Tracking Bar */}
                    <OrderTrackingBar status={order.status} />

                    {/* Order Items Preview */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                            <span className="text-sm font-medium text-gray-700 block">{item.product?.name || 'Product'} × {item.quantity}</span>
                            {item.seller && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                {item.seller?.businessName || 'Seller'}
                              </span>
                            )}
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <span className="text-xs text-gray-400 font-medium">+{order.items.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        className="sk-btn sk-btn-primary sk-btn-sm"
                        onClick={() => navigate(`/dashboard/customer/orders/${order._id}`)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View Details
                      </button>
                      {order.status === 'delivered' && (
                        <button
                          className="sk-btn sk-btn-sm sk-btn-outline"
                          style={{ color: '#16a34a', borderColor: '#16a34a' }}
                          onClick={() => navigate(`/dashboard/customer/orders/${order._id}`)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          Receipt
                        </button>
                      )}
                      {order.status === 'delivered' && order.items?.some(item => !item.isReviewed) && (
                        <button
                          className="sk-btn sk-btn-sm"
                          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', boxShadow: '0 3px 10px rgba(245,158,11,0.25)' }}
                          onClick={() => navigate(`/dashboard/customer/orders/${order._id}?review=true`)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sk-empty-state">
              <div className="sk-empty-state-icon">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h6 className="sk-empty-state-title">No orders yet</h6>
              <p className="sk-empty-state-desc">You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <button onClick={() => navigate('/shop')} className="sk-btn sk-btn-primary mt-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
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
