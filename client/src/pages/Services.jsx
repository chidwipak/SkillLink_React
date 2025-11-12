import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import ImageWithFallback from '../components/common/ImageWithFallback'

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
    <div>
      {/* Header Section */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Services` : 'Our Services'}
          </h1>
          <p className="text-xl text-gray-600 mb-6">Professional services for all your needs</p>
          
          {/* Search Bar and Category Filter */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Dropdown */}
              <div className="relative sm:w-64">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-6 py-4 rounded-lg border-2 border-gray-300 focus:border-primary-600 focus:outline-none text-lg bg-white appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search services by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 rounded-lg border-2 border-gray-300 focus:border-primary-600 focus:outline-none text-lg"
                />
                <i className="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(selectedCategory || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mt-4 justify-center">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    <i className="fas fa-filter"></i>
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                    <button
                      onClick={() => handleCategoryChange({ target: { value: '' } })}
                      className="ml-1 hover:text-primary-900"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                    <i className="fas fa-search"></i>
                    "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-gray-900"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div 
                key={service._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.name}
                    type={service.category || 'service'}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-700 text-sm font-medium rounded-full shadow-sm capitalize">
                      {service.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <i className="fas fa-clock mr-2"></i>
                    <span>{service.duration || 60} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary-600">
                      ₹{service.price}
                    </span>
                    <button 
                      onClick={() => navigate(`/services/${service._id}`)}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center"
                    >
                      Book Now
                      <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-xl">
              {searchQuery ? `No services found matching "${searchQuery}"` : 'No services found'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
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
