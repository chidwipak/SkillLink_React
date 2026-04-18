import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { clearNotifications } from '../../store/slices/notificationSlice'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import ImageWithFallback from './ImageWithFallback'

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  // Get profile URL based on user role
  const getProfileUrl = () => {
    if (!user?.role) return '/profile'
    return `/dashboard/${user.role}/profile`
  }

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          const cart = JSON.parse(savedCart)
          const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
          setCartCount(count)
        } else {
          setCartCount(0)
        }
      } catch (e) {
        setCartCount(0)
      }
    }
    
    updateCartCount()
    
    // Listen for storage changes
    window.addEventListener('storage', updateCartCount)
    // Listen for custom cart update event
    window.addEventListener('cartUpdated', updateCartCount)
    
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const handleLogout = () => {
    dispatch(clearNotifications())
    dispatch(logout())
    toast.success('Logged out successfully')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header 
      className={`sk-header fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'scrolled py-2' 
          : 'bg-white/80 backdrop-blur-xl py-3'
      }`}
      style={{
        borderBottom: isScrolled ? '1px solid rgba(226, 232, 240, 0.6)' : '1px solid transparent'
      }}
    >
      <nav className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between">
          {/* Logo with hover animation */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/25 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:shadow-indigo-500/30">
              <i className="fas fa-link"></i>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] group-hover:animate-[gradientText_3s_ease_infinite]">Skill</span>
              <span className="text-gray-900">Link</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {(!isAuthenticated || user?.role !== 'worker') && (
              <>
                <NavLink to="/services" isActive={isActive('/services')}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Services
                </NavLink>
                <NavLink to="/shop" isActive={isActive('/shop')}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  Shop
                </NavLink>
              </>
            )}

            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" isActive={isActive('/dashboard')}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                  Dashboard
                </NavLink>

                {/* Cart Button for Customers */}
                {user?.role === 'customer' && (
                  <button
                    onClick={() => navigate('/shop?showCart=true')}
                    className="relative p-2.5 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 mx-1 group"
                    title="View Cart"
                  >
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg shadow-green-500/30 animate-[bounce_2s_ease-in-out_infinite]">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </button>
                )}

                {user?.role !== 'delivery' && (
                  <Link 
                    to="/notifications" 
                    className="relative p-2.5 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 mx-1 group"
                  >
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg shadow-red-500/30">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200/70">
                  {user?.role !== 'delivery' ? (
                    <Link 
                      to={getProfileUrl()} 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 group"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-2 ring-white shadow-md group-hover:shadow-lg group-hover:ring-indigo-100 transition-all duration-300">
                        {user?.profilePicture ? (
                          <ImageWithFallback
                            src={user.profilePicture}
                            alt={user.name}
                            type="user"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-indigo-600 text-sm font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="hidden xl:block">
                        <span className="font-semibold text-sm text-gray-800 block leading-tight">{user?.name?.split(' ')[0]}</span>
                        <span className="text-[10px] text-gray-400 capitalize leading-tight">{user?.role}</span>
                      </div>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2.5 px-3 py-2 text-gray-700">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center ring-2 ring-white shadow-md">
                        {user?.profilePicture ? (
                          <ImageWithFallback
                            src={user.profilePicture}
                            alt={user.name}
                            type="user"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-green-600 text-sm font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-sm hidden xl:block">{user?.name?.split(' ')[0]}</span>
                    </span>
                  )}

                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50/80 font-medium text-sm transition-all duration-300 group"
                  >
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden xl:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link 
                  to="/login" 
                  className="px-5 py-2.5 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/60 font-semibold text-sm transition-all duration-300"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu - Enhanced */}
        <div className={`lg:hidden transition-all duration-400 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="rounded-2xl bg-white/95 backdrop-blur-lg border border-gray-200/60 p-4 space-y-1 shadow-xl shadow-gray-200/50">
            {(!isAuthenticated || user?.role !== 'worker') && (
              <>
                <MobileNavLink to="/services">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Services
                </MobileNavLink>
                <MobileNavLink to="/shop">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  Shop
                </MobileNavLink>
              </>
            )}

            {isAuthenticated ? (
              <>
                <MobileNavLink to="/dashboard">
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                  Dashboard
                </MobileNavLink>
                {user?.role === 'customer' && (
                  <MobileNavLink to="/shop?showCart=true">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Cart {cartCount > 0 && <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}
                  </MobileNavLink>
                )}
                {user?.role !== 'delivery' && (
                  <>
                    <MobileNavLink to="/notifications">
                      <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      Notifications {unreadCount > 0 && <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
                    </MobileNavLink>
                    <MobileNavLink to={getProfileUrl()}>
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profile
                    </MobileNavLink>
                  </>
                )}
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                <MobileNavLink to="/login">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                  Log in
                </MobileNavLink>
                <Link 
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 mt-2"
                >
                  Get Started
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

const NavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={`sk-nav-link flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
      isActive
        ? 'active bg-indigo-50/80 text-indigo-700'
        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
    }`}
  >
    {children}
  </Link>
)

const MobileNavLink = ({ to, children }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-gray-700 hover:bg-indigo-50/60 hover:text-indigo-600 transition-all duration-200"
  >
    {children}
  </Link>
)

export default Header
