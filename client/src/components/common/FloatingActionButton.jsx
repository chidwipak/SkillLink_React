import { useState } from 'react'
import { Link } from 'react-router-dom'

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { icon: 'fa-home', label: 'Home', link: '/', color: '#6366f1' },
    { icon: 'fa-wrench', label: 'Services', link: '/services', color: '#8b5cf6' },
    { icon: 'fa-shopping-cart', label: 'Shop', link: '/shop', color: '#ec4899' },
    { icon: 'fa-phone', label: 'Support', link: '/help', color: '#10b981' },
  ]

  return (
    <div className="position-fixed" style={{ bottom: '32px', right: '32px', zIndex: 1000 }}>
      {/* Action Buttons */}
      {isOpen && (
        <div className="d-flex flex-column gap-2 mb-3 animate-fade-in-up">
          {actions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="btn rounded-circle p-0 d-flex align-items-center justify-content-center text-white text-decoration-none shadow animate-scale-in"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: action.color,
                animationDelay: `${index * 0.1}s`,
                transition: 'all 0.3s ease'
              }}
              data-tooltip={action.label}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <i className={`fas ${action.icon}`}></i>
            </Link>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fab-button border-0 text-white shadow-lg"
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-plus'} fs-4`}></i>
      </button>
    </div>
  )
}

export default FloatingActionButton
