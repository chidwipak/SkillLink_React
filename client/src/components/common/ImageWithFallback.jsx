import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'

// Professional placeholder images from Pexels (more reliable)
const DEFAULT_PLACEHOLDERS = {
  // Service categories - professional photos
  service: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  electrician: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  plumber: 'https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  carpenter: 'https://images.pexels.com/photos/1094767/pexels-photo-1094767.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  
  // People placeholders - professional portraits
  worker: 'https://images.pexels.com/photos/8961065/pexels-photo-8961065.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  user: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  
  // E-commerce and business
  product: 'https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  shop: 'https://images.pexels.com/photos/1586996/pexels-photo-1586996.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
  shopInterior: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
  
  // General fallback
  general: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  
  // Hero and banner images
  hero: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
  banner: 'https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop'
}

/**
 * Image component with automatic fallback to professional placeholder images
 * Handles broken images gracefully with high-quality Pexels images
 */
const ImageWithFallback = ({
  src,
  alt = '',
  fallbackSrc = null,
  className = '',
  type = 'general', // service, worker, product, shop, user, electrician, plumber, carpenter
  ...props
}) => {
  // Helper to construct full URL for relative paths
  const getFullUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    if (path.startsWith('data:')) return path // Base64 preview images
    // Handle relative paths from backend
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${cleanPath}`
  }

  // Get the appropriate fallback for this type
  const typeFallback = fallbackSrc || DEFAULT_PLACEHOLDERS[type] || DEFAULT_PLACEHOLDERS.general

  // Use type-specific fallback if no src provided or if initial src is null
  const initialSrc = src ? getFullUrl(src) : typeFallback
  const [imgSrc, setImgSrc] = useState(initialSrc)
  const [hasError, setHasError] = useState(false)

  // Update imgSrc when src prop changes
  useEffect(() => {
    const newSrc = src ? getFullUrl(src) : typeFallback
    setImgSrc(newSrc)
    setHasError(false)
  }, [src, type, fallbackSrc, typeFallback])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      // Try fallback first, then type-specific placeholder, then general
      setImgSrc(typeFallback)
    }
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  )
}

ImageWithFallback.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  fallbackSrc: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf([
    'service', 'worker', 'product', 'shop', 'shopInterior', 
    'user', 'general', 'electrician', 'plumber', 'carpenter',
    'hero', 'banner'
  ])
}

export default ImageWithFallback
