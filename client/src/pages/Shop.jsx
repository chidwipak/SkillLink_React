import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ImageWithFallback from '../components/common/ImageWithFallback'
import toast from 'react-hot-toast'
import '../styles/modern.css'

const Shop = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: ''
  })

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchInput }))
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchInput])

  // Auto-open cart when coming from navbar cart icon
  useEffect(() => {
    if (searchParams.get('showCart') === 'true') {
      const cartModal = document.getElementById('cart-modal')
      if (cartModal) {
        cartModal.classList.remove('hidden')
      }
      // Remove the param from URL to prevent reopening on refresh
      searchParams.delete('showCart')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // Debounced price filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (minPriceInput !== filters.minPrice || maxPriceInput !== filters.maxPrice) {
        setFilters(prev => ({ ...prev, minPrice: minPriceInput, maxPrice: maxPriceInput }))
      }
    }, 800)
    return () => clearTimeout(timeoutId)
  }, [minPriceInput, maxPriceInput])

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts()
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // Ensure cart is always an array
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart)
        } else {
          // If invalid, reset cart
          localStorage.removeItem('cart')
          setCart([])
        }
      } catch (e) {
        // If parsing fails, reset cart
        localStorage.removeItem('cart')
        setCart([])
      }
    }
  }, [filters.category, filters.search, filters.minPrice, filters.maxPrice])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      
      const response = await api.get(`/supplies/unique?${params.toString()}`)
      
      if (response.data && response.data.products) {
        setProducts(response.data.products)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Products fetch error:', error.response?.data || error)
      toast.error('Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (product) => {
    navigate(`/product/${encodeURIComponent(product.name)}`)
  }

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item._id !== productId)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
    toast.success('Removed from cart')
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }
    const newCart = cart.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    )
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const getCartTotal = () => {
    if (!Array.isArray(cart)) return 0
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout')
      setTimeout(() => navigate('/login', { state: { from: '/shop' } }), 1000)
      return
    }
    if (user?.role !== 'customer') {
      toast.error('Only customers can place orders')
      return
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    navigate('/checkout')
  }

  const categories = [
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'carpentry', label: 'Carpentry' }
  ]

  if (loading && products.length === 0) return <LoadingSpinner />

  return (
    <div className="min-h-screen relative overflow-hidden page-enter" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 30%, #eef2ff 100%)' }}>
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="floating-particle floating-particle-1"></div>
        <div className="floating-particle floating-particle-2"></div>
        <div className="floating-particle floating-particle-3"></div>
      </div>

      <div className="container mx-auto px-4 py-4 relative" style={{ zIndex: 10, paddingTop: '5rem' }}>
        {/* Header Section */}
        <div className="mb-6 p-6 md:p-8 rounded-3xl relative overflow-hidden fade-in-up visible" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 opacity-20" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)', transform: 'translate(30%, -50%)' }}></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 opacity-15" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)', transform: 'translate(-30%, 50%)' }}></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                Shop Products
              </h1>
              <p className="text-gray-400 text-lg">Discover quality products from trusted sellers</p>
            </div>
            <button
              onClick={() => document.getElementById('cart-modal').classList.remove('hidden')}
              className="sk-btn sk-btn-primary relative group"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
              Cart ({cart.length})
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <h6 className="font-bold text-gray-800">Filter Products</h6>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="sk-input pl-10"
                />
              </div>
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="sk-input pl-10 appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="sk-input pl-8"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="sk-input pl-8"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sk-input pl-10 appearance-none cursor-pointer"
                >
                  <option value="">Sort By: Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name-az">Name: A to Z</option>
                  <option value="name-za">Name: Z to A</option>
                  <option value="sellers">Most Sellers</option>
                </select>
              </div>
              {(filters.search || filters.category || filters.minPrice || filters.maxPrice || sortBy) && (
                <div>
                  <button
                    className="sk-btn sk-btn-outline w-full"
                    onClick={() => {
                      setSearchInput('')
                      setMinPriceInput('')
                      setMaxPriceInput('')
                      setSortBy('')
                      setFilters({ category: '', search: '', minPrice: '', maxPrice: '' })
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 stagger-children">
          {[...products].sort((a, b) => {
            if (sortBy === 'price-low') return (a.lowestPrice || 0) - (b.lowestPrice || 0)
            if (sortBy === 'price-high') return (b.lowestPrice || 0) - (a.lowestPrice || 0)
            if (sortBy === 'rating') return (b.avgRating || 0) - (a.avgRating || 0)
            if (sortBy === 'name-az') return (a.name || '').localeCompare(b.name || '')
            if (sortBy === 'name-za') return (b.name || '').localeCompare(a.name || '')
            if (sortBy === 'sellers') return (b.sellerCount || 0) - (a.sellerCount || 0)
            return 0
          }).map((product, index) => (
            <div key={product._id} className="fade-in-up visible" style={{ transitionDelay: `${index * 60}ms` }}>
              <div className="product-card group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                {/* Product Image */}
                <div 
                  className="relative overflow-hidden cursor-pointer" 
                  style={{ height: '200px' }}
                  onClick={() => handleProductClick(product)}
                >
                  <ImageWithFallback
                    src={product.images && product.images[0]}
                    alt={product.name}
                    type="product"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white text-sm font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Quick View
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`sk-badge ${
                      product.category === 'electrical' ? 'sk-badge-warning' :
                      product.category === 'plumbing' ? 'sk-badge-info' :
                      'sk-badge-success'
                    }`}>
                      {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
                    </span>
                    {product.sellerCount > 1 && (
                      <span className="sk-badge sk-badge-primary">
                        {product.sellerCount} sellers
                      </span>
                    )}
                  </div>
                
                  {/* Product Name & Brand */}
                  <h5 
                    className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-indigo-600 transition-colors line-clamp-2 leading-snug" 
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </h5>
                  <p className="text-gray-400 text-xs mb-3">{product.brand}</p>
                  
                  {/* Rating Stars */}
                  {(product.avgRating > 0 || product.totalReviews > 0) && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg 
                            key={star} 
                            className={`w-3.5 h-3.5 ${star <= Math.round(product.avgRating || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                            fill="currentColor" viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-indigo-600">{product.avgRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-xs text-gray-400">({product.totalReviews || 0})</span>
                    </div>
                  )}
                  
                  {/* Price Display */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ₹{product.lowestPrice}
                      </span>
                      {product.sellerCount > 1 && (
                        <span className="text-gray-400 text-xs">onwards</span>
                      )}
                    </div>
                  </div>
                
                  {/* Action Button */}
                  <button 
                    onClick={() => handleProductClick(product)}
                    className="sk-btn sk-btn-primary sk-btn-sm w-full group-hover:shadow-md transition-shadow"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                    View & Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div className="sk-empty-state">
            <div className="sk-empty-state-icon">🔍</div>
            <p className="sk-empty-state-title">No products found</p>
            <p className="sk-empty-state-desc">Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* Enhanced Cart Modal */}
        <div 
          id="cart-modal" 
          className="hidden sk-modal-overlay"
        >
        <div className="sk-modal mx-4" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Shopping Cart</h2>
                <p className="text-xs text-gray-400">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            <button
              onClick={() => document.getElementById('cart-modal').classList.add('hidden')}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
          {!Array.isArray(cart) || cart.length === 0 ? (
            <div className="sk-empty-state py-8">
              <div className="sk-empty-state-icon">🛒</div>
              <p className="sk-empty-state-title">Your cart is empty</p>
              <p className="sk-empty-state-desc">Browse our shop and add products to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {Array.isArray(cart) && cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 ring-1 ring-gray-100">
                      <ImageWithFallback
                        src={item.images && item.images[0]}
                        alt={item.name}
                        type="product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-indigo-600 font-semibold">₹{item.price} each</p>
                      <p className="text-xs text-gray-400">from {item.seller?.businessName || 'Seller'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-bold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-extrabold text-gray-900">₹{item.price * item.quantity}</p>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-400 text-xs hover:text-red-600 font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          </div>

          {Array.isArray(cart) && cart.length > 0 && (
            <div className="border-t border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-semibold">Total:</span>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₹{getCartTotal()}</span>
              </div>
              <button onClick={handleCheckout} className="sk-btn sk-btn-primary w-full sk-btn-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

export default Shop
