import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../services/api'
import { useCelebration } from '../contexts/CelebrationContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ImageWithFallback from '../components/common/ImageWithFallback'
import toast from 'react-hot-toast'
import '../styles/modern.css'

const ServiceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { celebrate } = useCelebration()
  const [service, setService] = useState(null)
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
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
  const [filterDate, setFilterDate] = useState('')

  // Check if worker is available on a specific day
  const isWorkerAvailableOnDate = (worker, dateStr) => {
    if (!dateStr || !worker.availability) return true // Show all if no date filtered
    const date = new Date(dateStr)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = days[date.getDay()]
    const daySchedule = worker.availability[dayName]
    if (!daySchedule) return worker.isAvailable
    return daySchedule.isAvailable !== false
  }

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

    // Check worker availability
    if (!worker.isAvailable) {
      toast.error('This worker is currently unavailable. Please choose another worker.')
      return
    }

    setSelectedWorker(worker)
    // Reset booking data when opening modal
    setBookingData({
      date: '',
      time: '',
      address: '',
      description: ''
    })
    setSelectedAddressIndex('')
    setShowCustomAddress(false)
    setShowBookingModal(true)
  }

  const handleSendToAll = () => {
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

    // Filter only available workers
    const availableWorkers = workers.filter(w => w.isAvailable)
    
    if (availableWorkers.length === 0) {
      toast.error('No workers are currently available for this service')
      return
    }

    // Reset booking data when opening modal
    setBookingData({
      date: '',
      time: '',
      address: '',
      description: ''
    })
    setSelectedAddressIndex('')
    setShowCustomAddress(false)
    setShowBroadcastModal(true)
  }

  const handleBroadcastBooking = async (e) => {
    e.preventDefault()

    // Validate all required fields
    if (!bookingData.date) {
      toast.error('Please select a date')
      return
    }
    if (!bookingData.time) {
      toast.error('Please select a time')
      return
    }
    
    // Get address - handle saved address selection
    let finalAddress = bookingData.address
    if (!showCustomAddress && selectedAddressIndex !== '' && selectedAddressIndex !== 'custom') {
      // Use saved address
      if (user?.addresses && user.addresses[parseInt(selectedAddressIndex)]) {
        const addr = user.addresses[parseInt(selectedAddressIndex)]
        finalAddress = `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}`
      } else if (user?.address && user.address.street) {
        const addr = user.address
        finalAddress = `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}`
      }
    }
    
    if (!finalAddress || finalAddress.trim() === '') {
      toast.error('Please select or enter a service address')
      return
    }

    // Only send to available workers
    const availableWorkers = workers.filter(w => w.isAvailable)
    const workerIds = availableWorkers.map(w => w._id)

    const bookingPayload = {
      service: id,
      workers: workerIds,
      date: bookingData.date,
      time: bookingData.time,
      address: finalAddress.trim(),
      description: bookingData.description || ''
    }

    try {
      const response = await api.post('/bookings/broadcast', bookingPayload)
      console.log('Broadcast booking response:', response.data)
      toast.success(`Booking request sent to ${workerIds.length} workers!`)
      celebrate({ count: 180 })
      setShowBroadcastModal(false)
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
      console.error('Broadcast booking error:', error)
      const message = error.response?.data?.message || 'Failed to send broadcast booking'
      toast.error(message)
    }
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
    
    // Get address - handle saved address selection
    let finalAddress = bookingData.address
    if (!showCustomAddress && selectedAddressIndex !== '' && selectedAddressIndex !== 'custom') {
      // Use saved address from dropdown
      if (user?.addresses && user.addresses[parseInt(selectedAddressIndex)]) {
        const addr = user.addresses[parseInt(selectedAddressIndex)]
        finalAddress = `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}`
      }
    } else if (!showCustomAddress && user?.address && user.address.street && !bookingData.address) {
      // Use default saved address (radio button scenario)
      const addr = user.address
      finalAddress = `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}`
    }
    
    if (!finalAddress || finalAddress.trim() === '') {
      toast.error('Please select or enter a service address')
      return
    }

    const bookingPayload = {
      service: id,
      worker: selectedWorker._id,
      date: bookingData.date,
      time: bookingData.time,
      address: finalAddress.trim(),
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
      celebrate({ count: 180 })
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
      <div className="min-h-screen flex items-center justify-center page-enter" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)' }}>
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{error || 'Service not found'}</h2>
          <p className="text-gray-500 mb-8">The service you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/services')} 
            className="sk-btn sk-btn-primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Services
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen page-enter" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)' }}>
      {/* Hero Section with Service Details */}
      <div className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 50%, #7c3aed 100%)' }}>
        {/* Decorative Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -50%)' }}></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(-30%, 50%)' }}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10" style={{ paddingTop: '6rem' }}>
          <button 
            onClick={() => navigate('/services')} 
            className="mb-6 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="font-medium">Back to Services</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pb-4">
            {/* Service Image */}
            <div className="relative fade-in-up visible">
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-white ring-4 ring-white/20" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                <ImageWithFallback
                  src={service?.image}
                  alt={String(service?.name || 'Service')}
                  type={service?.category || 'service'}
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-6 right-6">
                <div className="bg-white rounded-xl shadow-xl p-4 flex items-center justify-between backdrop-blur-sm border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Starting from</p>
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₹{typeof service?.price === 'number' ? service.price : Number(service?.price) || 0}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-4 py-2 rounded-lg font-bold text-xs text-white uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {String(service?.category || '').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="lg:pl-8 mt-10 lg:mt-0 fade-in-up visible" style={{ transitionDelay: '100ms' }}>
              <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">{String(service?.name || 'Service')}</h1>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">{String(service?.description || '')}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider">Duration</p>
                      <p className="font-bold text-lg">{service?.duration || 60} mins</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider">Workers</p>
                      <p className="font-bold text-lg">{workers.length} Available</p>
                    </div>
                  </div>
                </div>
              </div>

              <a 
                href="#workers" 
                className="inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl group"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>Book Workers</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Section */}
      <div id="workers" className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Verified Professionals
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Available Workers</h2>
          <p className="text-lg text-gray-500 mb-6 max-w-lg mx-auto">Choose from our verified and experienced professionals</p>
          
          {/* Date-based availability filter */}
          <div className="inline-flex items-center gap-3 bg-white rounded-xl shadow-md px-5 py-3 mb-6 border border-gray-100">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <label className="text-sm font-bold text-gray-600">Filter by date:</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Clear filter"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          
          {workers.length > 0 && isAuthenticated && user?.role === 'customer' && (
            <div className="mt-3">
              {workers.filter(w => w.isAvailable).length > 0 ? (
                <button
                  onClick={handleSendToAll}
                  className="inline-flex items-center gap-3 text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  <span>Send Request to All Available Workers ({workers.filter(w => w.isAvailable).length})</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-500 px-6 py-3 rounded-xl font-semibold cursor-not-allowed">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>No Workers Available Currently</span>
                </div>
              )}
              {workers.filter(w => !w.isAvailable).length > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  {workers.filter(w => !w.isAvailable).length} worker(s) currently unavailable
                </p>
              )}
            </div>
          )}
        </div>

        {workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {[...workers]
              .sort((a, b) => {
                const aAvail = isWorkerAvailableOnDate(a, filterDate) && a.isAvailable
                const bAvail = isWorkerAvailableOnDate(b, filterDate) && b.isAvailable
                if (aAvail && !bAvail) return -1
                if (!aAvail && bAvail) return 1
                return 0
              })
              .map((worker, index) => {
              const availableOnDate = isWorkerAvailableOnDate(worker, filterDate)
              return (
              <div
                key={worker._id}
                className={`fade-in-up visible bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100 ${!availableOnDate && filterDate ? 'opacity-50 grayscale' : ''}`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                {/* Worker Profile Picture */}
                <div className="relative h-60 overflow-hidden" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <ImageWithFallback
                    src={worker.user?.profilePicture}
                    alt={String(worker.user?.name || 'Worker')}
                    type="worker"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  {worker.isAvailable && availableOnDate ? (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Available
                    </div>
                  ) : !availableOnDate && filterDate ? (
                    <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      Not on this day
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      Busy
                    </div>
                  )}
                </div>

                {/* Worker Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {String(worker.user?.name || worker.name || 'Worker')}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(worker.rating || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                          fill="currentColor" viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-700 font-bold text-sm">
                      {typeof worker.rating === 'number' ? worker.rating.toFixed(1) : '5.0'}
                    </span>
                    <span className="text-gray-400 text-xs">
                      ({worker.totalReviews || 0})
                    </span>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <span>{Number(worker.experience) || 0} years experience</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <span className="font-bold text-lg text-gray-900">₹{getWorkerPrice(worker)}</span>
                    </div>
                    {worker.user?.phone && (
                      <div className="flex items-center gap-3 text-gray-600 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <span>{worker.user.phone}</span>
                      </div>
                    )}
                  </div>

                  {worker.isAvailable ? (
                    <button
                      onClick={() => handleWorkerSelect(worker)}
                      className="w-full text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>Book Now</span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-400 font-semibold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>Currently Unavailable</span>
                    </button>
                  )}
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="sk-empty-state">
            <div className="sk-empty-state-icon">
              <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <p className="sk-empty-state-title">No Workers Available</p>
            <p className="sk-empty-state-desc">There are currently no workers available for this service.</p>
            <button onClick={() => navigate('/services')} className="sk-btn sk-btn-primary mt-4">
              Browse Other Services
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedWorker && (
        <div className="sk-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="sk-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 rounded-t-2xl text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -50%)' }}></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h2 className="text-2xl font-extrabold">Book Service</h2>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              {/* Worker Summary */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-3 ring-white/30 flex-shrink-0">
                    <ImageWithFallback
                      src={selectedWorker.user?.profilePicture}
                      alt={String(selectedWorker.user?.name || 'Worker')}
                      type="worker"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold truncate">{String(selectedWorker.user?.name || selectedWorker.name || 'Worker')}</p>
                    <p className="text-white/70 text-sm">{String(service?.name || 'Service')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 uppercase tracking-wider">Price</p>
                    <p className="text-2xl font-extrabold">₹{getWorkerPrice(selectedWorker)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBooking} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Date */}
              <div>
                <label className="sk-label">
                  <svg className="w-4 h-4 text-indigo-500 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Select Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="sk-input"
                />
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="sk-label">
                  <svg className="w-4 h-4 text-indigo-500 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Select Time Slot *
                </label>
                <div className="time-slot-section">
                  <div className="mb-3">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                      Morning
                    </p>
                    <div className="time-slot-grid">
                      {['09:00 AM', '10:00 AM', '11:00 AM'].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`time-slot-btn ${bookingData.time === slot ? 'selected' : ''}`}
                          onClick={() => setBookingData({ ...bookingData, time: slot })}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z" clipRule="evenodd" /></svg>
                      Afternoon
                    </p>
                    <div className="time-slot-grid">
                      {['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`time-slot-btn ${bookingData.time === slot ? 'selected' : ''}`}
                          onClick={() => setBookingData({ ...bookingData, time: slot })}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                      Evening
                    </p>
                    <div className="time-slot-grid">
                      {['04:00 PM', '05:00 PM', '06:00 PM'].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`time-slot-btn ${bookingData.time === slot ? 'selected' : ''}`}
                          onClick={() => setBookingData({ ...bookingData, time: slot })}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {!bookingData.time && <input type="text" required value="" className="sr-only" tabIndex={-1} onChange={() => {}} />}
              </div>

              {/* Address Selection */}
              <div>
                <label className="sk-label">
                  <svg className="w-4 h-4 text-indigo-500 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Service Address *
                </label>
                
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
                      className="sk-input"
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
                        className="sk-input resize-none"
                        placeholder="Enter your complete address where service is needed"
                      />
                    )}
                    
                    {selectedAddressIndex !== '' && selectedAddressIndex !== 'custom' && (
                      <div className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-700 border border-indigo-100">
                        <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <strong>Selected:</strong> {bookingData.address}
                      </div>
                    )}
                  </div>
                ) : user?.address && user.address.street ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => { setShowCustomAddress(false); const addr = user.address; setBookingData({ ...bookingData, address: `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}` }); }}>
                      <input type="radio" id="savedAddress" name="addressType" checked={!showCustomAddress} readOnly className="text-indigo-600" />
                      <label htmlFor="savedAddress" className="text-sm cursor-pointer flex-1">
                        Use saved: <strong>{user.address.street}, {user.address.city}</strong>
                      </label>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => { setShowCustomAddress(true); setBookingData({ ...bookingData, address: '' }); }}>
                      <input type="radio" id="customAddress" name="addressType" checked={showCustomAddress} readOnly className="text-indigo-600" />
                      <label htmlFor="customAddress" className="text-sm cursor-pointer">Enter a different address</label>
                    </div>
                    
                    {showCustomAddress && (
                      <textarea
                        required
                        rows="3"
                        value={bookingData.address}
                        onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                        className="sk-input resize-none"
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
                      className="sk-input resize-none"
                      placeholder="Enter your complete address where service is needed"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      <a href="/dashboard/customer/profile" className="text-indigo-500 hover:underline font-medium">Add saved addresses</a> to your profile for faster booking
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="sk-label">
                  <svg className="w-4 h-4 text-indigo-500 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                  Additional Requirements (Optional)
                </label>
                <textarea
                  rows="3"
                  value={bookingData.description}
                  onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                  className="sk-input resize-none"
                  placeholder="Any specific requirements or details we should know?"
                />
              </div>

              {/* Booking Summary */}
              <div className="rounded-xl p-5 border border-indigo-100" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)' }}>
                <h4 className="text-sm font-extrabold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Booking Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service</span>
                    <span className="font-semibold text-gray-900">{service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Worker</span>
                    <span className="font-semibold text-gray-900">{selectedWorker?.user?.name || selectedWorker?.name}</span>
                  </div>
                  {bookingData.date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-semibold text-gray-900">{new Date(bookingData.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                  )}
                  {bookingData.time && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-semibold text-indigo-600">{bookingData.time}</span>
                    </div>
                  )}
                  <div className="border-t border-indigo-200 my-2"></div>
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-gray-700">Estimated Price</span>
                    <span className="font-extrabold text-indigo-600 text-lg">₹{getWorkerPrice(selectedWorker)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="sk-btn sk-btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sk-btn sk-btn-primary flex-1 gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Booking Modal */}
      {showBroadcastModal && (
        <div className="sk-modal-overlay" onClick={() => setShowBroadcastModal(false)}>
          <div className="sk-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 rounded-t-2xl text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -50%)' }}></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h2 className="text-2xl font-extrabold">Send to All Workers</h2>
                <button 
                  onClick={() => setShowBroadcastModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              {/* Service & Workers Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold">{service?.name}</h3>
                    <p className="text-white/70 text-sm">Service Request</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold">{workers.filter(w => w.isAvailable).length}</div>
                    <div className="text-sm text-white/70">Available Workers</div>
                  </div>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded-lg">
                  <p className="text-sm font-medium flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Your request will be sent to all {workers.filter(w => w.isAvailable).length} available workers. The first worker to accept will be assigned.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBroadcastBooking} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Date Input */}
              <div>
                <label className="sk-label">
                  <svg className="w-4 h-4 text-emerald-500 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="sk-input"
                />
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="sk-label">
                  <svg className="w-4 h-4 text-emerald-500 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Preferred Time Slot *
                </label>
                <div className="time-slot-section">
                  <div className="mb-3">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                      Morning
                    </p>
                    <div className="time-slot-grid">
                      {['09:00 AM', '10:00 AM', '11:00 AM'].map((slot) => (
                        <button key={slot} type="button" className={`time-slot-btn ${bookingData.time === slot ? 'selected' : ''}`} onClick={() => setBookingData({ ...bookingData, time: slot })}>{slot}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z" clipRule="evenodd" /></svg>
                      Afternoon
                    </p>
                    <div className="time-slot-grid">
                      {['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'].map((slot) => (
                        <button key={slot} type="button" className={`time-slot-btn ${bookingData.time === slot ? 'selected' : ''}`} onClick={() => setBookingData({ ...bookingData, time: slot })}>{slot}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                      Evening
                    </p>
                    <div className="time-slot-grid">
                      {['04:00 PM', '05:00 PM', '06:00 PM'].map((slot) => (
                        <button key={slot} type="button" className={`time-slot-btn ${bookingData.time === slot ? 'selected' : ''}`} onClick={() => setBookingData({ ...bookingData, time: slot })}>{slot}</button>
                      ))}
                    </div>
                  </div>
                </div>
                {!bookingData.time && <input type="text" required value="" className="sr-only" tabIndex={-1} onChange={() => {}} />}
              </div>

              {/* Address Input */}
              <div>
                <label className="sk-label">
                  <svg className="w-4 h-4 text-emerald-500 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Service Address *
                </label>
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
                          setBookingData({ ...bookingData, address: addr })
                        }
                      }}
                      className="sk-input"
                    >
                      <option value="">Select an address</option>
                      {user.addresses.map((addr, idx) => (
                        <option key={idx} value={idx}>{addr}</option>
                      ))}
                      <option value="custom">Enter custom address</option>
                    </select>
                    
                    {showCustomAddress && (
                      <textarea
                        required
                        rows="3"
                        value={bookingData.address}
                        onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                        className="sk-input resize-none"
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
                      className="sk-input resize-none"
                      placeholder="Enter your complete address where service is needed"
                    />
                  </div>
                )}
              </div>

              {/* Notes/Description */}
              <div>
                <label className="sk-label">
                  <svg className="w-4 h-4 text-emerald-500 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  value={bookingData.description}
                  onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                  className="sk-input resize-none"
                  placeholder="Any specific requirements or instructions for the workers..."
                />
              </div>

              {/* Workers List Preview */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  This request will be sent to:
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {workers.filter(w => w.isAvailable).map((worker) => (
                    <div key={worker._id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-100">
                      <img
                        src={worker.user?.profilePicture || '/images/default-profile.png'}
                        alt={worker.user?.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-100"
                        onError={(e) => e.target.src = '/images/default-profile.png'}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{worker.user?.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          {worker.rating?.toFixed(1) || '5.0'}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="sk-btn sk-btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sk-btn sk-btn-success flex-1 gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  Send to All ({workers.filter(w => w.isAvailable).length})
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
