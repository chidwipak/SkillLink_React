import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ImageWithFallback from '../components/common/ImageWithFallback'

const Home = () => {
  const [isVisible, setIsVisible] = useState({})
  
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
      color: 'bg-amber-100 text-amber-600',
      desc: 'Expert electrical solutions for your home & office',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop&q=80',
    },
    { 
      name: 'Plumber', 
      icon: '🔧', 
      color: 'bg-blue-100 text-blue-600',
      desc: 'Professional plumbing services 24/7',
      image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop&q=80',
    },
    { 
      name: 'Carpenter', 
      icon: '🪚', 
      color: 'bg-orange-100 text-orange-600',
      desc: 'Quality woodwork & furniture solutions',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop&q=80',
    },
  ]

  const features = [
    { icon: '🔒', title: 'Verified Professionals', desc: 'All workers are background verified' },
    { icon: '⭐', title: 'Quality Assured', desc: 'Top-rated services guaranteed' },
    { icon: '💰', title: 'Best Prices', desc: 'Competitive & transparent pricing' },
    { icon: '🕐', title: '24/7 Support', desc: 'Round the clock assistance' },
  ]

  const steps = [
    { num: '1', title: 'Browse Services', desc: 'Find the perfect service', icon: '🔍' },
    { num: '2', title: 'Choose Expert', desc: 'Select verified pros', icon: '👤' },
    { num: '3', title: 'Book & Schedule', desc: 'Pick your time slot', icon: '📅' },
    { num: '4', title: 'Get It Done', desc: 'Enjoy quality service', icon: '✅' },
  ]

  const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '5K+', label: 'Expert Workers' },
    { number: '100+', label: 'Cities Covered' },
    { number: '4.8', label: 'Average Rating' },
  ]

  const categories = [
    { name: 'Electrical', icon: '⚡', color: 'bg-amber-50' },
    { name: 'Plumbing', icon: '🔧', color: 'bg-blue-50' },
    { name: 'Carpentry', icon: '🪚', color: 'bg-orange-50' },
    { name: 'Cleaning', icon: '🧹', color: 'bg-green-50' },
    { name: 'Painting', icon: '🎨', color: 'bg-pink-50' },
    { name: 'AC Repair', icon: '❄️', color: 'bg-cyan-50' },
    { name: 'Appliances', icon: '📱', color: 'bg-purple-50' },
    { name: 'Pest Control', icon: '🐛', color: 'bg-red-50' },
  ]

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section - Light Theme */}
      <section className="hero-light min-h-[90vh] flex items-center relative pt-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="animate-fade-in-down">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                  #1 Home Services Platform
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in leading-tight">
                Professional Home
                <span className="block text-primary-600 mt-2">Services Made Easy</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in max-w-xl">
                Connect with verified professionals for all your home service needs. 
                Quality work, transparent pricing, hassle-free booking.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up">
                <Link 
                  to="/services" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="mr-2">🔧</span>
                  Book a Service
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                
                <Link 
                  to="/shop" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-primary-300 hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="mr-2">🛒</span>
                  Shop Supplies
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 animate-fade-in">
                <div className="flex items-center text-gray-500">
                  <div className="flex -space-x-2 mr-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${
                        ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'][i-1]
                      }`}></div>
                    ))}
                  </div>
                  <span className="text-sm font-medium">50K+ Customers</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="text-sm font-medium">4.8/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Content - Professional Hero Image */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="relative w-full max-w-lg">
                {/* Main Card with Hero Image */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="relative">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop&q=80"
                      alt="Professional Home Services"
                      type="hero"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-1">Home Services</h3>
                      <p className="text-sm text-gray-200">Expert professionals at your doorstep</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-gray-500 text-sm">500+ Services Available</span>
                    <span className="text-yellow-500 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      4.9
                    </span>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 px-4 py-3 rounded-xl bg-white shadow-lg border border-gray-100 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">Verified Pro</p>
                      <p className="text-gray-400 text-xs">Just booked</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 px-4 py-3 rounded-xl bg-white shadow-lg border border-gray-100 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=40&h=40&fit=crop&q=80"
                        alt="Worker"
                        type="worker"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">5.0 Rating</p>
                      <p className="text-gray-400 text-xs">100+ reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Popular Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What do you need?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse through our wide range of services and find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/services?category=${category.name.toLowerCase()}`}
                className="category-card group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`icon ${category.color}`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="name group-hover:text-primary-600 transition-colors">{category.name}</h3>
                <p className="count">50+ Services</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Expert solutions for all your home service needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Link
                key={service.name}
                to={`/services?category=${service.name.toLowerCase()}`}
                className="service-card-light group animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="image-wrapper relative overflow-hidden h-48">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.name}
                    type={service.name.toLowerCase()}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className={`absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 ${service.color} rounded-full text-sm font-medium backdrop-blur-sm`}>
                    {service.icon} {service.name}
                  </div>
                </div>
                <div className="content">
                  <h3 className="title">{service.name} Services</h3>
                  <p className="description">{service.desc}</p>
                  <div className="mt-4 flex items-center text-primary-600 font-medium group-hover:gap-2 transition-all">
                    Book Now
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/services" 
              className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300"
            >
              View All Services
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.num}
                className="step-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="step-number">{step.num}</div>
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="title">{step.title}</h3>
                <p className="description">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                The SkillLink Advantage
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're committed to providing you with the best home service experience. Here's what sets us apart.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className="p-5 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-3xl block mb-3">{feature.icon}</span>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-500 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop&q=80"
                    alt="Professional Services"
                    type="service"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Floating Stats */}
                <div className="absolute -top-4 -right-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                  <p className="text-2xl font-bold text-gray-900">5000+</p>
                  <p className="text-sm text-gray-500">Verified Pros</p>
                </div>

                <div className="absolute -bottom-4 -left-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                  <p className="text-2xl font-bold text-gray-900">4.8/5</p>
                  <p className="text-sm text-gray-500">Customer Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Home?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of happy customers who trust SkillLink for their home service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Get Started Free
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link 
              to="/services" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      {/* Become a Provider Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              For Service Providers
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Grow Your Business With Us
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              Join our network of skilled professionals and connect with customers in your area
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: '💰', title: 'Earn More', desc: 'Set your own rates and grow your income' },
                { icon: '📱', title: 'Easy Management', desc: 'Manage bookings from your phone' },
                { icon: '🚀', title: 'Grow Fast', desc: 'Access thousands of customers' },
              ].map((item, index) => (
                <div 
                  key={item.title}
                  className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-4xl block mb-3">{item.icon}</span>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <Link 
              to="/register" 
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 hover:shadow-lg transition-all duration-300"
            >
              Become a Partner
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
