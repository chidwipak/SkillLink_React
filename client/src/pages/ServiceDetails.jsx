import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ImageWithFallback from '../components/common/ImageWithFallback'
import toast from 'react-hot-toast'

const ServiceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [service, setService] = useState(null)
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState('')
  const [showCustomAddress, setShowCustomAddress] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    address: '',
    description: ''
  })

  // Helper function to get worker's price for the current service
  const getWorkerPrice = (worker) => {
    // First try to find the specific price from worker's pricing array
    if (worker.pricing && Array.isArray(worker.pricing) && service?.name) {
      const servicePricing = worker.pricing.find(
        p => p.serviceName?.toLowerCase() === service.name.toLowerCase()
      )
      if (servicePricing && servicePricing.price > 0) {
        return servicePricing.price
      }
    }
    // Fallback to service's base price
    return service?.price || 0
  }

  useEffect(() => {
    fetchServiceDetails()
  }, [id])

  const fetchServiceDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching service details for ID:', id)
      
      const response = await api.get(`/services/${id}`)
      console.log('Service API response:', response.data)
      console.log('Service object type:', typeof response.data.service)
      console.log('Service object keys:', response.data.service ? Object.keys(response.data.service) : 'null')
      
      if (response.data.success && response.data.service) {
        // Ensure service is a plain object
        const serviceData = JSON.parse(JSON.stringify(response.data.service))
        console.log('Parsed service data:', serviceData)
        
        setService(serviceData)
        setWorkers(response.data.workers || [])
      } else if (response.data.service) {
        // Handle case where success field is missing but service exists
        const serviceData = JSON.parse(JSON.stringify(response.data.service))
        setService(serviceData)
        setWorkers(response.data.workers || [])
      } else {
        console.error('No service in response:', response.data)
        throw new Error('Service not found in response')
      }
    } catch (error) {
      console.error('Service details error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      const message = error.response?.status === 404 
        ? 'Service not found'
        : error.response?.data?.message || 'Failed to load service details'
      
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkerSelect = (worker) => {
    if (!isAuthenticated) {
      toast.error('Please login to book a service')
      setTimeout(() => {
        navigate('/login', { state: { from: `/services/${id}` } })
      }, 1000)
      return
    }

    if (user?.role !== 'customer') {
      toast.error('Only customers can book services')
      return
    }

    setSelectedWorker(worker)
    setShowBookingModal(true)
  }

  const handleBooking = async (e) => {
    e.preventDefault()

    if (!selectedWorker) {
      toast.error('Please select a worker')
      return
    }

    // Validate all required fields
    if (!bookingData.date) {
      toast.error('Please select a date')
      return
    }
    if (!bookingData.time) {
      toast.error('Please select a time')
      return
    }
    if (!bookingData.address || bookingData.address.trim() === '') {
      toast.error('Please enter service address')
      return
    }

    const bookingPayload = {
      service: id,
      worker: selectedWorker._id,
      date: bookingData.date,
      time: bookingData.time,
      address: bookingData.address.trim(),
      description: bookingData.description || ''
    }

    console.log('=== BOOKING SUBMISSION ===')
    console.log('Service ID:', id)
    console.log('Worker ID:', selectedWorker._id)
    console.log('Date:', bookingData.date)
    console.log('Time:', bookingData.time)
    console.log('Address:', bookingData.address)
    console.log('Full Payload:', bookingPayload)
    console.log('========================')

    try {
      const response = await api.post('/bookings', bookingPayload)

      console.log('Booking response:', response.data)
      toast.success('Booking request sent successfully!')
      setShowBookingModal(false)
      setBookingData({
        date: '',
        time: '',
        address: '',
        description: ''
      })
      setTimeout(() => {
        navigate('/dashboard/customer/bookings', { replace: true })
      }, 1500)
    } catch (error) {
      console.error('=== BOOKING ERROR ===')
      console.error('Error:', error)
      console.error('Response data:', error.response?.data)
      console.error('Response status:', error.response?.status)
      console.error('==================')
      
      const message = error.response?.data?.message || 'Failed to create booking'
      toast.error(message)
    }
  }

  if (loading) return <LoadingSpinner />

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <i className="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
          <h2 className="text-2xl font-bold mb-4">{error || 'Service not found'}</h2>
          <p className="text-gray-600 mb-6">The service you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/services')} 
            className="btn btn-primary"
          >
            ← Back to Services
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section with Service Details */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <button 
            onClick={() => navigate('/services')} 
            className="mb-6 flex items-center gap-2 text-white hover:text-gray-200 transition"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Services</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Service Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
                <ImageWithFallback
                  src={service?.image}
                  alt={String(service?.name || 'Service')}
                  type={service?.category || 'service'}
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-6 right-6">
                <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Starting from</p>
                    <p className="text-3xl font-bold text-primary-600">₹{typeof service?.price === 'number' ? service.price : Number(service?.price) || 0}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold text-sm">
                      {String(service?.category || '').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="lg:pl-8 mt-8 lg:mt-0">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{String(service?.name || 'Service')}</h1>
              <p className="text-xl text-gray-100 mb-6 leading-relaxed">{String(service?.description || '')}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-clock text-2xl"></i>
                    <div>
                      <p className="text-sm text-gray-200">Duration</p>
                      <p className="font-semibold">{service?.duration || 60} mins</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-users text-2xl"></i>
                    <div>
                      <p className="text-sm text-gray-200">Workers</p>
                      <p className="font-semibold">{workers.length} Available</p>
                    </div>
                  </div>
                </div>
              </div>

              <a 
                href="#workers" 
                className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
              >
                <i className="fas fa-calendar-check"></i>
                <span>Book Workers</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Section */}
      <div id="workers" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Available Workers</h2>
          <p className="text-xl text-gray-600">Choose from our verified and experienced professionals</p>
        </div>

        {workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workers.map((worker) => (
              <div
                key={worker._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                {/* Worker Profile Picture */}
                <div className="relative h-64 bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
                  <ImageWithFallback
                    src={worker.user?.profilePicture}
                    alt={String(worker.user?.name || 'Worker')}
                    type="worker"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {worker.isAvailable ? (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                      <i className="fas fa-circle text-xs animate-pulse"></i>
                      Available
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Busy
                    </div>
                  )}
                </div>

                {/* Worker Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {String(worker.user?.name || worker.name || 'Worker')}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`fas fa-star ${i < Math.floor(worker.rating || 0) ? '' : 'text-gray-300'}`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-gray-600 font-semibold">
                      {typeof worker.rating === 'number' ? worker.rating.toFixed(1) : '5.0'}
                    </span>
                    <span className="text-gray-400 text-sm">
                      ({worker.totalReviews || 0} reviews)
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <i className="fas fa-briefcase w-5"></i>
                      <span>{Number(worker.experience) || 0} years experience</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <i className="fas fa-tag w-5"></i>
                      <span className="font-semibold text-primary-600 text-xl">
                        ₹{getWorkerPrice(worker)}
                      </span>
                    </div>
                    {worker.user?.phone && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <i className="fas fa-phone w-5"></i>
                        <span>{worker.user.phone}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleWorkerSelect(worker)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <i className="fas fa-calendar-check"></i>
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-200 rounded-full mb-4">
              <i className="fas fa-users text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Workers Available</h3>
            <p className="text-gray-500 mb-6">There are currently no workers available for this service.</p>
            <button 
              onClick={() => navigate('/services')} 
              className="btn btn-primary"
            >
              Browse Other Services
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowBookingModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">Book Service</h2>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="text-white hover:text-gray-200 transition"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
              
              {/* Worker Summary */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                    <ImageWithFallback
                      src={selectedWorker.user?.profilePicture}
                      alt={String(selectedWorker.user?.name || 'Worker')}
                      type="worker"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-semibold">{String(selectedWorker.user?.name || selectedWorker.name || 'Worker')}</p>
                    <p className="text-gray-200">{String(service?.name || 'Service')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-200">Price</p>
                    <p className="text-2xl font-bold">₹{getWorkerPrice(selectedWorker)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBooking} className="p-6 space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-calendar-alt mr-2 text-primary-600"></i>
                  Select Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-clock mr-2 text-primary-600"></i>
                  Select Time *
                </label>
                <select
                  required
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                >
                  <option value="">Choose a time slot</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>

              {/* Address Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-map-marker-alt mr-2 text-primary-600"></i>
                  Service Address *
                </label>
                
                {/* Show saved addresses if available */}
                {user?.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-3">
                    <select
                      value={selectedAddressIndex}
                      onChange={(e) => {
                        const value = e.target.value
                        setSelectedAddressIndex(value)
                        if (value === 'custom') {
                          setShowCustomAddress(true)
                          setBookingData({ ...bookingData, address: '' })
                        } else if (value !== '') {
                          setShowCustomAddress(false)
                          const addr = user.addresses[parseInt(value)]
                          const fullAddress = `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}`
                          setBookingData({ ...bookingData, address: fullAddress })
                        } else {
                          setShowCustomAddress(false)
                          setBookingData({ ...bookingData, address: '' })
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    >
                      <option value="">Select an address</option>
                      {user.addresses.map((addr, index) => (
                        <option key={index} value={index}>
                          {addr.label ? `${addr.label} - ` : ''}{addr.street}, {addr.city}
                          {addr.isDefault ? ' ★ Default' : ''}
                        </option>
                      ))}
                      <option value="custom">+ Enter a different address</option>
                    </select>
                    
                    {showCustomAddress && (
                      <textarea
                        required
                        rows="3"
                        value={bookingData.address}
                        onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                        placeholder="Enter your complete address where service is needed"
                      />
                    )}
                    
                    {selectedAddressIndex !== '' && selectedAddressIndex !== 'custom' && (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                        <strong>Selected:</strong> {bookingData.address}
                      </div>
                    )}
                  </div>
                ) : user?.address && user.address.street ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        id="savedAddress"
                        name="addressType"
                        checked={!showCustomAddress}
                        onChange={() => {
                          setShowCustomAddress(false)
                          const addr = user.address
                          const fullAddress = `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}`
                          setBookingData({ ...bookingData, address: fullAddress })
                        }}
                      />
                      <label htmlFor="savedAddress" className="text-sm">
                        Use saved address: {user.address.street}, {user.address.city}
                      </label>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        id="customAddress"
                        name="addressType"
                        checked={showCustomAddress}
                        onChange={() => {
                          setShowCustomAddress(true)
                          setBookingData({ ...bookingData, address: '' })
                        }}
                      />
                      <label htmlFor="customAddress" className="text-sm">Enter a different address</label>
                    </div>
                    
                    {showCustomAddress && (
                      <textarea
                        required
                        rows="3"
                        value={bookingData.address}
                        onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                        placeholder="Enter your complete address where service is needed"
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <textarea
                      required
                      rows="3"
                      value={bookingData.address}
                      onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                      placeholder="Enter your complete address where service is needed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <a href="/dashboard/customer/profile" className="text-primary-600 hover:underline">
                        Add saved addresses
                      </a> to your profile for faster booking
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-comment-dots mr-2 text-primary-600"></i>
                  Additional Requirements (Optional)
                </label>
                <textarea
                  rows="3"
                  value={bookingData.description}
                  onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                  placeholder="Any specific requirements or details we should know?"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <i className="fas fa-paper-plane"></i>
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceDetails
