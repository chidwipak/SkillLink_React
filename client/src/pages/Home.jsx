import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import ImageWithFallback from '../components/common/ImageWithFallback'
import '../styles/modern.css'

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState({})

  // Hero Slides Data
  const heroSlides = [
    {
      id: 1,
      title: 'Professional Home',
      highlight: 'Services On Demand',
      description: 'Connect with verified electricians, plumbers, carpenters, and more. Quality work guaranteed with transparent pricing.',
      buttonText: 'Book a Service',
      buttonLink: '/services',
      buttonIcon: '🔧',
      secondaryButton: 'Explore Services',
      secondaryLink: '/services',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop&q=80',
      stats: [
        { value: '5000+', label: 'Experts' },
        { value: '4.9', label: 'Rating' },
        { value: '24/7', label: 'Support' }
      ],
      accentColor: '#6366f1'
    },
    {
      id: 2,
      title: 'Quality Supplies',
      highlight: 'Delivered To Your Door',
      description: 'Shop premium electrical, plumbing, and carpentry supplies from verified sellers. Best prices, fast delivery.',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      buttonIcon: '🛒',
      secondaryButton: 'View Categories',
      secondaryLink: '/shop',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80',
      stats: [
        { value: '10K+', label: 'Products' },
        { value: '500+', label: 'Sellers' },
        { value: 'Free', label: 'Shipping' }
      ],
      accentColor: '#10b981'
    },
    {
      id: 3,
      title: 'Partner With Us',
      highlight: 'Grow Your Business',
      description: 'Join as a worker, seller, or delivery partner. Reach thousands of customers and earn on your own schedule.',
      buttonText: 'Join Now',
      buttonLink: '/register',
      buttonIcon: '🤝',
      secondaryButton: 'Learn More',
      secondaryLink: '/register',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop&q=80',
      stats: [
        { value: '₹50K+', label: 'Avg. Earnings' },
        { value: '100+', label: 'Cities' },
        { value: 'Flexible', label: 'Hours' }
      ],
      accentColor: '#8b5cf6'
    }
  ]

  // Auto-slide functionality - 5 seconds interval, pauses on hover
  useEffect(() => {
    if (isHovered) return // Pause on hover

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000) // 5 seconds per slide for readability

    return () => clearInterval(interval)
  }, [isHovered, heroSlides.length])

  // Handle slide navigation
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }, [heroSlides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [heroSlides.length])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const services = [
    { 
      name: 'Electrician', 
      icon: '⚡', 
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
      iconBg: 'bg-amber-100',
      desc: 'Expert electrical solutions',
    },
    { 
      name: 'Plumber', 
      icon: '🔧', 
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconBg: 'bg-blue-100',
      desc: 'Professional plumbing services',
    },
    { 
      name: 'Carpenter', 
      icon: '🪚', 
      color: 'bg-stone-50 hover:bg-stone-100 border-stone-200',
      iconBg: 'bg-stone-100',
      desc: 'Quality woodwork solutions',
    },
    { 
      name: 'Cleaning', 
      icon: '🧹', 
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconBg: 'bg-green-100',
      desc: 'Spotless cleaning services',
    },
    { 
      name: 'Painting', 
      icon: '🎨', 
      color: 'bg-rose-50 hover:bg-rose-100 border-rose-200',
      iconBg: 'bg-rose-100',
      desc: 'Beautiful paint finishes',
    },
    { 
      name: 'AC Repair', 
      icon: '❄️', 
      color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200',
      iconBg: 'bg-cyan-100',
      desc: 'Expert AC maintenance',
    },
  ]

  const features = [
    { 
      icon: '✓', 
      title: 'Verified Professionals', 
      desc: 'All workers undergo thorough background verification',
      iconBg: 'bg-green-100 text-green-600'
    },
    { 
      icon: '⭐', 
      title: 'Quality Assured', 
      desc: 'Rated services with satisfaction guarantee',
      iconBg: 'bg-yellow-100 text-yellow-600'
    },
    { 
      icon: '💰', 
      title: 'Transparent Pricing', 
      desc: 'No hidden charges, upfront cost estimates',
      iconBg: 'bg-blue-100 text-blue-600'
    },
    { 
      icon: '🕐', 
      title: '24/7 Support', 
      desc: 'Round the clock customer assistance',
      iconBg: 'bg-purple-100 text-purple-600'
    },
  ]

  const steps = [
    { num: '01', title: 'Browse Services', desc: 'Explore our wide range of professional services', icon: '🔍' },
    { num: '02', title: 'Choose Expert', desc: 'Select from verified and rated professionals', icon: '👤' },
    { num: '03', title: 'Book & Schedule', desc: 'Pick your convenient date and time slot', icon: '📅' },
    { num: '04', title: 'Get It Done', desc: 'Relax while experts handle your work', icon: '✅' },
  ]

  const stats = [
    { number: '50K+', label: 'Happy Customers', icon: '😊' },
    { number: '5K+', label: 'Expert Workers', icon: '👷' },
    { number: '100+', label: 'Cities Covered', icon: '🏙️' },
    { number: '4.8', label: 'Average Rating', icon: '⭐' },
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Homeowner',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80',
      text: 'Excellent service! The electrician was professional and fixed our issues quickly. Highly recommend SkillLink.',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'Business Owner',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
      text: 'Been using SkillLink for our office maintenance. Great quality work and transparent pricing every time.',
      rating: 5
    },
    {
      name: 'Anita Desai',
      role: 'Interior Designer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80',
      text: 'The carpenters I hired through SkillLink were skilled and punctual. Perfect for my client projects.',
      rating: 5
    },
  ]

  return (
    <div className="overflow-hidden bg-gradient-to-br from-white via-slate-50 to-indigo-50/30">
      {/* Floating Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="floating-particle floating-particle-1"></div>
        <div className="floating-particle floating-particle-2"></div>
        <div className="floating-particle floating-particle-3"></div>
      </div>

      {/* Hero Section with Auto-Sliding Carousel */}
      <section 
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #eef2ff 100%)'}}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/40 to-purple-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-pink-100/30 to-blue-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        {/* Slides Container */}
        <div className="container mx-auto px-4 relative z-10">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center transition-all duration-700 ease-in-out ${
                index === currentSlide 
                  ? 'opacity-100 translate-x-0 relative' 
                  : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'
              }`}
            >
              {/* Left Content */}
              <div className="text-center lg:text-left pt-20 lg:pt-0">
                {/* Badge */}
                <div 
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 transition-all duration-500 delay-100 bg-slate-100 text-slate-700 ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse bg-slate-500"></span>
                  {index === 0 ? '#1 Home Services Platform' : index === 1 ? 'Premium Quality Products' : 'Earn With SkillLink'}
                </div>
                
                {/* Title with Animation */}
                <h1 
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight transition-all duration-700 delay-200 ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  {slide.title}
                  <span 
                    className="block mt-2 text-gray-900"
                    style={{ color: slide.accentColor }}
                  >
                    {slide.highlight}
                  </span>
                </h1>
                
                {/* Description */}
                <p 
                  className={`text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 transition-all duration-700 delay-300 ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  {slide.description}
                </p>
                
                {/* CTA Buttons */}
                <div 
                  className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-700 delay-400 ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  <Link 
                    to={slide.buttonLink}
                    className="group inline-flex items-center justify-center px-8 py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    style={{ backgroundColor: slide.accentColor }}
                  >
                    <span className="mr-2">{slide.buttonIcon}</span>
                    {slide.buttonText}
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  
                  <Link 
                    to={slide.secondaryLink}
                    className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    {slide.secondaryButton}
                  </Link>
                </div>

                {/* Mini Stats */}
                <div 
                  className={`mt-10 flex items-center justify-center lg:justify-start gap-8 transition-all duration-700 delay-500 ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  {slide.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-2xl font-bold text-gray-900" style={{ color: slide.accentColor }}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content - Image with Effects */}
              <div 
                className={`hidden lg:flex justify-center items-center transition-all duration-700 delay-300 ${
                  index === currentSlide ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95'
                }`}
              >
                <div className="relative w-full max-w-lg">
                  {/* Main Image Container */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                    <ImageWithFallback
                      src={slide.image}
                      alt={slide.title}
                      type="hero"
                      className="w-full h-[400px] object-cover"
                    />
                    
                    {/* Bottom Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 z-20">
                      <div className="text-white">
                        <h3 className="text-xl font-bold mb-1">{slide.title}</h3>
                        <p className="text-sm text-gray-200">{slide.highlight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className={`absolute -top-4 -left-4 px-4 py-3 rounded-xl bg-white shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300 ${
                    index === currentSlide ? 'animate-float' : ''
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: slide.accentColor }}>
                        ✓
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm font-medium">Verified</p>
                        <p className="text-gray-400 text-xs">Trusted Platform</p>
                      </div>
                    </div>
                  </div>

                  <div className={`absolute -bottom-4 -right-4 px-4 py-3 rounded-xl bg-white shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300 ${
                    index === currentSlide ? 'animate-float-delayed' : ''
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">⭐</div>
                      <div>
                        <p className="text-gray-900 text-sm font-medium">4.9 Rating</p>
                        <p className="text-gray-400 text-xs">50K+ Reviews</p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative circles - removed gradient */}
                  <div className="absolute -z-10 -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: slide.accentColor }}></div>
                  <div className="absolute -z-10 -bottom-8 -left-8 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: slide.accentColor }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative h-3 rounded-full transition-all duration-500 ${
                index === currentSlide 
                  ? 'w-10 bg-gray-700' 
                  : 'w-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentSlide && (
                <span className="absolute inset-0 rounded-full bg-gray-700 animate-pulse opacity-50"></span>
              )}
            </button>
          ))}
        </div>

        {/* Arrow Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-300 z-20 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-300 z-20 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div 
            className="h-full bg-gray-700 transition-all ease-linear"
            style={{ 
              width: `${((currentSlide + 1) / heroSlides.length) * 100}%`,
              transitionDuration: isHovered ? '0ms' : '6000ms'
            }}
          ></div>
        </div>
      </section>

      {/* Stats Section - Enhanced */}
      <section className="py-20 relative overflow-hidden" style={{background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)'}}>
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center group cursor-default"
                id={`stat-${index}`}
                data-animate
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-lg mb-4 group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 border border-indigo-100/50">
                  <span className="text-3xl">{stat.icon}</span>
                </div>
                <div className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Enhanced */}
      <section className="py-24 bg-white relative overflow-hidden" id="services-section" data-animate>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-indigo-50 to-transparent rounded-full blur-2xl opacity-70"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm font-semibold mb-4 border border-indigo-100">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              What We <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Offer</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional home services tailored to your needs, delivered by verified experts
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {services.map((service, index) => (
              <Link
                key={service.name}
                to="/services"
                className={`group p-6 rounded-2xl border-2 ${service.color} transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-indigo-200 relative overflow-hidden`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className={`w-16 h-16 ${service.iconBg} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg relative z-10`}>
                  {service.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 relative z-10">{service.name}</h3>
                <p className="text-sm text-gray-500 relative z-10">{service.desc}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/services" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transform hover:-translate-y-1 transition-all duration-300"
            >
              View All Services
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced */}
      <section className="py-24 relative overflow-hidden" id="how-it-works" data-animate style={{background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 50%, #faf5ff 100%)'}}>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-full text-sm font-semibold mb-4 border border-emerald-100">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              How It <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get professional help in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Line - Gradient */}
            <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-full"></div>
            
            {steps.map((step, index) => (
              <div 
                key={step.num}
                className="relative text-center group"
              >
                {/* Step Number Circle - Enhanced */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-xl mb-6 group-hover:shadow-2xl group-hover:-translate-y-3 transition-all duration-500 z-10 border-2 border-indigo-100">
                  <span className="text-4xl">{step.icon}</span>
                  <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                    {step.num}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-24 bg-white relative overflow-hidden" id="features" data-animate>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-violet-50 to-transparent rounded-full blur-3xl opacity-70"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 rounded-full text-sm font-semibold mb-4 border border-violet-100">
                <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
                Why Choose Us
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                Trusted by <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Thousands</span> of Happy Customers
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're committed to providing the best home service experience with our verified professionals and quality assurance.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className="group flex items-start gap-4 p-5 rounded-2xl hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 border border-transparent hover:border-indigo-100 hover:shadow-lg"
                  >
                    <div className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=500&fit=crop&q=80"
                  alt="Professional team"
                  type="hero"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs animate-float">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-400"></div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">5000+</span>
                    <span className="text-gray-500"> Experts</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-700">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced */}
      <section className="py-24 relative overflow-hidden" id="testimonials" data-animate style={{background: 'linear-gradient(180deg, #f8fafc 0%, #faf5ff 50%, #f8fafc 100%)'}}>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 rounded-full text-sm font-semibold mb-4 border border-rose-100">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              What Our Customers <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Say</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real experiences from real customers who trust SkillLink
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-100 shadow-sm hover:shadow-xl transition-all duration-500 group hover:-translate-y-3 relative overflow-hidden"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Quote Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-indigo-100">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                {/* Text */}
                <p className="text-gray-600 mb-8 leading-relaxed relative z-10">"{testimonial.text}"</p>
                
                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <div className="relative">
                    <ImageWithFallback
                      src={testimonial.image}
                      alt={testimonial.name}
                      type="profile"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section className="py-24 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'}}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-indigo-300 font-medium mb-8 border border-white/10">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
            Join 50,000+ happy users
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Ready to Get <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Started?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied customers and experience the best home services today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/services" 
              className="group inline-flex items-center justify-center px-8 py-4.5 bg-white text-gray-900 rounded-2xl font-bold text-lg hover:bg-gray-50 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300"
            >
              <span className="mr-3 text-xl">🔧</span>
              Book a Service
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link 
              to="/register" 
              className="group inline-flex items-center justify-center px-8 py-4.5 bg-transparent border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/10 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300"
            >
              <span className="mr-3 text-xl">🤝</span>
              Join as Partner
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span className="text-sm font-medium text-gray-400">Verified Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span className="text-sm font-medium text-gray-400">Transparent Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span className="text-sm font-medium text-gray-400">Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

