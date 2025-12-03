import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import ImageWithFallback from '../components/common/ImageWithFallback'

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
      gradient: 'from-blue-600 to-indigo-700',
      accentColor: 'blue'
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
      gradient: 'from-emerald-600 to-teal-700',
      accentColor: 'emerald'
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
      gradient: 'from-violet-600 to-purple-700',
      accentColor: 'violet'
    }
  ]

  // Auto-slide functionality - 2 seconds interval, pauses on hover
  useEffect(() => {
    if (isHovered) return // Pause on hover

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 2000) // 2 seconds per slide

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
    <div className="overflow-hidden bg-white">
      {/* Hero Section with Auto-Sliding Carousel */}
      <section 
        className="relative min-h-[92vh] flex items-center bg-white overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

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
                    className={`block mt-2 bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}
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
                    className={`group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r ${slide.gradient} text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}
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
                      <div className={`text-2xl font-bold bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>
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
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-tr ${slide.gradient} opacity-10 z-10`}></div>
                    
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
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${slide.gradient} flex items-center justify-center text-white`}>
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

                  {/* Decorative circles */}
                  <div className={`absolute -z-10 -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-r ${slide.gradient} opacity-20 blur-2xl`}></div>
                  <div className={`absolute -z-10 -bottom-8 -left-8 w-40 h-40 rounded-full bg-gradient-to-r ${slide.gradient} opacity-20 blur-3xl`}></div>
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
                  ? 'w-10 bg-gradient-to-r from-gray-700 to-gray-900' 
                  : 'w-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentSlide && (
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 animate-pulse opacity-50"></span>
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
            className="h-full bg-gradient-to-r from-gray-600 to-gray-800 transition-all ease-linear"
            style={{ 
              width: `${((currentSlide + 1) / heroSlides.length) * 100}%`,
              transitionDuration: isHovered ? '0ms' : '6000ms'
            }}
          ></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center group cursor-default"
                id={`stat-${index}`}
                data-animate
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md mb-4 group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white" id="services-section" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Our Services
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional home services tailored to your needs, delivered by verified experts
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, index) => (
              <Link
                key={service.name}
                to="/services"
                className={`group p-6 rounded-2xl border-2 ${service.color} transition-all duration-300 hover:shadow-lg hover:-translate-y-2`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 ${service.iconBg} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-500">{service.desc}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link 
              to="/services" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transform hover:-translate-y-1 transition-all duration-300"
            >
              View All Services
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50" id="how-it-works" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get professional help in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200"></div>
            
            {steps.map((step, index) => (
              <div 
                key={step.num}
                className="relative text-center group"
              >
                {/* Step Number Circle */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6 group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 z-10">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white text-sm font-bold flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features" data-animate>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-violet-50 text-violet-700 rounded-full text-sm font-semibold mb-4">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Trusted by Thousands of Happy Customers
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're committed to providing the best home service experience with our verified professionals and quality assurance.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
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
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-r from-gray-400 to-gray-600"></div>
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

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50" id="testimonials" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-sm font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real experiences from real customers who trust SkillLink
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2"
              >
                {/* Quote Icon */}
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-6 group-hover:bg-gray-200 transition-colors duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                {/* Text */}
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    type="profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers and experience the best home services today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/services" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <span className="mr-2">🔧</span>
              Book a Service
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300"
            >
              <span className="mr-2">🤝</span>
              Join as Partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
