import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const TrackOrder = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrackingInfo()
    const interval = setInterval(fetchTrackingInfo, 10000)
    return () => clearInterval(interval)
  }, [id])

  const fetchTrackingInfo = async () => {
    try {
      const [orderRes, trackRes] = await Promise.all([api.get(`/orders/${id}`), api.get(`/orders/${id}/track`)])
      setOrder(orderRes.data.order)
      setTracking(trackRes.data.tracking)
    } catch (error) {
      toast.error('Failed to load tracking information')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📦' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' }
  ]
  const currentStepIndex = statusSteps.findIndex(step => step.key === order?.status)

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate('/dashboard/customer/orders')} className="mb-4 text-primary-600 hover:text-primary-700">← Back to Orders</button>
      <h1 className="text-3xl font-bold mb-6">Track Order #{order?.orderNumber}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Order Status</h2>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isActive = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${isActive ? 'bg-primary-600 text-white' : 'bg-gray-200'} ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}>{step.icon}</div>
                  <div className="flex-1"><p className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>{isCurrent && tracking?.lastUpdate && <p className="text-sm text-gray-600">{new Date(tracking.lastUpdate).toLocaleString()}</p>}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="space-y-6">
          {tracking?.deliveryPerson && <div className="card"><h2 className="text-xl font-semibold mb-4">Delivery Person</h2><div className="space-y-2"><p className="font-medium">{tracking.deliveryPerson.name}</p><p className="text-sm text-gray-600">{tracking.deliveryPerson.phone}</p>{tracking.deliveryPerson.vehicleNumber && <p className="text-sm text-gray-600">Vehicle: {tracking.deliveryPerson.vehicleNumber}</p>}</div></div>}
          <div className="card"><h2 className="text-xl font-semibold mb-4">Delivery Address</h2><div className="text-gray-700"><p className="font-medium">{order?.shippingAddress?.name}</p><p>{order?.shippingAddress?.phone}</p><p>{order?.shippingAddress?.address}</p><p>{order?.shippingAddress?.city}, {order?.shippingAddress?.state} - {order?.shippingAddress?.pincode}</p></div></div>
          {tracking?.estimatedDelivery && <div className="card bg-primary-50"><p className="text-sm text-gray-600 mb-1">Estimated Delivery</p><p className="text-xl font-semibold text-primary-600">{new Date(tracking.estimatedDelivery).toLocaleDateString()}</p></div>}
          {order?.status === 'shipped' && <div className="card bg-blue-50"><p className="text-center text-blue-800">📍 Your order is on the way!</p><p className="text-center text-sm text-blue-600 mt-2">Live tracking will be available soon</p></div>}
        </div>
      </div>
      {order?.status === 'shipped' && <div className="card mt-6"><h2 className="text-xl font-semibold mb-4">Live Location</h2><div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center"><div className="text-center"><p className="text-gray-600 mb-2">🗺️ Map view coming soon</p><p className="text-sm text-gray-500">Google Maps integration will show real-time location</p></div></div></div>}
    </div>
  )
}

export default TrackOrder
