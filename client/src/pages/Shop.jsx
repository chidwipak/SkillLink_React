import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ImageWithFallback from '../components/common/ImageWithFallback'
import toast from 'react-hot-toast'

const Shop = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [searchInput, setSearchInput] = useState('')
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shop Products</h1>
        <button
          onClick={() => document.getElementById('cart-modal').classList.remove('hidden')}
          className="btn btn-primary relative"
        >
          🛒 Cart ({cart.length})
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product._id} 
            className="card hover:shadow-lg transition-all cursor-pointer border hover:border-blue-300"
            onClick={() => handleProductClick(product)}
          >
            {/* Product Image */}
            <div className="relative h-40 overflow-hidden rounded-t-lg bg-gray-100">
              <ImageWithFallback
                src={product.images && product.images[0]}
                alt={product.name}
                type="product"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="p-4">
              {/* Category Badge */}
              <span className={`text-xs px-2 py-1 rounded inline-block mb-2 ${
                product.category === 'electrical' ? 'bg-yellow-100 text-yellow-800' :
                product.category === 'plumbing' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
              </span>
              
              {/* Product Name & Brand */}
              <h3 className="text-lg font-semibold mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{product.brand}</p>
              
              {/* Price & Sellers Info */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xl font-bold text-primary-600">₹{product.lowestPrice}</span>
                  {product.sellerCount > 1 && (
                    <span className="text-xs text-gray-500 ml-1">onwards</span>
                  )}
                </div>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {product.sellerCount} seller{product.sellerCount !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* View Options Button */}
              <button className="w-full btn btn-primary text-sm">
                View Options →
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters</p>
        </div>
      )}

      {/* Cart Modal */}
      <div id="cart-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🛒 Shopping Cart</h2>
            <button
              onClick={() => document.getElementById('cart-modal').classList.add('hidden')}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {!Array.isArray(cart) || cart.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">🛒</span>
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {Array.isArray(cart) && cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 border-b pb-4">
                    <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={item.images && item.images[0]}
                        alt={item.name}
                        type="product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                      <p className="text-xs text-gray-500">
                        from {item.seller?.businessName || 'Seller'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary-600">₹{getCartTotal()}</span>
                </div>
                <button onClick={handleCheckout} className="w-full btn btn-primary">
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Shop
