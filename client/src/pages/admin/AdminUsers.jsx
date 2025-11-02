import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const AdminUsers = () => {
  const { user } = useSelector((state) => state.auth)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  if (loading) return <LoadingSpinner />

  // Filter users by role and search
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesSearch = search === '' || 
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    return matchesRole && matchesSearch
  })

  const roleCounts = {
    all: users.length,
    customer: users.filter(u => u.role === 'customer').length,
    worker: users.filter(u => u.role === 'worker').length,
    seller: users.filter(u => u.role === 'seller').length,
    delivery: users.filter(u => u.role === 'delivery').length,
    admin: users.filter(u => u.role === 'admin').length,
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-danger',
      customer: 'bg-primary',
      worker: 'bg-info',
      seller: 'bg-success',
      delivery: 'bg-warning text-dark'
    }
    return badges[role] || 'bg-secondary'
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h4 className="mb-1 fw-semibold">User Management</h4>
          <p className="text-muted mb-0 small">Manage all platform users</p>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="row g-3 mb-4">
        {[
          { label: 'All Users', value: roleCounts.all, filter: 'all', icon: '👥' },
          { label: 'Customers', value: roleCounts.customer, filter: 'customer', icon: '🛒' },
          { label: 'Workers', value: roleCounts.worker, filter: 'worker', icon: '👷' },
          { label: 'Sellers', value: roleCounts.seller, filter: 'seller', icon: '🏪' },
          { label: 'Delivery', value: roleCounts.delivery, filter: 'delivery', icon: '🚚' },
        ].map((stat, i) => (
          <div key={i} className="col-lg-2 col-md-4 col-6">
            <div 
              className={`text-center p-3 rounded-3 h-100 ${roleFilter === stat.filter ? 'bg-dark text-white shadow' : 'bg-white shadow-sm'}`}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setRoleFilter(stat.filter)}
            >
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              <h4 className="mb-0 fw-bold mt-2">{stat.value}</h4>
              <small className={roleFilter === stat.filter ? 'text-white-50' : 'text-muted'}>{stat.label}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold py-3">User</th>
                  <th className="fw-semibold py-3">Email</th>
                  <th className="fw-semibold py-3">Role</th>
                  <th className="fw-semibold py-3">Phone</th>
                  <th className="fw-semibold py-3">Joined</th>
                  <th className="fw-semibold py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" 
                               style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className={`badge ${getRoleBadge(u.role)}`}>{u.role}</span>
                      </td>
                      <td className="text-muted">{u.phone || '-'}</td>
                      <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.isEmailVerified ? (
                          <span className="text-success small">● Verified</span>
                        ) : (
                          <span className="text-warning small">● Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
