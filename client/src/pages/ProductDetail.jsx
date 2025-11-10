import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

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
    toast.success(`Added to cart from ${product.seller?.businessName || 'seller'}`)
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
      <div className="container mx-auto px-4 py-8 text-center">
        <span className="text-6xl mb-4 block">😕</span>
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-4">This product is not available</p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">
          Back to Shop
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/shop')}
        className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
      >
        ← Back to Shop
      </button>

      {/* Product Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Product Image */}
          <div className="md:w-1/3">
            {productInfo.images && productInfo.images[0] ? (
              <img
                src={productInfo.images[0]}
                alt={productInfo.name}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="256"><rect fill="%23f3f4f6" width="300" height="256"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="60">📦</text></svg>'
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-6xl">📦</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-2/3">
            <span className={`text-sm px-3 py-1 rounded inline-block mb-3 ${
              productInfo.category === 'electrical' ? 'bg-yellow-100 text-yellow-800' :
              productInfo.category === 'plumbing' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {productInfo.category?.charAt(0).toUpperCase() + productInfo.category?.slice(1)}
            </span>
            
            <h1 className="text-3xl font-bold mb-2">{productInfo.name}</h1>
            <p className="text-lg text-gray-600 mb-2">{productInfo.brand}</p>
            
            {productInfo.description && (
              <p className="text-gray-600 mb-4">{productInfo.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded">
                {sellers.length} Seller{sellers.length !== 1 ? 's' : ''} Available
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded">
                {inStockCount} In Stock
              </span>
              {sellers.length > 0 && (
                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded">
                  Starting from ₹{Math.min(...sellers.filter(s => s.stock > 0).map(s => s.price)) || 'N/A'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sellers List */}
      <h2 className="text-2xl font-bold mb-4">Choose a Seller</h2>
      
      <div className="space-y-4">
        {sortedSellers.map((product, index) => {
          const isOutOfStock = product.stock <= 0
          const isBestPrice = !isOutOfStock && index === 0
          
          return (
            <div 
              key={product._id} 
              className={`bg-white rounded-lg shadow-md p-5 border-2 transition-all ${
                isOutOfStock 
                  ? 'border-gray-200 opacity-70' 
                  : isBestPrice 
                    ? 'border-green-500' 
                    : 'border-transparent hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Seller Image */}
                <div className="md:w-20">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                </div>

                {/* Seller Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      {isBestPrice && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded mb-2 inline-block">
                          ✓ Best Price
                        </span>
                      )}
                      <h3 className="text-lg font-semibold">
                        {product.seller?.businessName || 'Unknown Seller'}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {product.seller?.rating > 0 && (
                      <span className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        {Number(product.seller.rating).toFixed(1)} Rating
                      </span>
                    )}
                    {product.seller?.totalSales > 0 && (
                      <span>📦 {product.seller.totalSales} Sales</span>
                    )}
                    {product.seller?.user?.address?.city && (
                      <span>📍 {product.seller.user.address.city}</span>
                    )}
                  </div>

                  {product.seller?.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                      {product.seller.description}
                    </p>
                  )}
                </div>

                {/* Price & Action */}
                <div className="md:w-48 text-right">
                  <p className={`text-2xl font-bold ${isOutOfStock ? 'text-gray-400' : 'text-primary-600'}`}>
                    ₹{product.price}
                  </p>
                  
                  {isOutOfStock ? (
                    <div className="mt-2">
                      <span className="bg-red-100 text-red-600 px-3 py-2 rounded inline-block text-sm font-medium">
                        Out of Stock
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 mb-2">{product.stock} in stock</p>
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-primary w-full"
                      >
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sellers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <span className="text-6xl mb-4 block">😕</span>
          <p className="text-gray-500 text-lg">No sellers found for this product</p>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
