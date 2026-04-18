import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import '../styles/modern.css'

const ProductDetail = () => {
  const { productName } = useParams()
  const navigate = useNavigate()
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [productInfo, setProductInfo] = useState(null)

  useEffect(() => {
    fetchProductSellers()
  }, [productName])

  const fetchProductSellers = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/supplies/product/${encodeURIComponent(productName)}`)
      
      if (response.data.products && response.data.products.length > 0) {
        setSellers(response.data.products)
        // Use first product for general info
        setProductInfo(response.data.products[0])
      } else {
        setSellers([])
        setProductInfo(null)
      }
    } catch (error) {
      console.error('Error fetching product sellers:', error)
      toast.error('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock from this seller')
      return
    }

    console.log('Adding to cart:', product._id, product.name)

    const savedCart = localStorage.getItem('cart')
    let cart = savedCart ? JSON.parse(savedCart) : []
    
    const existingItem = cart.find(item => item._id === product._id)
    
    if (existingItem) {
      cart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      // Ensure we store the _id properly
      const cartItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        images: product.images,
        seller: product.seller,
        quantity: 1
      }
      cart = [...cart, cartItem]
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Dispatch custom event to update cart count in header
    window.dispatchEvent(new Event('cartUpdated'))
    
    toast.success(`Added to cart from ${product.seller?.businessName || 'seller'}`)
  }

  const handleBuyNow = (product) => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock from this seller')
      return
    }

    // Create a single-item cart for immediate purchase
    const buyNowCart = [{
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      images: product.images,
      seller: product.seller,
      quantity: 1
    }]

    localStorage.setItem('cart', JSON.stringify(buyNowCart))
    window.dispatchEvent(new Event('cartUpdated'))
    navigate('/checkout')
  }

  // Sort sellers: in-stock first (by price), then out-of-stock
  const sortedSellers = [...sellers].sort((a, b) => {
    if (a.stock > 0 && b.stock <= 0) return -1
    if (a.stock <= 0 && b.stock > 0) return 1
    return a.price - b.price
  })

  const inStockCount = sellers.filter(s => s.stock > 0).length

  if (loading) return <LoadingSpinner />

  if (!productInfo) {
    return (
      <div className="sk-empty-state" style={{ minHeight: '60vh' }}>
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Product Not Found</h2>
        <p className="text-gray-500 mb-4">This product is not available</p>
        <button onClick={() => navigate('/shop')} className="sk-btn sk-btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Shop
        </button>
      </div>
    )
  }

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/shop')}
        className="mb-6 text-gray-500 hover:text-indigo-600 flex items-center gap-2 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Shop
      </button>

      {/* Product Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Product Image */}
          <div className="md:w-1/3">
            {productInfo.images && productInfo.images[0] ? (
              <img
                src={productInfo.images[0]}
                alt={productInfo.name}
                className="w-full h-64 object-cover rounded-xl"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="256"><rect fill="%23f3f4f6" width="300" height="256"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="60">📦</text></svg>'
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-2/3">
            <span className={`sk-badge mb-3 ${
              productInfo.category === 'electrical' ? 'sk-badge-warning' :
              productInfo.category === 'plumbing' ? 'sk-badge-info' :
              'sk-badge-success'
            }`}>
              {productInfo.category?.charAt(0).toUpperCase() + productInfo.category?.slice(1)}
            </span>

            <h1 className="text-3xl font-bold mb-2 text-gray-900">{productInfo.name}</h1>
            <p className="text-lg text-gray-500 mb-3">{productInfo.brand}</p>

            {productInfo.description && (
              <p className="text-gray-600 mb-4">{productInfo.description}</p>
            )}

            <div className="flex items-center gap-3 text-sm flex-wrap">
              <span className="sk-badge sk-badge-info">
                {sellers.length} Seller{sellers.length !== 1 ? 's' : ''}
              </span>
              <span className="sk-badge sk-badge-success">
                {inStockCount} In Stock
              </span>
              {sellers.length > 0 && (
                <span className="sk-badge sk-badge-primary">
                  From ₹{Math.min(...sellers.filter(s => s.stock > 0).map(s => s.price)) || 'N/A'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sellers List */}
      <h2 className="text-xl font-bold mb-4 text-gray-900">Choose a Seller</h2>

      <div className="space-y-4 stagger-children">
        {sortedSellers.map((product, index) => {
          const isOutOfStock = product.stock <= 0
          const isBestPrice = !isOutOfStock && index === 0

          return (
            <div
              key={product._id}
              className={`fade-in-up visible bg-white rounded-2xl shadow-sm p-5 border-2 transition-all duration-300 hover:shadow-md ${
                isOutOfStock
                  ? 'border-gray-100 opacity-60 grayscale-[30%]'
                  : isBestPrice
                    ? 'border-green-400 ring-2 ring-green-100'
                    : 'border-gray-100 hover:border-indigo-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Seller Image */}
                <div className="md:w-20 flex-shrink-0">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-20 h-20 object-cover rounded-xl" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none' }} />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                  )}
                </div>

                {/* Seller Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      {isBestPrice && (
                        <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs px-2.5 py-0.5 rounded-full mb-1.5 font-semibold">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          Best Price
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-gray-900">
                        {product.seller?.businessName || 'Unknown Seller'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {product.seller?.rating > 0 && (
                      <span className="flex items-center gap-1"><span className="text-amber-400">★</span> {Number(product.seller.rating).toFixed(1)}</span>
                    )}
                    {product.seller?.totalSales > 0 && (
                      <span>{product.seller.totalSales} Sales</span>
                    )}
                    {product.seller?.user?.address?.city && (
                      <span>{product.seller.user.address.city}</span>
                    )}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="md:w-44 text-right flex-shrink-0">
                  <p className={`text-2xl font-bold ${isOutOfStock ? 'text-gray-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
                    ₹{product.price}
                  </p>

                  {isOutOfStock ? (
                    <div className="mt-2">
                      <span className="sk-badge sk-badge-danger">Out of Stock</span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 mb-2 font-medium">{product.stock} in stock</p>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleBuyNow(product)} className="sk-btn sk-btn-sm w-full" style={{ background: 'linear-gradient(to right, #f59e0b, #ef4444)', color: 'white', border: 'none' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          Buy Now
                        </button>
                        <button onClick={() => addToCart(product)} className="sk-btn sk-btn-primary sk-btn-sm w-full">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sellers.length === 0 && (
        <div className="sk-empty-state py-16 bg-white rounded-2xl shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-gray-500 text-lg">No sellers found for this product</p>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
