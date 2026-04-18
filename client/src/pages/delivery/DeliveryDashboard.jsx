import { useState, useEffect, useRef, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { useCelebration } from '../../contexts/CelebrationContext'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PieChart from '../../components/ui/PieChart'
import { ProgressRing, HorizontalBar, SummaryRow, SparkBars } from '../../components/ui/AnalyticsWidgets'

const DeliveryDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { celebrate } = useCelebration()
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
      setPendingRequests(requests.map(r => ({ ...r.order, seller: r.seller, requestedAt: r.requestedAt })))
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
      celebrate({ count: 200 })
      setOtpInput('')
      fetchedRef.current = false
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setVerifying(false)
    }
  }

  const deliveryChartData = useMemo(() => {
    if (!stats) return []
    return [
      { label: 'Completed', value: stats.totalDeliveries || 0, color: '#10b981' },
      { label: 'Today', value: stats.todayDeliveries || 0, color: '#6366f1' },
      { label: 'Pending', value: stats.pendingRequests || 0, color: '#f59e0b' },
    ].filter(item => item.value > 0)
  }, [stats])

  if (user?.role !== 'delivery') return <Navigate to="/dashboard" />
  if (loading) return <LoadingSpinner />

  // Analytics computations
  const completionRate = (stats.totalDeliveries + (stats.pendingRequests || 0)) > 0
    ? Math.round((stats.totalDeliveries / (stats.totalDeliveries + (stats.pendingRequests || 0))) * 100) : 0
  const avgEarningsPerDelivery = stats.totalDeliveries > 0 ? Math.round(stats.totalEarnings / stats.totalDeliveries) : 0

  const deliverySparkData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    label: day,
    value: Math.max(1, Math.floor((stats.totalDeliveries || 0) / 7 + (i % 3))),
    color: ['#10b981', '#059669', '#34d399', '#10b981', '#047857', '#6ee7b7', '#10b981'][i]
  }))

  return (
    <div className="sk-dashboard">
      <div className="sk-dashboard-container">
        {/* Header */}
        <header className="sk-dash-header sk-animate">
          <div className="sk-dash-header-left">
            <div className="sk-dash-avatar-icon"><i className="fas fa-truck"></i></div>
            <div>
              <h1 className="sk-dash-title">Delivery Dashboard</h1>
              <p className="sk-dash-subtitle">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="sk-dash-actions">
            <Link to="/dashboard/delivery/profile" className="sk-btn sk-btn-secondary">
              <i className="fas fa-user-edit"></i> Profile
            </Link>
            <Link to="/dashboard/delivery/earnings" className="sk-btn sk-btn-primary">
              <i className="fas fa-wallet"></i> Earnings
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="sk-stats-grid">
          <div className="sk-stat-card gradient-amber sk-animate sk-delay-1">
            <div className="sk-stat-icon"><i className="fas fa-clipboard-list"></i></div>
            <div className="sk-stat-value">{stats.pendingRequests || 0}</div>
            <div className="sk-stat-label">Pending Requests</div>
          </div>
          <div className="sk-stat-card gradient-indigo sk-animate sk-delay-2">
            <div className="sk-stat-icon"><i className="fas fa-truck-loading"></i></div>
            <div className="sk-stat-value">{stats.todayDeliveries || 0}</div>
            <div className="sk-stat-label">Today's Deliveries</div>
          </div>
          <div className="sk-stat-card gradient-green sk-animate sk-delay-3">
            <div className="sk-stat-icon"><i className="fas fa-check-circle"></i></div>
            <div className="sk-stat-value">{stats.totalDeliveries || 0}</div>
            <div className="sk-stat-label">Total Deliveries</div>
          </div>
          <div className="sk-stat-card gradient-blue sk-animate sk-delay-4">
            <div className="sk-stat-icon"><i className="fas fa-rupee-sign"></i></div>
            <div className="sk-stat-value">₹{(stats.totalEarnings || 0).toLocaleString()}</div>
            <div className="sk-stat-label">Total Earnings</div>
          </div>
        </div>

        {/* Glassmorphism Earnings Highlight */}
        <div className="sk-glass-card sk-animate" style={{ marginBottom: '22px' }}>
          <div className="sk-glass-card-row">
            <div className="sk-glass-card-info">
              <h4>₹{(stats.totalEarnings || 0).toLocaleString()} Earned</h4>
              <p>Your delivery performance overview</p>
            </div>
            <SparkBars data={deliverySparkData} height={36} barWidth={8} gap={4} color="#10b981" />
            <SummaryRow items={[
              { icon: 'fas fa-truck', value: stats.totalDeliveries || 0, label: 'Delivered', color: '#10b981' },
              { icon: 'fas fa-calendar-day', value: stats.todayDeliveries || 0, label: 'Today', color: '#6366f1' },
              { icon: 'fas fa-rupee-sign', value: `₹${stats.todayEarnings || 0}`, label: 'Today Earn', color: '#f59e0b' },
            ]} />
          </div>
        </div>

        {/* Analytics: Charts + Performance */}
        <div className="sk-analytics-grid-2">
          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-chart-pie"></i> Delivery Overview</h3>
            </div>
            <div className="sk-analytics-body">
              <PieChart data={deliveryChartData} size={180} innerRadius={0.6} showLegend={true} />
            </div>
          </div>

          <div className="sk-analytics-card sk-animate">
            <div className="sk-analytics-header">
              <h3><i className="fas fa-bullseye"></i> Performance Metrics</h3>
            </div>
            <div className="sk-analytics-body">
              <div className="sk-progress-ring-container">
                <ProgressRing value={completionRate} max={100}
                  size={90} color="#10b981" label="Completion" sublabel="rate" />
                <ProgressRing value={stats.todayDeliveries || 0} max={Math.max(stats.todayDeliveries || 0, 5)}
                  size={90} color="#6366f1" label="Daily Goal" sublabel="today" />
              </div>
              <div style={{ marginTop: '16px' }}>
                <HorizontalBar label="Total Completed" value={stats.totalDeliveries || 0} max={Math.max(stats.totalDeliveries || 0, 1)} color="#10b981" />
                <HorizontalBar label="Today Done" value={stats.todayDeliveries || 0} max={Math.max(stats.totalDeliveries || 0, 1)} color="#6366f1" />
                <HorizontalBar label="Pending" value={stats.pendingRequests || 0} max={Math.max(stats.totalDeliveries || 0, 1)} color="#f59e0b" />
              </div>
              <div className="sk-perf-grid" style={{ marginTop: '16px' }}>
                <div className="sk-perf-item" style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' }}>
                  <div className="sk-perf-value" style={{ color: '#16a34a' }}>{stats.totalDeliveries || 0}</div>
                  <div className="sk-perf-label">Total Done</div>
                </div>
                <div className="sk-perf-item" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
                  <div className="sk-perf-value" style={{ color: '#6366f1' }}>{stats.todayDeliveries || 0}</div>
                  <div className="sk-perf-label">Today</div>
                </div>
                <div className="sk-perf-item" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                  <div className="sk-perf-value" style={{ color: '#d97706' }}>₹{stats.todayEarnings || 0}</div>
                  <div className="sk-perf-label">Today's Earnings</div>
                </div>
                <div className="sk-perf-item" style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)' }}>
                  <div className="sk-perf-value" style={{ color: '#9333ea' }}>₹{avgEarningsPerDelivery || 50}</div>
                  <div className="sk-perf-label">Avg Per Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Delivery - OTP Verification */}
        {activeDelivery && (
          <div className="sk-card sk-animate" style={{ border: '2px solid #10b981' }}>
            <div className="sk-card-header" style={{ background: '#f0fdf4' }}>
              <h3 className="sk-card-title" style={{ color: '#166534' }}>
                <i className="fas fa-truck-loading"></i> Active Delivery
              </h3>
              <span className="sk-badge sk-badge-success">In Progress</span>
            </div>
            <div className="sk-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {/* Addresses Section */}
                <div>
                  {/* Pickup Addresses */}
                  {(() => {
                    const sellers = []
                    const seen = new Set()
                    activeDelivery.items?.forEach(item => {
                      if (item.seller && !seen.has(item.seller._id)) {
                        seen.add(item.seller._id)
                        sellers.push(item.seller)
                      }
                    })
                    return sellers.length > 0 ? sellers.map((seller, idx) => (
                      <div key={idx} className="sk-address-card pickup">
                        <span className="sk-badge sk-badge-info" style={{ marginBottom: '8px' }}>📦 PICKUP {sellers.length > 1 ? `#${idx + 1}` : ''}</span>
                        <h6 className="sk-address-title">{seller.shopName || seller.businessName || 'Seller'}</h6>
                        {seller.user?.address ? (
                          <>
                            <p className="sk-address-line">{seller.user.address.street}</p>
                            <p className="sk-address-line" style={{ color: '#94a3b8' }}>
                              {seller.user.address.city}, {seller.user.address.state} - {seller.user.address.zipCode}
                            </p>
                          </>
                        ) : seller.shopLocation?.address ? (
                          <>
                            <p className="sk-address-line">{seller.shopLocation.address}</p>
                            <p className="sk-address-line" style={{ color: '#94a3b8' }}>
                              {seller.shopLocation.city}, {seller.shopLocation.state} - {seller.shopLocation.pincode}
                            </p>
                          </>
                        ) : seller.shopAddress ? (
                          <p className="sk-address-line">{seller.shopAddress}</p>
                        ) : (
                          <p className="sk-address-line" style={{ color: '#94a3b8' }}>Address not available</p>
                        )}
                        {seller.user?.phone && (
                          <p className="sk-address-line" style={{ marginTop: '8px' }}><i className="fas fa-phone"></i> {seller.user.phone}</p>
                        )}
                      </div>
                    )) : (
                      <div className="sk-address-card pickup">
                        <span className="sk-badge sk-badge-info" style={{ marginBottom: '8px' }}>📦 PICKUP FROM</span>
                        <p className="sk-address-line" style={{ color: '#94a3b8' }}>Seller info not available</p>
                      </div>
                    )
                  })()}

                  <div className="sk-address-card deliver">
                    <span className="sk-badge sk-badge-success" style={{ marginBottom: '8px' }}>🏠 DELIVER TO</span>
                    <h6 className="sk-address-title">{activeDelivery.customer?.name || 'Customer'}</h6>
                    {activeDelivery.shippingAddress ? (
                      <>
                        <p className="sk-address-line">{activeDelivery.shippingAddress.street || activeDelivery.shippingAddress.address}</p>
                        <p className="sk-address-line" style={{ color: '#94a3b8' }}>
                          {activeDelivery.shippingAddress.city}, {activeDelivery.shippingAddress.state} - {activeDelivery.shippingAddress.zipCode || activeDelivery.shippingAddress.pincode}
                        </p>
                      </>
                    ) : (
                      <p className="sk-address-line" style={{ color: '#94a3b8' }}>Address not available</p>
                    )}
                    <p className="sk-address-line" style={{ marginTop: '8px' }}>
                      <i className="fas fa-phone"></i> {activeDelivery.shippingAddress?.phone || activeDelivery.customer?.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Order Details & Actions */}
                <div>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Order</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>#{activeDelivery.orderNumber || activeDelivery._id?.substring(0, 8)}</span>
                    </div>
                    <hr style={{ borderColor: '#e2e8f0', margin: '8px 0' }} />
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '8px' }}>Items</p>
                    {activeDelivery.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                        <span style={{ color: '#475569' }}>{item.product?.name || 'Product'}</span>
                        <span style={{ color: '#94a3b8' }}>×{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {activeDelivery.status === 'assigned_delivery' && !activeDelivery.isHandedToDelivery && (
                    <div className="sk-alert sk-alert-warning">
                      <strong>Waiting for seller to hand over the package</strong>
                    </div>
                  )}

                  {activeDelivery.status === 'out_for_delivery' && (
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '8px' }}>Enter OTP to complete delivery</p>
                      <div style={{ marginBottom: '12px' }}>
                        <input
                          type="text"
                          className="sk-otp-input"
                          placeholder="0000"
                          maxLength={4}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <button onClick={handleVerifyOTP} className="sk-btn sk-btn-primary" style={{ width: '100%' }}
                        disabled={verifying || otpInput.length !== 4}>
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
        <div className="sk-card sk-animate">
          <div className="sk-card-header">
            <h3 className="sk-card-title"><i className="fas fa-inbox"></i> Available Requests</h3>
            <span className="sk-badge sk-badge-warning">{pendingRequests.length} pending</span>
          </div>
          <div className="sk-card-body">
            {pendingRequests.length > 0 ? (
              <ul className="sk-activity-list">
                {pendingRequests.map((request) => (
                  <li key={request._id} className="sk-activity-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <p style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 4px' }}>Order #{request.orderNumber || request._id?.substring(0, 8)}</p>
                        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                          {request.items?.length || 0} item(s) • ₹{(request.totalAmount || 0).toFixed(0)}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: '#10b981', margin: '0 0 8px' }}>₹50 Fee</p>
                        <button onClick={() => handleAcceptDelivery(request._id)}
                          className="sk-btn sk-btn-primary sk-btn-sm"
                          disabled={accepting === request._id || activeDelivery}>
                          {accepting === request._id ? 'Accepting...' : activeDelivery ? 'Busy' : 'Accept'}
                        </button>
                      </div>
                    </div>

                    {/* Address Display */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div className="sk-address-card pickup" style={{ padding: '10px' }}>
                        <span className="sk-badge sk-badge-info" style={{ fontSize: '0.625rem', marginBottom: '6px' }}>📦 PICKUP</span>
                        <p style={{ fontWeight: 600, color: '#1e293b', margin: '6px 0 4px', fontSize: '0.8125rem' }}>{request.seller?.shopName || request.seller?.businessName || 'Seller'}</p>
                        {request.seller?.user?.address ? (
                          <>
                            <p className="sk-address-line">{request.seller.user.address.street}</p>
                            <p className="sk-address-line" style={{ color: '#94a3b8' }}>
                              {request.seller.user.address.city}, {request.seller.user.address.state} - {request.seller.user.address.zipCode}
                            </p>
                          </>
                        ) : request.seller?.shopLocation?.address ? (
                          <>
                            <p className="sk-address-line">{request.seller.shopLocation.address}</p>
                            <p className="sk-address-line" style={{ color: '#94a3b8' }}>
                              {request.seller.shopLocation.city}, {request.seller.shopLocation.state} - {request.seller.shopLocation.pincode}
                            </p>
                          </>
                        ) : request.seller?.shopAddress ? (
                          <p className="sk-address-line">{request.seller.shopAddress}</p>
                        ) : (
                          <p className="sk-address-line" style={{ color: '#94a3b8' }}>Address not available</p>
                        )}
                        {request.seller?.user?.phone && (
                          <p className="sk-address-line" style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                            <i className="fas fa-phone"></i> {request.seller.user.phone}
                          </p>
                        )}
                      </div>
                      <div className="sk-address-card deliver" style={{ padding: '10px' }}>
                        <span className="sk-badge sk-badge-success" style={{ fontSize: '0.625rem', marginBottom: '6px' }}>🏠 DELIVER</span>
                        <p style={{ fontWeight: 600, color: '#1e293b', margin: '6px 0 4px', fontSize: '0.8125rem' }}>{request.customer?.name || 'Customer'}</p>
                        {request.shippingAddress ? (
                          <>
                            <p className="sk-address-line">{request.shippingAddress.street || request.shippingAddress.address}</p>
                            <p className="sk-address-line" style={{ color: '#94a3b8' }}>
                              {request.shippingAddress.city}, {request.shippingAddress.state} - {request.shippingAddress.zipCode || request.shippingAddress.pincode}
                            </p>
                          </>
                        ) : (
                          <p className="sk-address-line" style={{ color: '#94a3b8' }}>Address not available</p>
                        )}
                        {(request.shippingAddress?.phone || request.customer?.phone) && (
                          <p className="sk-address-line" style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                            <i className="fas fa-phone"></i> {request.shippingAddress?.phone || request.customer?.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="sk-empty">
                <div className="sk-empty-icon">📭</div>
                <h4 className="sk-empty-title">No pending requests</h4>
                <p className="sk-empty-text">New delivery requests will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryDashboard
