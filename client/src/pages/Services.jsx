import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import ImageWithFallback from '../components/common/ImageWithFallback'
import '../styles/modern.css'

const Services = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const category = searchParams.get('category')
  
  // Available service categories
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'electrician', label: 'Electrician' },
    { value: 'plumber', label: 'Plumber' },
    { value: 'carpenter', label: 'Carpenter' }
  ]

  // Initialize selected category from URL params
  useEffect(() => {
    if (category) {
      setSelectedCategory(category)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [selectedCategory])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services)
    } else {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredServices(filtered)
    }
  }, [searchQuery, services])

  const fetchServices = async () => {
    try {
      const url = selectedCategory ? `/services?category=${selectedCategory}` : '/services'
      const response = await api.get(url)
      const servicesData = response.data.services || response.data || []
      setServices(servicesData)
      setFilteredServices(servicesData)
    } catch (error) {
      console.error('Services fetch error:', error)
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value
    setSelectedCategory(newCategory)
    setSearchQuery('')
    if (newCategory) {
      setSearchParams({ category: newCategory })
    } else {
      setSearchParams({})
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading services...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen page-enter" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #eef2ff 100%)' }}>
      {/* Floating Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="floating-particle floating-particle-1"></div>
        <div className="floating-particle floating-particle-2"></div>
        <div className="floating-particle floating-particle-3"></div>
      </div>
      
      {/* Header Section - Enhanced with Tailwind */}
      <div className="services-hero relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #a855f7 100%)',
        paddingTop: '7rem',
        paddingBottom: '3.5rem'
      }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10" style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(30%, -50%)' }}></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 opacity-10" style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Services` : 'Our Services'}
            </h1>
            <p className="text-lg text-white/85 max-w-xl mx-auto">Professional services for all your needs</p>
          </div>
          
          {/* Search Bar and Category Filter */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Category Dropdown */}
              <div className="relative" style={{ minWidth: '200px' }}>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-3.5 rounded-xl bg-white text-gray-700 font-medium border-0 shadow-lg shadow-indigo-500/10 focus:ring-4 focus:ring-white/20 outline-none cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '40px' }}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search services by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3.5 pr-12 rounded-xl bg-white text-gray-700 font-medium border-0 shadow-lg shadow-indigo-500/10 focus:ring-4 focus:ring-white/20 outline-none placeholder:text-gray-400"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(selectedCategory || searchQuery) && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/20">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                    <button
                      onClick={() => handleCategoryChange({ target: { value: '' } })}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/20">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services Grid - Enhanced with Tailwind */}
      <div className="container mx-auto px-4 py-12 relative" style={{ zIndex: 1 }}>
        {loading ? (
          <div className="sk-loading-page">
            <div className="sk-spinner"></div>
            <p>Loading amazing services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filteredServices.map((service, index) => (
              <div key={service._id} className="fade-in-up visible" style={{ transitionDelay: `${index * 80}ms` }}>
                <div 
                  className="service-card card-shine group"
                  onClick={() => navigate(`/services/${service._id}`)}
                >
                  <div className="service-card-image">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.name}
                      type={service.category || 'service'}
                      className="w-full h-full object-cover"
                    />
                    <div className="overlay"></div>
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg capitalize"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                        {service.category}
                      </span>
                    </div>
                  </div>
                  <div className="service-card-body">
                    <h5 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{service.name}</h5>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{service.description}</p>
                    <div className="flex items-center text-gray-400 text-sm mb-4">
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{service.duration || 60} minutes</span>
                    </div>
                    <div className="service-card-footer">
                      <span className="service-card-price">₹{service.price}</span>
                      <button className="sk-btn sk-btn-primary sk-btn-sm group-hover:shadow-lg transition-shadow">
                        Book Now
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sk-empty-state">
            <div className="sk-empty-state-icon">🔍</div>
            <p className="sk-empty-state-title">
              {searchQuery ? `No services found matching "${searchQuery}"` : 'No services available'}
            </p>
            <p className="sk-empty-state-desc">Try adjusting your filters or search terms</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="sk-btn sk-btn-primary mt-4">
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Services
