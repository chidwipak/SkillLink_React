// Utility functions for formatting

/**
 * Format price in Indian Rupees
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount, showDecimals = true) => {
  if (amount === null || amount === undefined) return '₹0'
  
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount)) return '₹0'
  
  return showDecimals 
    ? `₹${numAmount.toFixed(2)}`
    : `₹${Math.round(numAmount)}`
}

/**
 * Format date in readable format
 * @param {string|Date} date - The date to format
 * @param {string} format - Format type: 'short', 'long', 'time'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    time: { hour: '2-digit', minute: '2-digit', hour12: true },
    datetime: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  }
  
  return d.toLocaleString('en-IN', options[format] || options.short)
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return formatDate(date, 'short')
}

/**
 * Get status badge color class
 * @param {string} status - Status value
 * @returns {string} Bootstrap badge class
 */
export const getStatusBadgeClass = (status) => {
  const statusClasses = {
    // Booking statuses
    pending: 'badge bg-warning text-dark',
    confirmed: 'badge bg-info text-white',
    'in-progress': 'badge bg-primary text-white',
    completed: 'badge bg-success text-white',
    cancelled: 'badge bg-danger text-white',
    
    // Order statuses
    processing: 'badge bg-info text-white',
    shipped: 'badge bg-primary text-white',
    delivered: 'badge bg-success text-white',
    
    // Payment statuses
    paid: 'badge bg-success text-white',
    unpaid: 'badge bg-warning text-dark',
    refunded: 'badge bg-secondary text-white',
    
    // Verification statuses
    verified: 'badge bg-success text-white',
    unverified: 'badge bg-warning text-dark',
    rejected: 'badge bg-danger text-white',
  }
  
  return statusClasses[status] || 'badge bg-secondary text-white'
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default {
  formatPrice,
  formatDate,
  formatRelativeTime,
  getStatusBadgeClass,
  truncateText,
  isValidEmail,
  isValidPhone,
  formatPhone,
  calculatePercentage,
  debounce,
}
