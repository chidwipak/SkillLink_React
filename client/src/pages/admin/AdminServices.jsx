import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Link } from 'react-router-dom'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const AdminServices = () => {
  const { user } = useSelector((state) => state.auth)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await api.get('/services')
      setServices(response.data.services || response.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'admin') return <Navigate to="/dashboard" />
  if (loading) return <LoadingSpinner />

  const categoryCounts = {
    all: services.length,
    electrician: services.filter(s => s.category === 'electrician').length,
    plumber: services.filter(s => s.category === 'plumber').length,
    carpenter: services.filter(s => s.category === 'carpenter').length,
  }

  const filteredServices = filter === 'all'
    ? services
    : services.filter(s => s.category === filter)

  const getCategoryIcon = (c) => ({ electrician: '⚡', plumber: '🔧', carpenter: '🪚' }[c] || '🛠️')

  const filterTabs = [
    { label: 'All Services', value: 'all', icon: '🛠️', count: categoryCounts.all },
    { label: 'Electrician', value: 'electrician', icon: '⚡', count: categoryCounts.electrician },
    { label: 'Plumber', value: 'plumber', icon: '🔧', count: categoryCounts.plumber },
    { label: 'Carpenter', value: 'carpenter', icon: '🪚', count: categoryCounts.carpenter },
  ]

  return (
    <div className="sk-dashboard">
      <div className="sk-dashboard-container">
        {/* Header */}
        <header className="sk-dash-header sk-animate">
          <div className="sk-dash-header-left">
            <div className="sk-dash-avatar-icon"><i className="fas fa-cogs"></i></div>
            <div>
              <h1 className="sk-dash-title">Service Management</h1>
              <p className="sk-dash-subtitle">Manage all platform services</p>
            </div>
          </div>
          <div className="sk-dash-actions">
            <Link to="/dashboard/admin" className="sk-btn sk-btn-secondary">
              <i className="fas fa-arrow-left"></i> Back
            </Link>
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="sk-filter-tabs">
          {filterTabs.map(tab => (
            <div
              key={tab.value}
              className={`sk-filter-tab ${filter === tab.value ? 'active' : ''}`}
              onClick={() => setFilter(tab.value)}
            >
              <div className="sk-filter-tab-icon">{tab.icon}</div>
              <div className="sk-filter-tab-count">{tab.count}</div>
              <div className="sk-filter-tab-label">{tab.label}</div>
            </div>
          ))}
        </div>

        {/* Services Grid */}
        <div className="sk-card sk-animate">
          <div className="sk-card-header">
            <h3 className="sk-card-title">
              <i className="fas fa-th-large"></i> {filter === 'all' ? 'All Services' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Services`}
            </h3>
            <span className="sk-badge sk-badge-info">{filteredServices.length} services</span>
          </div>
          <div className="sk-card-body">
            {filteredServices.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filteredServices.map((service) => (
                  <div key={service._id} style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{getCategoryIcon(service.category)}</span>
                        <h6 style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>{service.name}</h6>
                      </div>
                      <span className="sk-badge sk-badge-default">{service.category}</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '12px', lineHeight: 1.5 }}>
                      {service.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#6366f1' }}>₹{service.price}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '4px' }}>base</span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        <i className="fas fa-clock" style={{ marginRight: '4px' }}></i>
                        {service.duration} mins
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sk-empty">
                <div className="sk-empty-icon">🔍</div>
                <h4 className="sk-empty-title">No services found</h4>
                <p className="sk-empty-text">No services match the selected filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminServices
