import { Link } from 'react-router-dom'

const Sidebar = ({ userRole }) => {
  const getMenuItems = () => {
    const rolePrefix = `/dashboard/${userRole}`
    
    // Delivery person has Dashboard and Earnings
    if (userRole === 'delivery') {
      return [
        { path: rolePrefix, label: 'Dashboard', icon: '🚚' },
        { path: `${rolePrefix}/earnings`, label: 'Earnings', icon: '💰' },
      ]
    }

    const common = [
      { path: rolePrefix, label: 'Dashboard', icon: '📊' },
      { path: `${rolePrefix}/profile`, label: 'Profile', icon: '👤' },
    ]

    const roleMenus = {
      customer: [
        { path: `${rolePrefix}/bookings`, label: 'My Bookings', icon: '📅' },
        { path: `${rolePrefix}/orders`, label: 'My Orders', icon: '🛒' },
      ],
      worker: [
        { path: `${rolePrefix}/bookings`, label: 'My Jobs', icon: '📅' },
        { path: `${rolePrefix}/availability`, label: 'Availability', icon: '⏰' },
        { path: `${rolePrefix}/earnings`, label: 'Earnings', icon: '💰' },
      ],
      seller: [
        { path: `${rolePrefix}/products`, label: 'Products', icon: '📦' },
        { path: `${rolePrefix}/orders`, label: 'Orders', icon: '🛒' },
        { path: `${rolePrefix}/shop`, label: 'Shop Settings', icon: '⚙️' },
      ],
      admin: [
        { path: `${rolePrefix}/users`, label: 'Users', icon: '👥' },
        { path: `${rolePrefix}/services`, label: 'Services', icon: '🔧' },
        { path: `${rolePrefix}/verification`, label: 'Verification', icon: '✅' },
        { path: `${rolePrefix}/analytics`, label: 'Analytics', icon: '📈' },
      ],
    }

    return [...common, ...(roleMenus[userRole] || [])]
  }

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen p-4">
      <nav className="space-y-2">
        {getMenuItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary-600"
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
