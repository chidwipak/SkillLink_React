import { useState, useEffect, useRef, useMemo } from 'react'
import { useSelector } from 'react-redux'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DashboardSkeleton from '../../components/common/DashboardSkeleton'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'
const imgSrc = (path) => {
  if (!path || path === '/images/default-profile.png') return null
  return path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

const VerifierDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [pendingUsers, setPendingUsers] = useState([])
  const [approvedUsers, setApprovedUsers] = useState([])
  const [rejectedUsers, setRejectedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineFeedback, setDeclineFeedback] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/verifier/stats'),
        api.get('/verifier/pending'),
      ])
      setStats(statsRes.data.stats)
      setPendingUsers(pendingRes.data.users || [])
    } catch (err) {
      toast.error('Failed to fetch verifier data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchApprovedUsers = async () => {
    try {
      const res = await api.get('/verifier/users-approved')
      setApprovedUsers(res.data.users || [])
    } catch (err) {
      toast.error('Failed to fetch approved users')
    }
  }

  const fetchRejectedUsers = async () => {
    try {
      const res = await api.get('/verifier/users-rejected')
      setRejectedUsers(res.data.users || [])
    } catch (err) {
      toast.error('Failed to fetch rejected users')
    }
  }

  useEffect(() => {
    if (activeTab === 'approved' && approvedUsers.length === 0) fetchApprovedUsers()
    if (activeTab === 'rejected' && rejectedUsers.length === 0) fetchRejectedUsers()
  }, [activeTab])

  const viewUserDetails = async (userId) => {
    try {
      setDetailsLoading(true)
      setSelectedUser(userId)
      const res = await api.get(`/verifier/users/${userId}`)
      setUserDetails(res.data)
    } catch (err) {
      toast.error('Failed to fetch user details')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      setActionLoading(true)
      await api.put(`/verifier/users/${userId}/approve`)
      toast.success('User approved successfully!')
      setPendingUsers(prev => prev.filter(u => u._id !== userId))
      setSelectedUser(null)
      setUserDetails(null)
      const statsRes = await api.get('/verifier/stats')
      setStats(statsRes.data.stats)
      setApprovedUsers([]) // force refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!declineFeedback.trim()) {
      toast.error('Feedback is mandatory when declining a user')
      return
    }
    try {
      setActionLoading(true)
      await api.put(`/verifier/users/${selectedUser}/decline`, { feedback: declineFeedback })
      toast.success('User declined successfully')
      setPendingUsers(prev => prev.filter(u => u._id !== selectedUser))
      setShowDeclineModal(false)
      setDeclineFeedback('')
      setSelectedUser(null)
      setUserDetails(null)
      const statsRes = await api.get('/verifier/stats')
      setStats(statsRes.data.stats)
      setRejectedUsers([]) // force refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline user')
    } finally {
      setActionLoading(false)
    }
  }

  const getRoleBadgeClass = (role) => {
    const map = { customer: 'sk-badge-info', worker: 'sk-badge-indigo', seller: 'sk-badge-success', delivery: 'sk-badge-warning' }
    return map[role] || 'sk-badge-default'
  }

  const getRoleIcon = (role) => {
    const map = { worker: 'fa-tools', seller: 'fa-store', delivery: 'fa-truck', customer: 'fa-user' }
    return map[role] || 'fa-user'
  }

  const getRoleColor = (role) => {
    const map = { worker: '#0ea5e9', seller: '#10b981', delivery: '#f59e0b', customer: '#6366f1' }
    return map[role] || '#64748b'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  // Filter users by role and search
  const filterUsers = (list) => {
    let filtered = list
    if (roleFilter !== 'all') filtered = filtered.filter(u => u.role === roleFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q))
    }
    return filtered
  }

  // Group users by role
  const groupByRole = (list) => {
    const groups = {}
    list.forEach(u => {
      if (!groups[u.role]) groups[u.role] = []
      groups[u.role].push(u)
    })
    return groups
  }

  const getCurrentList = () => {
    if (activeTab === 'pending') return pendingUsers
    if (activeTab === 'approved') return approvedUsers
    if (activeTab === 'rejected') return rejectedUsers
    return []
  }

  const filteredList = filterUsers(getCurrentList())
  const groupedList = groupByRole(filteredList)
  const roleOrder = ['worker', 'seller', 'delivery', 'customer']

  if (loading) return <DashboardSkeleton cards={4} rows={5} />

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verifier Dashboard</h1>
        <p className="text-gray-500 mt-1">Review and manage user registration applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-yellow-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('pending')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-yellow-700 mt-1">{stats?.pending || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl">⏳</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('approved')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Approved</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{stats?.approved || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('rejected')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Rejected</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{stats?.rejected || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl">❌</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Total Users</p>
              <p className="text-3xl font-bold text-indigo-700 mt-1">{stats?.total || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">👥</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'pending', label: 'Pending Users', icon: '⏳', color: 'yellow', count: pendingUsers.length },
          { key: 'approved', label: 'Approved Users', icon: '✅', color: 'green', count: approvedUsers.length },
          { key: 'rejected', label: 'Rejected Users', icon: '❌', color: 'red', count: rejectedUsers.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedUser(null); setUserDetails(null); setRoleFilter('all'); setSearchQuery('') }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? `bg-${tab.color === 'yellow' ? 'amber' : tab.color}-600 text-white shadow-lg`
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
            style={activeTab === tab.key ? { background: tab.color === 'yellow' ? '#d97706' : tab.color === 'green' ? '#059669' : '#dc2626' } : {}}
          >
            {tab.icon} {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search & Role Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <i className="fas fa-search text-gray-400 text-sm"></i>
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="flex-1 border-none outline-none text-sm text-gray-800 bg-transparent"
          />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xs"></i></button>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: 'all', label: 'All Roles' },
            { key: 'worker', label: 'Workers', icon: 'fa-tools' },
            { key: 'seller', label: 'Sellers', icon: 'fa-store' },
            { key: 'delivery', label: 'Delivery', icon: 'fa-truck' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === f.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.icon && <i className={`fas ${f.icon} mr-1`}></i>}{f.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-400">
          {filteredList.length} user(s)
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - User List grouped by role */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`p-4 border-b border-gray-100 bg-gradient-to-r ${
              activeTab === 'pending' ? 'from-yellow-50 to-orange-50' :
              activeTab === 'approved' ? 'from-green-50 to-emerald-50' :
              'from-red-50 to-rose-50'
            }`}>
              <h2 className="font-bold text-gray-800">
                {activeTab === 'pending' ? '⏳ Pending' : activeTab === 'approved' ? '✅ Approved' : '❌ Rejected'} Registrations
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{filteredList.length} user(s) {activeTab === 'pending' ? 'awaiting review' : ''}</p>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredList.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">{activeTab === 'pending' ? '🎉' : '📋'}</div>
                  <p className="font-semibold text-gray-700">{activeTab === 'pending' ? 'All caught up!' : 'No users found'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeTab === 'pending' ? 'No pending registrations' : searchQuery ? `No matches for "${searchQuery}"` : `No ${activeTab} users`}
                  </p>
                </div>
              ) : (
                roleOrder.filter(role => groupedList[role]?.length > 0).map(role => (
                  <div key={role}>
                    {/* Role Section Header */}
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2 sticky top-0 z-10">
                      <i className={`fas ${getRoleIcon(role)} text-xs`} style={{ color: getRoleColor(role) }}></i>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: getRoleColor(role) }}>{role}s</span>
                      <span className="ml-auto text-[10px] font-semibold text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">{groupedList[role].length}</span>
                    </div>
                    {groupedList[role].map((u) => (
                      <div
                        key={u._id}
                        onClick={() => viewUserDetails(u._id)}
                        className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-indigo-50/50 transition-all ${
                          selectedUser === u._id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {imgSrc(u.profilePicture) ? (
                            <img src={imgSrc(u.profilePicture)} alt={u.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
                          ) : null}
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 items-center justify-center text-white text-sm font-bold flex-shrink-0 ${imgSrc(u.profilePicture) ? 'hidden' : 'flex'}`}>
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                          <span className={`sk-badge ${getRoleBadgeClass(u.role)} text-[10px]`}>{u.role}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-gray-400">Registered: {formatDate(u.createdAt)}</p>
                          {activeTab === 'rejected' && u.rejection_feedback && (
                            <span className="text-[10px] text-red-400 truncate max-w-[120px]" title={u.rejection_feedback}>
                              ❌ {u.rejection_feedback}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right - User Details Panel */}
        <div className="lg:col-span-2">
          {!selectedUser ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4">👈</div>
              <h3 className="text-lg font-bold text-gray-700">Select a User</h3>
              <p className="text-gray-500 mt-2">Click on a user from the list to view their full details</p>
            </div>
          ) : detailsLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"><LoadingSpinner /></div>
          ) : userDetails ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* User Detail Header */}
              <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <div className="flex items-center gap-4">
                  {imgSrc(userDetails.user?.profilePicture) ? (
                    <img src={imgSrc(userDetails.user.profilePicture)} alt={userDetails.user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                  ) : null}
                  <div className={`w-16 h-16 rounded-2xl bg-white/20 items-center justify-center text-3xl font-bold backdrop-blur-sm ${imgSrc(userDetails.user?.profilePicture) ? 'hidden' : 'flex'}`}>
                    {userDetails.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{userDetails.user?.name}</h2>
                    <p className="text-indigo-100 text-sm">{userDetails.user?.email}</p>
                    <div className="flex gap-2 mt-1 items-center">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold capitalize">{userDetails.user?.role}</span>
                      {userDetails.user?.verification_status && (
                        <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${
                          userDetails.user.verification_status === 'approved' ? 'bg-green-500/30 text-green-100' :
                          userDetails.user.verification_status === 'rejected' ? 'bg-red-500/30 text-red-100' :
                          'bg-yellow-500/30 text-yellow-100'
                        }`}>
                          {userDetails.user.verification_status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="p-6">
                <h3 className="font-bold text-gray-800 mb-4">📋 User Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500 font-semibold">Full Name</p><p className="font-medium text-gray-800">{userDetails.user?.name}</p></div>
                  <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500 font-semibold">Email</p><p className="font-medium text-gray-800">{userDetails.user?.email}</p></div>
                  <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500 font-semibold">Phone</p><p className="font-medium text-gray-800">{userDetails.user?.phone || 'N/A'}</p></div>
                  <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500 font-semibold">Role</p><p className="font-medium text-gray-800 capitalize">{userDetails.user?.role}</p></div>
                  <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500 font-semibold">Registered</p><p className="font-medium text-gray-800">{formatDate(userDetails.user?.createdAt)}</p></div>
                  <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500 font-semibold">Email Verified</p><p className="font-medium text-gray-800">{userDetails.user?.isEmailVerified ? '✅ Yes' : '❌ No'}</p></div>
                </div>

                {userDetails.user?.address && (
                  <div className="mt-4 p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500 font-semibold mb-1">Address</p>
                    <p className="font-medium text-gray-800">{[userDetails.user.address.street, userDetails.user.address.city, userDetails.user.address.state, userDetails.user.address.zipCode].filter(Boolean).join(', ')}</p>
                  </div>
                )}

                {/* Role-specific profile */}
                {userDetails.roleProfile && (
                  <div className="mt-6">
                    <h3 className="font-bold text-gray-800 mb-4">🏷️ {userDetails.user?.role === 'worker' ? 'Worker' : userDetails.user?.role === 'seller' ? 'Seller' : 'Delivery'} Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userDetails.user?.role === 'worker' && (<>
                        <div className="p-3 rounded-xl bg-blue-50"><p className="text-xs text-blue-600 font-semibold">Service Category</p><p className="font-medium text-gray-800 capitalize">{userDetails.roleProfile.serviceCategory || 'N/A'}</p></div>
                        <div className="p-3 rounded-xl bg-blue-50"><p className="text-xs text-blue-600 font-semibold">Experience</p><p className="font-medium text-gray-800">{userDetails.roleProfile.experience || 0} years</p></div>
                        <div className="p-3 rounded-xl bg-blue-50 sm:col-span-2"><p className="text-xs text-blue-600 font-semibold">Skills</p><div className="flex flex-wrap gap-1 mt-1">
                          {(userDetails.roleProfile.skills || []).map((skill, i) => (<span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{skill}</span>))}
                          {(!userDetails.roleProfile.skills || userDetails.roleProfile.skills.length === 0) && <span className="text-gray-500 text-sm">No skills listed</span>}
                        </div></div>
                      </>)}
                      {userDetails.user?.role === 'seller' && (<>
                        <div className="p-3 rounded-xl bg-green-50"><p className="text-xs text-green-600 font-semibold">Business Name</p><p className="font-medium text-gray-800">{userDetails.roleProfile.businessName || 'N/A'}</p></div>
                        <div className="p-3 rounded-xl bg-green-50"><p className="text-xs text-green-600 font-semibold">GST Number</p><p className="font-medium text-gray-800">{userDetails.roleProfile.gstNumber || 'N/A'}</p></div>
                        <div className="p-3 rounded-xl bg-green-50 sm:col-span-2"><p className="text-xs text-green-600 font-semibold">Description</p><p className="font-medium text-gray-800">{userDetails.roleProfile.businessDescription || userDetails.roleProfile.description || 'N/A'}</p></div>
                      </>)}
                      {userDetails.user?.role === 'delivery' && (<>
                        <div className="p-3 rounded-xl bg-orange-50"><p className="text-xs text-orange-600 font-semibold">Vehicle Type</p><p className="font-medium text-gray-800 capitalize">{userDetails.roleProfile.vehicleType || 'N/A'}</p></div>
                        <div className="p-3 rounded-xl bg-orange-50"><p className="text-xs text-orange-600 font-semibold">Vehicle Number</p><p className="font-medium text-gray-800">{userDetails.roleProfile.vehicleNumber || 'N/A'}</p></div>
                      </>)}
                    </div>
                  </div>
                )}

                {/* Profile Picture Section */}
                {imgSrc(userDetails.user?.profilePicture) && (
                  <div className="mt-6"><h3 className="font-bold text-gray-800 mb-4">📸 Profile Picture</h3><div className="p-3 rounded-xl bg-gray-50">
                    <img src={imgSrc(userDetails.user.profilePicture)} alt="Profile" className="w-32 h-32 rounded-xl object-cover border border-gray-200" onError={(e) => { e.target.src = '/images/default-profile.png'; }} />
                  </div></div>
                )}

                {/* Documents & Images Section */}
                {userDetails.roleProfile && (
                  <div className="mt-6">
                    <h3 className="font-bold text-gray-800 mb-4">📄 Uploaded Documents & Images</h3>

                    {userDetails.user?.role === 'worker' && (
                      <div className="space-y-4">
                        {userDetails.roleProfile.idProofDocument && (<div className="p-3 rounded-xl bg-blue-50"><p className="text-xs text-blue-600 font-semibold mb-2">ID Proof Document</p><a href={`${BASE_URL}${userDetails.roleProfile.idProofDocument.startsWith('/') ? '' : '/'}${userDetails.roleProfile.idProofDocument}`} target="_blank" rel="noopener noreferrer" className="block"><img src={`${BASE_URL}${userDetails.roleProfile.idProofDocument.startsWith('/') ? '' : '/'}${userDetails.roleProfile.idProofDocument}`} alt="ID Proof" className="max-w-xs max-h-48 rounded-lg border border-blue-200 hover:opacity-90 transition-opacity cursor-pointer" onError={(e) => { e.target.style.display = 'none'; }} /></a></div>)}
                        {userDetails.roleProfile.aadharNumber && (<div className="p-3 rounded-xl bg-blue-50"><p className="text-xs text-blue-600 font-semibold">Aadhar Number</p><p className="font-medium text-gray-800">{userDetails.roleProfile.aadharNumber}</p></div>)}
                        {userDetails.roleProfile.panNumber && (<div className="p-3 rounded-xl bg-blue-50"><p className="text-xs text-blue-600 font-semibold">PAN Number</p><p className="font-medium text-gray-800">{userDetails.roleProfile.panNumber}</p></div>)}
                        {userDetails.roleProfile.documents?.length > 0 && (<div className="p-3 rounded-xl bg-blue-50"><p className="text-xs text-blue-600 font-semibold mb-2">Uploaded Documents</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{userDetails.roleProfile.documents.map((doc, i) => (<a key={i} href={`${BASE_URL}${doc.startsWith('/') ? '' : '/'}${doc}`} target="_blank" rel="noopener noreferrer" className="block"><div className="border border-blue-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"><img src={`${BASE_URL}${doc.startsWith('/') ? '' : '/'}${doc}`} alt={`Doc ${i + 1}`} className="w-full h-24 object-cover" onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML='<div class="p-2 text-center"><span class="text-2xl">📄</span></div>'; }} /></div></a>))}</div></div>)}
                        {userDetails.roleProfile.verificationDocuments?.length > 0 && (<div className="p-3 rounded-xl bg-blue-50"><p className="text-xs text-blue-600 font-semibold mb-2">Verification Documents</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{userDetails.roleProfile.verificationDocuments.map((doc, i) => (<a key={i} href={`${BASE_URL}${doc.startsWith('/') ? '' : '/'}${doc}`} target="_blank" rel="noopener noreferrer" className="block"><div className="border border-blue-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"><img src={`${BASE_URL}${doc.startsWith('/') ? '' : '/'}${doc}`} alt={`Verification ${i + 1}`} className="w-full h-24 object-cover" onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML='<div class="p-2 text-center"><span class="text-2xl">📄</span></div>'; }} /></div></a>))}</div></div>)}
                      </div>
                    )}

                    {userDetails.user?.role === 'seller' && (
                      <div className="space-y-4">
                        {(userDetails.roleProfile.shopImages?.exterior || userDetails.roleProfile.shopImages?.interior) && (<div className="p-3 rounded-xl bg-green-50"><p className="text-xs text-green-600 font-semibold mb-2">Shop Images</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {userDetails.roleProfile.shopImages?.exterior && (<div><p className="text-xs text-gray-500 mb-1">Exterior</p><a href={`${BASE_URL}${userDetails.roleProfile.shopImages.exterior.startsWith('/') ? '' : '/'}${userDetails.roleProfile.shopImages.exterior}`} target="_blank" rel="noopener noreferrer"><img src={`${BASE_URL}${userDetails.roleProfile.shopImages.exterior.startsWith('/') ? '' : '/'}${userDetails.roleProfile.shopImages.exterior}`} alt="Exterior" className="w-full h-40 object-cover rounded-lg border border-green-200 hover:opacity-90 transition-opacity cursor-pointer" onError={(e) => { e.target.style.display='none'; }} /></a></div>)}
                          {userDetails.roleProfile.shopImages?.interior && (<div><p className="text-xs text-gray-500 mb-1">Interior</p><a href={`${BASE_URL}${userDetails.roleProfile.shopImages.interior.startsWith('/') ? '' : '/'}${userDetails.roleProfile.shopImages.interior}`} target="_blank" rel="noopener noreferrer"><img src={`${BASE_URL}${userDetails.roleProfile.shopImages.interior.startsWith('/') ? '' : '/'}${userDetails.roleProfile.shopImages.interior}`} alt="Interior" className="w-full h-40 object-cover rounded-lg border border-green-200 hover:opacity-90 transition-opacity cursor-pointer" onError={(e) => { e.target.style.display='none'; }} /></a></div>)}
                        </div></div>)}
                        {userDetails.roleProfile.businessLicense && (<div className="p-3 rounded-xl bg-green-50"><p className="text-xs text-green-600 font-semibold mb-2">Business License</p><a href={`${BASE_URL}${userDetails.roleProfile.businessLicense.startsWith('/') ? '' : '/'}${userDetails.roleProfile.businessLicense}`} target="_blank" rel="noopener noreferrer"><img src={`${BASE_URL}${userDetails.roleProfile.businessLicense.startsWith('/') ? '' : '/'}${userDetails.roleProfile.businessLicense}`} alt="License" className="max-w-xs max-h-48 rounded-lg border border-green-200 hover:opacity-90 cursor-pointer" onError={(e) => { e.target.style.display='none'; }} /></a></div>)}
                        {userDetails.roleProfile.aadharNumber && (<div className="p-3 rounded-xl bg-green-50"><p className="text-xs text-green-600 font-semibold">Aadhar Number</p><p className="font-medium text-gray-800">{userDetails.roleProfile.aadharNumber}</p></div>)}
                        {userDetails.roleProfile.panNumber && (<div className="p-3 rounded-xl bg-green-50"><p className="text-xs text-green-600 font-semibold">PAN Number</p><p className="font-medium text-gray-800">{userDetails.roleProfile.panNumber}</p></div>)}
                        {userDetails.roleProfile.gstNumber && (<div className="p-3 rounded-xl bg-green-50"><p className="text-xs text-green-600 font-semibold">GST Number</p><p className="font-medium text-gray-800">{userDetails.roleProfile.gstNumber}</p></div>)}
                        {userDetails.roleProfile.documents?.length > 0 && (<div className="p-3 rounded-xl bg-green-50"><p className="text-xs text-green-600 font-semibold mb-2">Uploaded Documents</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{userDetails.roleProfile.documents.map((doc, i) => (<a key={i} href={`${BASE_URL}${doc.startsWith('/') ? '' : '/'}${doc}`} target="_blank" rel="noopener noreferrer" className="block"><div className="border border-green-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"><img src={`${BASE_URL}${doc.startsWith('/') ? '' : '/'}${doc}`} alt={`Doc ${i + 1}`} className="w-full h-24 object-cover" onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML='<div class="p-2 text-center"><span class="text-2xl">📄</span></div>'; }} /></div></a>))}</div></div>)}
                      </div>
                    )}

                    {userDetails.user?.role === 'delivery' && (
                      <div className="space-y-4">
                        {userDetails.roleProfile.drivingLicense && (<div className="p-3 rounded-xl bg-orange-50"><p className="text-xs text-orange-600 font-semibold mb-2">Driving License</p><a href={`${BASE_URL}${userDetails.roleProfile.drivingLicense.startsWith('/') ? '' : '/'}${userDetails.roleProfile.drivingLicense}`} target="_blank" rel="noopener noreferrer"><img src={`${BASE_URL}${userDetails.roleProfile.drivingLicense.startsWith('/') ? '' : '/'}${userDetails.roleProfile.drivingLicense}`} alt="License" className="max-w-xs max-h-48 rounded-lg border border-orange-200 hover:opacity-90 cursor-pointer" onError={(e) => { e.target.style.display='none'; }} /></a></div>)}
                        {userDetails.roleProfile.aadharNumber && (<div className="p-3 rounded-xl bg-orange-50"><p className="text-xs text-orange-600 font-semibold">Aadhar Number</p><p className="font-medium text-gray-800">{userDetails.roleProfile.aadharNumber}</p></div>)}
                        {userDetails.roleProfile.documents?.length > 0 && (<div className="p-3 rounded-xl bg-orange-50"><p className="text-xs text-orange-600 font-semibold mb-2">Uploaded Documents</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{userDetails.roleProfile.documents.map((doc, i) => (<a key={i} href={`${BASE_URL}${doc.startsWith('/') ? '' : '/'}${doc}`} target="_blank" rel="noopener noreferrer" className="block"><div className="border border-orange-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"><img src={`${BASE_URL}${doc.startsWith('/') ? '' : '/'}${doc}`} alt={`Doc ${i + 1}`} className="w-full h-24 object-cover" onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML='<div class="p-2 text-center"><span class="text-2xl">📄</span></div>'; }} /></div></a>))}</div></div>)}
                      </div>
                    )}

                    {(() => {
                      const rp = userDetails.roleProfile; const role = userDetails.user?.role; let hasDocs = false;
                      if (role === 'worker') hasDocs = rp.idProofDocument || rp.aadharNumber || rp.panNumber || rp.documents?.length > 0 || rp.verificationDocuments?.length > 0;
                      if (role === 'seller') hasDocs = rp.shopImages?.exterior || rp.shopImages?.interior || rp.businessLicense || rp.aadharNumber || rp.panNumber || rp.gstNumber || rp.documents?.length > 0;
                      if (role === 'delivery') hasDocs = rp.drivingLicense || rp.aadharNumber || rp.documents?.length > 0;
                      return !hasDocs ? <div className="p-4 rounded-xl bg-gray-50 text-center"><p className="text-gray-500 text-sm">No documents uploaded during registration</p></div> : null;
                    })()}
                  </div>
                )}

                {/* Rejection feedback for rejected users */}
                {activeTab === 'rejected' && userDetails.user?.rejection_feedback && (
                  <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100">
                    <h3 className="font-bold text-red-700 mb-2">❌ Rejection Feedback</h3>
                    <p className="text-red-700 text-sm">{userDetails.user.rejection_feedback}</p>
                  </div>
                )}

                {/* Action Buttons - only for pending tab */}
                {activeTab === 'pending' && (
                  <div className="mt-8 flex gap-3">
                    <button onClick={() => handleApprove(selectedUser)} disabled={actionLoading} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all disabled:opacity-50">
                      {actionLoading ? 'Processing...' : '✅ Accept User'}
                    </button>
                    <button onClick={() => setShowDeclineModal(true)} disabled={actionLoading} className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all disabled:opacity-50">
                      {actionLoading ? 'Processing...' : '❌ Decline User'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-red-500 to-rose-600 text-white">
              <h3 className="text-lg font-bold">Decline User Registration</h3>
              <p className="text-red-100 text-sm mt-1">Provide feedback for the user explaining why their registration was declined</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Feedback <span className="text-red-500">*</span></label>
              <textarea value={declineFeedback} onChange={(e) => setDeclineFeedback(e.target.value)} placeholder="Enter detailed reason for declining this registration..." rows={4} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none" />
              {declineFeedback.trim().length === 0 && <p className="text-xs text-red-500 mt-1">Feedback is mandatory</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowDeclineModal(false); setDeclineFeedback('') }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={handleDecline} disabled={actionLoading || !declineFeedback.trim()} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50">{actionLoading ? 'Declining...' : 'Confirm Decline'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerifierDashboard