import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

/**
 * Bootstrap Dropdown Component
 * Properly integrates Bootstrap 5 dropdowns with React
 */
const Dropdown = ({ buttonText, buttonClass = 'btn btn-sm btn-outline-secondary', children }) => {
  const dropdownRef = useRef(null)
  const dropdownInstance = useRef(null)

  useEffect(() => {
    // Initialize Bootstrap dropdown
    if (dropdownRef.current && window.bootstrap) {
      dropdownInstance.current = new window.bootstrap.Dropdown(dropdownRef.current)
    }

    // Cleanup
    return () => {
      if (dropdownInstance.current) {
        dropdownInstance.current.dispose()
      }
    }
  }, [])

  return (
    <div className="dropdown">
      <button
        ref={dropdownRef}
        className={`${buttonClass} dropdown-toggle`}
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {buttonText}
      </button>
      <ul className="dropdown-menu">
        {children}
      </ul>
    </div>
  )
}

Dropdown.propTypes = {
  buttonText: PropTypes.string.isRequired,
  buttonClass: PropTypes.string,
  children: PropTypes.node.isRequired
}

/**
 * Dropdown Item Component
 */
export const DropdownItem = ({ onClick, className = '', children, divider = false }) => {
  if (divider) {
    return <li><hr className="dropdown-divider" /></li>
  }

  return (
    <li>
      <button
        className={`dropdown-item ${className}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClick()
        }}
      >
        {children}
      </button>
    </li>
  )
}

DropdownItem.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
  divider: PropTypes.bool
}

export default Dropdown
