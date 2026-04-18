import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DashboardSkeleton from '../../components/common/DashboardSkeleton'
import toast from 'react-hot-toast'

const AdminVerification = () => {
  const [verifications, setVerifications] = useState({ workers: [], sellers: [], delivery: [] })
  const [approvedUsers, setApprovedUsers] = useState([])
  const [rejectedUsers, setRejectedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [roleFilter, setRoleFilter] = useState('all')
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchVerifications()
  }, [])

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/verifications/pending')
      setVerifications(response.data)
    } catch (error) {
      toast.error('Failed to load verifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchApproved = async () => {
    try {
      const res = await api.get('/admin/users/approved')
      setApprovedUsers(res.data.users || [])
    } catch { toast.error('Failed to fetch approved users') }
  }

  const fetchRejected = async () => {
    try {
      const res = await api.get('/admin/users/rejected')
      setRejectedUsers(res.data.users || [])
    } catch { toast.error('Failed to fetch rejected users') }
  }

  useEffect(() => {
    if (activeTab === 'approved' && approvedUsers.length === 0) fetchApproved()
    if (activeTab === 'rejected' && rejectedUsers.length === 0) fetchRejected()
  }, [activeTab])

  // Normalize worker/seller/delivery populated data into flat user objects
  const normalizePending = () => {
    const all = []
    ;(verifications.workers || []).forEach(item => {
      const u = item.user || item
      all.push({ _id: item._id, userId: u._id, name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt, role: 'worker', shopName: item.shopName, experience: item.experience, skills: item.skills, serviceCategory: item.serviceCategory, vehicleType: item.vehicleType })
    })
    ;(verifications.sellers || []).forEach(item => {
      const u = item.user || item
      all.push({ _id: item._id, userId: u._id, name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt, role: 'seller', shopName: item.shopName || item.businessName, experience: item.experience, skills: item.skills, serviceCategory: item.serviceCategory, vehicleType: item.vehicleType })
    })
    ;(verifications.delivery || []).forEach(item => {
      const u = item.user || item
      all.push({ _id: item._id, userId: u._id, name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt, role: 'delivery', vehicleType: item.vehicleType, vehicleNumber: item.vehicleNumber })
    })
    return all
  }

  const pendingList = normalizePending()

  const getCurrentList = () => {
    if (activeTab === 'pending') return pendingList
    if (activeTab === 'approved') return approvedUsers
    if (activeTab === 'rejected') return rejectedUsers
    return []
  }

  const filterByRole = (list) => {
    if (roleFilter === 'all') return list
    return list.filter(u => u.role === roleFilter)
  }

  const filteredList = filterByRole(getCurrentList())

  const getRoleColor = (role) => {
    const map = { worker: '#0ea5e9', seller: '#10b981', delivery: '#f59e0b', customer: '#6366f1' }
    return map[role] || '#64748b'
  }
  const getRoleIcon = (role) => {
    const map = { worker: 'fa-tools', seller: 'fa-store', delivery: 'fa-truck', customer: 'fa-user' }
    return map[role] || 'fa-user'
  }
  const getRoleBadge = (role) => {
    const map = { worker: 'sk-badge-info', seller: 'sk-badge-success', delivery: 'sk-badge-warning', customer: 'sk-badge-indigo' }
    return map[role] || 'sk-badge-default'
  }

  if (loading) return <DashboardSkeleton cards={3} rows={5} />

  const tabDefs = [
    { key: 'pending', label: 'Pending', icon: '⏳', color: '#d97706', count: pendingList.length },
    { key: 'approved', label: 'Approved', icon: '✅', color: '#059669', count: approvedUsers.length },
    { key: 'rejected', label: 'Rejected', icon: '❌', color: '#dc2626', count: rejectedUsers.length },
  ]

  return (
    <div className="sk-dashboard">
      <div className="sk-dashboard-container">
        {/* Header */}
        <header className="sk-dash-header sk-animate">
          <div className="sk-dash-header-left">
            <div className="sk-dash-avatar-icon"><i className="fas fa-eye"></i></div>
            <div>
              <h1 className="sk-dash-title">Verification Monitor</h1>
              <p className="sk-dash-subtitle">View-only — verifiers handle approvals & rejections</p>
            </div>
          </div>
          <div className="sk-dash-header-actions">
            <button onClick={() => { fetchedRef.current = false; setApprovedUsers([]); setRejectedUsers([]); fetchVerifications() }} className="sk-btn sk-btn-ghost sk-btn-sm"><i className="fas fa-sync-alt"></i> Refresh</button>
            <Link to="/dashboard/admin" className="sk-btn sk-btn-secondary">
              <i className="fas fa-arrow-left"></i> Back
            </Link>
          </div>
        </header>

        {/* Info Banner */}
        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="fas fa-info-circle" style={{ color: '#6366f1', fontSize: '1.1rem' }}></i>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#4338ca' }}>
            <strong>Monitor only.</strong> Approvals and rejections are handled by the Verifier role. You can view user details and rejection reasons here.
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {tabDefs.map(t => (
            <div key={t.key} onClick={() => { setActiveTab(t.key); setRoleFilter('all') }} className="sk-stat-card sk-animate" style={{ cursor: 'pointer', borderLeft: `4px solid ${t.color}`, transition: 'box-shadow 0.2s', boxShadow: activeTab === t.key ? `0 0 0 2px ${t.color}30` : undefined }}>
              <div className="sk-stat-value" style={{ color: t.color }}>{t.count}</div>
              <div className="sk-stat-label">{t.icon} {t.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Buttons */}
        <div className="sk-filter-tabs" style={{ marginBottom: '16px' }}>
          {tabDefs.map(tab => (
            <div key={tab.key} className={`sk-filter-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => { setActiveTab(tab.key); setRoleFilter('all') }}>
              <div className="sk-filter-tab-icon">{tab.icon}</div>
              <div className="sk-filter-tab-count">{tab.count}</div>
              <div className="sk-filter-tab-label">{tab.label}</div>
            </div>
          ))}
        </div>

        {/* Role Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[{ key: 'all', label: 'All Roles' }, { key: 'worker', label: 'Workers', icon: 'fa-tools' }, { key: 'seller', label: 'Sellers', icon: 'fa-store' }, { key: 'delivery', label: 'Delivery', icon: 'fa-truck' }].map(f => (
            <button key={f.key} onClick={() => setRoleFilter(f.key)} className={`sk-btn sk-btn-sm ${roleFilter === f.key ? 'sk-btn-primary' : 'sk-btn-ghost'}`}>
              {f.icon && <i className={`fas ${f.icon}`} style={{ marginRight: '4px' }}></i>}{f.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', alignSelf: 'center' }}>{filteredList.length} user(s)</span>
        </div>

        {/* User List */}
        <div className="sk-card sk-animate">
          <div className="sk-card-header">
            <h3 className="sk-card-title">
              <i className={`fas ${activeTab === 'pending' ? 'fa-clock' : activeTab === 'approved' ? 'fa-user-check' : 'fa-user-times'}`} style={{ color: tabDefs.find(t => t.key === activeTab)?.color }}></i>
              {' '}{activeTab === 'pending' ? 'Pending Verifications' : activeTab === 'approved' ? 'Approved Users' : 'Rejected Users'}
            </h3>
            <span className={`sk-badge ${activeTab === 'pending' ? 'sk-badge-warning' : activeTab === 'approved' ? 'sk-badge-success' : 'sk-badge-danger'}`}>{filteredList.length}</span>
          </div>
          <div className="sk-card-body">
            {filteredList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredList.map((u) => (
                  <div key={u._id || u.userId} style={{
                    padding: '16px 20px',
                    background: activeTab === 'rejected' ? '#fef2f2' : activeTab === 'approved' ? '#f0fdf4' : '#f8fafc',
                    borderRadius: '12px',
                    border: `1px solid ${activeTab === 'rejected' ? '#fecaca' : activeTab === 'approved' ? '#bbf7d0' : '#e2e8f0'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${getRoleColor(u.role)}20`, color: getRoleColor(u.role), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{u.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{u.email}</p>
                      </div>
                      <span className={`sk-badge ${getRoleBadge(u.role)}`} style={{ textTransform: 'capitalize' }}>
                        <i className={`fas ${getRoleIcon(u.role)}`} style={{ marginRight: '4px' }}></i>{u.role}
                      </span>
                      {activeTab === 'pending' && <span className="sk-badge sk-badge-warning">Awaiting Verifier</span>}
                      {activeTab === 'approved' && <span className="sk-badge sk-badge-success">Verified</span>}
                      {activeTab === 'rejected' && <span className="sk-badge sk-badge-danger">Rejected</span>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#475569' }}>
                      <span><i className="fas fa-phone" style={{ marginRight: '4px', color: '#94a3b8' }}></i> {u.phone || 'Not provided'}</span>
                      <span><i className="fas fa-calendar" style={{ marginRight: '4px', color: '#94a3b8' }}></i> {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                      {u.shopName && <span><i className="fas fa-store" style={{ marginRight: '4px', color: '#94a3b8' }}></i> {u.shopName}</span>}
                      {u.experience && <span><i className="fas fa-briefcase" style={{ marginRight: '4px', color: '#94a3b8' }}></i> {u.experience} yrs exp</span>}
                      {u.serviceCategory && <span><i className="fas fa-tag" style={{ marginRight: '4px', color: '#94a3b8' }}></i> {u.serviceCategory}</span>}
                      {u.skills?.length > 0 && <span><i className="fas fa-wrench" style={{ marginRight: '4px', color: '#94a3b8' }}></i> {u.skills.join(', ')}</span>}
                      {u.vehicleType && <span><i className="fas fa-car" style={{ marginRight: '4px', color: '#94a3b8' }}></i> {u.vehicleType}</span>}
                    </div>
                    {/* Rejection reason shown for rejected tab */}
                    {activeTab === 'rejected' && u.rejection_feedback && (
                      <div style={{ marginTop: '10px', padding: '10px 14px', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#9f1239' }}>
                          <i className="fas fa-comment-dots" style={{ marginRight: '6px' }}></i>
                          <strong>Verifier Feedback:</strong> {u.rejection_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="sk-empty">
                <div className="sk-empty-icon">{activeTab === 'pending' ? '✅' : '📋'}</div>
                <h4 className="sk-empty-title">{activeTab === 'pending' ? 'All caught up!' : `No ${activeTab} users`}</h4>
                <p className="sk-empty-text">{activeTab === 'pending' ? 'No pending verifications right now' : `No ${activeTab} users to display`}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminVerification
