import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const DeliveryDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({ pendingRequests: 0, todayDeliveries: 0, totalDeliveries: 0, totalEarnings: 0, todayEarnings: 0 })
  const [pendingRequests, setPendingRequests] = useState([])
  const [activeDelivery, setActiveDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [otpInput, setOtpInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, requestsRes, activeRes] = await Promise.all([
        api.get('/delivery/stats'),
        api.get('/delivery/requests'),
        api.get('/delivery/active')
      ])
      setStats(statsRes.data.stats || {})
      const requests = requestsRes.data.requests || []
      const mappedRequests = requests.map(r => ({
        ...r.order,
        seller: r.seller,
        requestedAt: r.requestedAt
      }))
      setPendingRequests(mappedRequests)
      setActiveDelivery(activeRes.data.activeDelivery || null)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptDelivery = async (orderId) => {
    setAccepting(orderId)
    try {
      const response = await api.put(`/delivery/accept/${orderId}`)
      toast.success(response.data.message || 'Delivery accepted!')
      fetchedRef.current = false
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept delivery')
    } finally {
      setAccepting(null)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otpInput || otpInput.length !== 4) {
      toast.error('Please enter 4-digit OTP')
      return
    }
    setVerifying(true)
    try {
      const response = await api.put(`/delivery/deliver/${activeDelivery._id}`, { otp: otpInput })
      toast.success(response.data.message || 'Delivery completed! ₹50 earned.')
      setOtpInput('')
      fetchedRef.current = false
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setVerifying(false)
    }
  }

  if (user?.role !== 'delivery') {
    return <Navigate to="/dashboard" />
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h4 className="mb-1 fw-semibold">Delivery Dashboard</h4>
          <p className="text-muted mb-0 small">Manage your deliveries and track earnings</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/dashboard/delivery/profile" className="btn btn-outline-primary btn-sm">
            ✏️ Profile
          </Link>
          <Link to="/dashboard/delivery/earnings" className="btn btn-outline-secondary btn-sm">
            View Earnings
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>📋</span>
              </div>
              <p className="text-muted small mb-0">Pending Requests</p>
            </div>
            <h3 className="mb-0 fw-bold">{stats.pendingRequests || 0}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>🚚</span>
              </div>
              <p className="text-muted small mb-0">Today's Deliveries</p>
            </div>
            <h3 className="mb-0 fw-bold">{stats.todayDeliveries || 0}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>✓</span>
              </div>
              <p className="text-muted small mb-0">Total Deliveries</p>
            </div>
            <h3 className="mb-0 fw-bold">{stats.totalDeliveries || 0}</h3>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="bg-white p-4 rounded-3 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                <span style={{ fontSize: '1.25rem' }}>💰</span>
              </div>
              <p className="text-muted small mb-0">Total Earnings</p>
            </div>
            <h3 className="mb-0 fw-bold">₹{(stats.totalEarnings || 0).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Active Delivery - OTP Verification */}
      {activeDelivery && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-transparent py-3 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Active Delivery</h6>
            <span className="badge bg-primary">In Progress</span>
          </div>
          <div className="card-body">
            <div className="row g-4">
              {/* Addresses Section */}
              <div className="col-md-6">
                {/* Pickup Address (Seller) */}
                <div className="border rounded p-3 mb-3 bg-light">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-primary">📦 PICKUP FROM</span>
                  </div>
                  <h6 className="mb-1 fw-semibold">{activeDelivery.seller?.shopName || activeDelivery.seller?.businessName || 'Seller'}</h6>
                  {activeDelivery.seller?.user?.address ? (
                    <>
                      <p className="mb-1 small">{activeDelivery.seller.user.address.street}</p>
                      <p className="mb-1 small text-muted">
                        {activeDelivery.seller.user.address.city}, {activeDelivery.seller.user.address.state} - {activeDelivery.seller.user.address.zipCode}
                      </p>
                    </>
                  ) : activeDelivery.seller?.address ? (
                    <>
                      <p className="mb-1 small">{activeDelivery.seller.address.street || activeDelivery.seller.address}</p>
                      <p className="mb-1 small text-muted">
                        {activeDelivery.seller.address.city}, {activeDelivery.seller.address.state} - {activeDelivery.seller.address.zipCode}
                      </p>
                    </>
                  ) : (
                    <p className="mb-1 small text-muted">Address not available</p>
                  )}
                  {(activeDelivery.seller?.user?.phone || activeDelivery.seller?.phone) && (
                    <p className="mb-0 small">
                      <i className="fas fa-phone me-1"></i> 
                      {activeDelivery.seller?.user?.phone || activeDelivery.seller?.phone}
                    </p>
                  )}
                </div>

                {/* Delivery Address (Customer) */}
                <div className="border rounded p-3 border-success">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-success">🏠 DELIVER TO</span>
                  </div>
                  <h6 className="mb-1 fw-semibold">{activeDelivery.customer?.name || 'Customer'}</h6>
                  {activeDelivery.shippingAddress ? (
                    <>
                      <p className="mb-1 small">{activeDelivery.shippingAddress.street || activeDelivery.shippingAddress.address}</p>
                      <p className="mb-1 small text-muted">
                        {activeDelivery.shippingAddress.city}, {activeDelivery.shippingAddress.state} - {activeDelivery.shippingAddress.zipCode || activeDelivery.shippingAddress.pincode}
                      </p>
                    </>
                  ) : activeDelivery.customer?.address ? (
                    <>
                      <p className="mb-1 small">{activeDelivery.customer.address.street}</p>
                      <p className="mb-1 small text-muted">
                        {activeDelivery.customer.address.city}, {activeDelivery.customer.address.state} - {activeDelivery.customer.address.zipCode}
                      </p>
                    </>
                  ) : (
                    <p className="mb-1 small text-muted">Address not available</p>
                  )}
                  <p className="mb-0 small">
                    <i className="fas fa-phone me-1"></i> 
                    {activeDelivery.shippingAddress?.phone || activeDelivery.customer?.phone || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Order Details & Actions */}
              <div className="col-md-6">
                <div className="bg-light rounded p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <p className="text-muted small mb-0">Order</p>
                    <span className="fw-medium">#{activeDelivery.orderNumber || activeDelivery._id?.substring(0, 8)}</span>
                  </div>
                  <hr className="my-2" />
                  <p className="text-muted small mb-2">Items</p>
                  {activeDelivery.items?.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between small">
                      <span>{item.product?.name || 'Product'}</span>
                      <span className="text-muted">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                {activeDelivery.status === 'assigned_delivery' && !activeDelivery.isHandedToDelivery && (
                  <div className="alert alert-warning py-2 mb-3 small">
                    <strong>Waiting for seller to hand over the package</strong>
                  </div>
                )}

                {activeDelivery.status === 'out_for_delivery' && (
                  <div className="border rounded p-3">
                    <p className="small text-muted mb-2">Enter OTP to complete delivery</p>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control text-center font-monospace"
                        placeholder="0000"
                        maxLength={4}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        style={{ fontSize: '1.25rem', letterSpacing: '0.5rem' }}
                      />
                    </div>
                    <button
                      onClick={handleVerifyOTP}
                      className="btn btn-dark w-100"
                      disabled={verifying || otpInput.length !== 4}
                    >
                      {verifying ? 'Verifying...' : 'Complete Delivery'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Delivery Requests */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent py-3">
          <h6 className="mb-0 fw-semibold">Available Requests</h6>
        </div>
        <div className="card-body p-0">
          {pendingRequests.length > 0 ? (
            <div className="list-group list-group-flush">
              {pendingRequests.map((request) => (
                <div key={request._id} className="list-group-item py-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <p className="mb-1 fw-medium">Order #{request.orderNumber || request._id?.substring(0, 8)}</p>
                      <small className="text-muted">
                        {request.items?.length || 0} item(s) • Order value: ₹{(request.totalAmount || 0).toFixed(0)}
                      </small>
                    </div>
                    <div className="text-end">
                      <p className="mb-2 fw-semibold text-success">₹50 Delivery Fee</p>
                      <button
                        onClick={() => handleAcceptDelivery(request._id)}
                        className="btn btn-dark btn-sm"
                        disabled={accepting === request._id || activeDelivery}
                      >
                        {accepting === request._id ? 'Accepting...' : activeDelivery ? 'Busy' : 'Accept'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Address Display */}
                  <div className="row g-2 mt-2">
                    <div className="col-6">
                      <div className="bg-light rounded p-2 small">
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <span className="badge bg-primary" style={{fontSize: '0.65rem'}}>📦 PICKUP</span>
                        </div>
                        <p className="mb-0 fw-medium">{request.seller?.shopName || request.seller?.businessName || 'Seller'}</p>
                        {request.seller?.user?.address ? (
                          <p className="mb-0 text-muted" style={{fontSize: '0.75rem'}}>
                            {request.seller.user.address.city}, {request.seller.user.address.state}
                          </p>
                        ) : request.seller?.address?.city ? (
                          <p className="mb-0 text-muted" style={{fontSize: '0.75rem'}}>
                            {request.seller.address.city}, {request.seller.address.state}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-light rounded p-2 small border-success" style={{borderLeft: '3px solid #198754'}}>
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <span className="badge bg-success" style={{fontSize: '0.65rem'}}>🏠 DELIVER</span>
                        </div>
                        <p className="mb-0 fw-medium">{request.customer?.name || 'Customer'}</p>
                        <p className="mb-0 text-muted" style={{fontSize: '0.75rem'}}>
                          {request.shippingAddress?.city || request.customer?.address?.city || 'N/A'}, 
                          {request.shippingAddress?.state || request.customer?.address?.state || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-1">No pending requests</p>
              <small className="text-muted">New requests will appear here</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeliveryDashboard
