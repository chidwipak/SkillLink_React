import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
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

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  if (loading) return <LoadingSpinner />

  const categories = ['electrician', 'plumber', 'carpenter']
  const categoryCounts = {
    all: services.length,
    electrician: services.filter(s => s.category === 'electrician').length,
    plumber: services.filter(s => s.category === 'plumber').length,
    carpenter: services.filter(s => s.category === 'carpenter').length,
  }

  const filteredServices = filter === 'all' 
    ? services 
    : services.filter(s => s.category === filter)

  const getCategoryIcon = (category) => {
    const icons = { electrician: '⚡', plumber: '🔧', carpenter: '🪚' }
    return icons[category] || '🛠️'
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h4 className="mb-1 fw-semibold">Service Management</h4>
          <p className="text-muted mb-0 small">Manage all platform services</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <button 
          className={`btn ${filter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setFilter('all')}
        >
          All Services ({categoryCounts.all})
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`btn ${filter === cat ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(cat)}
          >
            {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)} ({categoryCounts[cat]})
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="row g-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div key={service._id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="fs-4 me-2">{getCategoryIcon(service.category)}</span>
                      <h6 className="d-inline fw-semibold">{service.name}</h6>
                    </div>
                    <span className="badge bg-light text-dark">{service.category}</span>
                  </div>
                  <p className="text-muted small mb-3">{service.description}</p>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <div>
                      <span className="fw-bold fs-5">₹{service.price}</span>
                      <small className="text-muted ms-1">base price</small>
                    </div>
                    <small className="text-muted">
                      {service.duration} mins
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5 text-muted">
            No services found
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-5 pt-4 border-top">
        <h6 className="fw-semibold mb-3">Service Summary</h6>
        <div className="row g-4">
          {categories.map(cat => (
            <div key={cat} className="col-md-4">
              <div className="p-4 bg-light rounded-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 text-muted small text-capitalize">{cat} Services</p>
                    <h4 className="mb-0 fw-bold">{categoryCounts[cat]}</h4>
                  </div>
                  <span className="fs-2">{getCategoryIcon(cat)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminServices
