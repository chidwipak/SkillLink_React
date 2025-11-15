import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import ImageWithFallback from './ImageWithFallback'

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)
  const dispatch = useDispatch()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Get profile URL based on user role
  const getProfileUrl = () => {
    if (!user?.role) return '/profile'
    return `/dashboard/${user.role}/profile`
  }

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
    dispatch(logout())
    toast.success('Logged out successfully')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-white/95 backdrop-blur-sm py-3'
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-xl transition-transform duration-300 group-hover:scale-105">
              S
            </div>
            <span className="text-xl font-bold text-gray-900">
              Skill<span className="text-primary-600">Link</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {(!isAuthenticated || user?.role !== 'worker') && (
              <>
                <NavLink to="/services" isActive={isActive('/services')}>
                  Services
                </NavLink>
                <NavLink to="/shop" isActive={isActive('/shop')}>
                  Shop
                </NavLink>
              </>
            )}

            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" isActive={isActive('/dashboard')}>
                  Dashboard
                </NavLink>

                {user?.role !== 'delivery' && (
                  <Link 
                    to="/notifications" 
                    className="relative p-2.5 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-all duration-200 mx-1"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  {user?.role !== 'delivery' ? (
                    <Link 
                      to={getProfileUrl()} 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                        {user?.profilePicture ? (
                          <ImageWithFallback
                            src={user.profilePicture}
                            alt={user.name}
                            type="user"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-600 text-sm font-semibold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-sm">{user?.name?.split(' ')[0]}</span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 px-3 py-2 text-gray-700">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
                        {user?.profilePicture ? (
                          <ImageWithFallback
                            src={user.profilePicture}
                            alt={user.name}
                            type="user"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-green-600 text-sm font-semibold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-sm">{user?.name?.split(' ')[0]}</span>
                    </span>
                  )}

                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium text-sm transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-100 font-medium text-sm transition-all duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="rounded-xl bg-gray-50 p-4 space-y-1">
            {(!isAuthenticated || user?.role !== 'worker') && (
              <>
                <MobileNavLink to="/services">Services</MobileNavLink>
                <MobileNavLink to="/shop">Shop</MobileNavLink>
              </>
            )}

            {isAuthenticated ? (
              <>
                <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
                {user?.role !== 'delivery' && (
                  <>
                    <MobileNavLink to="/notifications">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </MobileNavLink>
                    <MobileNavLink to={getProfileUrl()}>Profile</MobileNavLink>
                  </>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login">Login</MobileNavLink>
                <Link 
                  to="/register"
                  className="block w-full text-center px-4 py-3 rounded-lg font-semibold bg-primary-600 text-white mt-2"
                >
                  Get Started
                </Link>
              </>
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
    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
      isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </Link>
)

const MobileNavLink = ({ to, children }) => (
  <Link
    to={to}
    className="block px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-white hover:text-primary-600 transition-all duration-200"
  >
    {children}
  </Link>
)

export default Header
