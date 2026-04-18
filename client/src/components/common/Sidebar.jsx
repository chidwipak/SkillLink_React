import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Sidebar = ({ userRole }) => {
  const location = useLocation()
  const { unreadCount } = useSelector((state) => state.notifications)

  const getMenuItems = () => {
    const rolePrefix = `/dashboard/${userRole}`
    
    // Delivery person menu
    if (userRole === 'delivery') {
      return [
        { path: rolePrefix, label: 'Dashboard', icon: '🚚', gradient: 'from-blue-400 to-blue-600' },
        { path: `${rolePrefix}/assignments`, label: 'Assignments', icon: '📋', gradient: 'from-purple-400 to-purple-600' },
        { path: `${rolePrefix}/tracking`, label: 'Tracking', icon: '📍', gradient: 'from-cyan-400 to-cyan-600' },
        { path: `${rolePrefix}/earnings`, label: 'Earnings', icon: '💰', gradient: 'from-green-400 to-green-600' },
        { path: `${rolePrefix}/profile`, label: 'Profile', icon: '👤', gradient: 'from-indigo-400 to-indigo-600' },
        { path: `${rolePrefix}/notifications`, label: 'Notifications', icon: '🔔', gradient: 'from-red-400 to-red-600', badge: unreadCount },
      ]
    }

    const common = [
      { path: rolePrefix, label: 'Dashboard', icon: '📊', gradient: 'from-purple-400 to-purple-600' },
      { path: `${rolePrefix}/profile`, label: 'Profile', icon: '👤', gradient: 'from-indigo-400 to-indigo-600' },
    ]

    const roleMenus = {
      customer: [
        { path: `${rolePrefix}/bookings`, label: 'My Bookings', icon: '📅', gradient: 'from-pink-400 to-pink-600' },
        { path: `${rolePrefix}/orders`, label: 'My Orders', icon: '🛒', gradient: 'from-orange-400 to-orange-600' },
        { path: `${rolePrefix}/notifications`, label: 'Notifications', icon: '🔔', gradient: 'from-red-400 to-red-600', badge: unreadCount },
      ],
      worker: [
        { path: `${rolePrefix}/bookings`, label: 'My Jobs', icon: '📅', gradient: 'from-cyan-400 to-cyan-600' },
        { path: `${rolePrefix}/availability`, label: 'Availability', icon: '⏰', gradient: 'from-teal-400 to-teal-600' },
        { path: `${rolePrefix}/earnings`, label: 'Earnings', icon: '💰', gradient: 'from-green-400 to-green-600' },
        { path: `${rolePrefix}/notifications`, label: 'Notifications', icon: '🔔', gradient: 'from-red-400 to-red-600', badge: unreadCount },
      ],
      seller: [
        { path: `${rolePrefix}/products`, label: 'Products', icon: '📦', gradient: 'from-amber-400 to-amber-600' },
        { path: `${rolePrefix}/orders`, label: 'Orders', icon: '🛒', gradient: 'from-orange-400 to-orange-600' },
        { path: `${rolePrefix}/shop`, label: 'Shop Settings', icon: '⚙️', gradient: 'from-gray-400 to-gray-600' },
        { path: `${rolePrefix}/notifications`, label: 'Notifications', icon: '🔔', gradient: 'from-red-400 to-red-600', badge: unreadCount },
      ],
      admin: [
        { path: `${rolePrefix}/users`, label: 'Users', icon: '👥', gradient: 'from-blue-400 to-blue-600' },
        { path: `${rolePrefix}/services`, label: 'Services', icon: '🔧', gradient: 'from-purple-400 to-purple-600' },
        { path: `${rolePrefix}/verification`, label: 'Verification', icon: '✅', gradient: 'from-green-400 to-green-600' },
        { path: `${rolePrefix}/analytics`, label: 'Analytics', icon: '📈', gradient: 'from-pink-400 to-pink-600' },
      ],
      verifier: [
        { path: `${rolePrefix}/notifications`, label: 'Notifications', icon: '🔔', gradient: 'from-red-400 to-red-600', badge: unreadCount },
      ],
    }

    return [...common, ...(roleMenus[userRole] || [])]
  }

  const isActive = (path) => {
    if (path === `/dashboard/${userRole}`) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside 
      className="sk-sidebar hidden md:block"
      style={{
        width: '270px',
        minWidth: '270px',
        minHeight: '100vh',
        padding: '20px 14px',
        position: 'sticky',
        top: '70px',
        height: 'calc(100vh - 70px)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* Role indicator */}
      <div className="mb-5 px-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/20">
            {userRole?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800 capitalize">{userRole} Panel</p>
            <p className="text-[10px] text-gray-500 font-medium">Manage your account</p>
          </div>
        </div>
      </div>

      <div className="mb-4 px-3">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
          Navigation
        </h3>
      </div>
      <nav className="space-y-1">
        {getMenuItems().map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                sk-sidebar-item group relative flex items-center gap-3.5 px-3 py-3 rounded-xl
                font-medium transition-all duration-300 ease-out
                ${active 
                  ? 'active bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {/* Icon */}
              <span 
                className={`
                  sk-sidebar-icon text-xl flex items-center justify-center w-9 h-9 rounded-lg
                  transition-all duration-300 flex-shrink-0
                  ${active 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-gray-100 group-hover:bg-gray-200 group-hover:scale-105'
                  }
                `}
              >
                {item.icon}
              </span>
              
              {/* Label */}
              <span className={`text-[13px] font-semibold ${active ? 'text-white' : ''}`}>
                {item.label}
              </span>

              {/* Notification Badge */}
              {item.badge > 0 && (
                <span className={`ml-auto text-[10px] rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center font-bold ${
                  active 
                    ? 'bg-white/25 text-white' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}

              {/* Active Indicator Dot */}
              {active && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Help Card */}
      <div className="mt-8 mx-2 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100/60 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-200/30 rounded-full blur-xl"></div>
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg mb-3 shadow-lg shadow-indigo-500/20">
            💡
          </div>
          <p className="text-xs font-bold text-gray-800 mb-1">Need Help?</p>
          <p className="text-[11px] text-gray-500 leading-relaxed mb-3">Check our documentation and FAQ for quick answers.</p>
          <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
            Learn more
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
