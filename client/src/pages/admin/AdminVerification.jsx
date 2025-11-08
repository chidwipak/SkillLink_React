import { useState, useEffect } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminVerification = () => {
  const [verifications, setVerifications] = useState({ workers: [], sellers: [], delivery: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('workers')

  useEffect(() => {
    fetchVerifications()
  }, [])

  const fetchVerifications = async () => {
    try {
      const response = await api.get('/admin/verifications/pending')
      setVerifications(response.data)
    } catch (error) {
      toast.error('Failed to load verifications')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (userId, type, approve, reason = '') => {
    try {
      const endpoint = type === 'worker' ? '/admin/workers' : type === 'seller' ? '/admin/sellers' : '/admin/delivery'
      await api.put(`${endpoint}/${userId}/verify`, {
        approved: approve,
        rejectionReason: reason
      })
      toast.success(`${type} ${approve ? 'approved' : 'rejected'}`)
      fetchVerifications()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process verification')
    }
  }

  const handleReject = (userId, type) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    handleVerify(userId, type, false, reason)
  }

  if (loading) return <LoadingSpinner />

  const tabs = [
    { key: 'workers', label: 'Workers', count: verifications.workers?.length || 0 },
    { key: 'sellers', label: 'Sellers', count: verifications.sellers?.length || 0 },
    { key: 'delivery', label: 'Delivery', count: verifications.delivery?.length || 0 }
  ]

  const currentList = verifications[activeTab] || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Verification Center</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white text-gray-800">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {currentList.length > 0 ? (
        <div className="space-y-4">
          {currentList.map((user) => (
            <div key={user._id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{user.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📧 {user.email}</p>
                    <p>📱 {user.phone || 'Not provided'}</p>
                    <p>📅 Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                    {user.shopName && <p>🏪 Shop: {user.shopName}</p>}
                    {user.experience && <p>💼 Experience: {user.experience} years</p>}
                    {user.skills && user.skills.length > 0 && (
                      <p>🔧 Skills: {user.skills.join(', ')}</p>
                    )}
                    {user.vehicleType && <p>🚙 Vehicle: {user.vehicleType}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleVerify(user._id, activeTab.slice(0, -1), true)}
                    className="w-full btn btn-success text-sm"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(user._id, activeTab.slice(0, -1))}
                    className="w-full btn btn-danger text-sm"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No pending {activeTab} verifications</p>
        </div>
      )}
    </div>
  )
}

export default AdminVerification
