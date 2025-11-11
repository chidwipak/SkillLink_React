import { useState, useEffect } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const SellerProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingPrice, setEditingPrice] = useState(null)
  const [newPrice, setNewPrice] = useState('')
  const [updatingStock, setUpdatingStock] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    category: '',
    stock: '50',
    image: null
  })
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/supplies/my-products')
      setProducts(response.data.products || [])
      setCategories(response.data.categories || [])
      if (response.data.categories?.length > 0 && !newProduct.category) {
        setNewProduct(prev => ({ ...prev, category: response.data.categories[0] }))
      }
    } catch (error) {
      console.error('Seller products error:', error.response?.data || error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePrice = async (productId) => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      toast.error('Please enter a valid price')
      return
    }
    
    try {
      await api.put(`/supplies/${productId}/price`, { price: parseFloat(newPrice) })
      toast.success('Price updated successfully')
      setEditingPrice(null)
      setNewPrice('')
      setProducts(products.map(p => 
        p._id === productId ? { ...p, price: parseFloat(newPrice) } : p
      ))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update price')
    }
  }

  const handleToggleStock = async (productId, currentStock) => {
    const isCurrentlyInStock = currentStock > 0
    setUpdatingStock(productId)
    
    try {
      await api.put(`/supplies/${productId}/stock`, { inStock: !isCurrentlyInStock })
      toast.success(isCurrentlyInStock ? 'Marked as out of stock' : 'Marked as in stock')
      setProducts(products.map(p => 
        p._id === productId ? { ...p, stock: isCurrentlyInStock ? 0 : 50 } : p
      ))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock')
    } finally {
      setUpdatingStock(null)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewProduct(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('name', newProduct.name)
      formData.append('brand', newProduct.brand || 'Generic')
      formData.append('description', newProduct.description)
      formData.append('price', newProduct.price)
      formData.append('category', newProduct.category)
      formData.append('stock', newProduct.stock || '50')
      
      if (newProduct.image) {
        formData.append('images', newProduct.image)
      }

      await api.post('/supplies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Product added successfully!')
      setShowAddModal(false)
      setNewProduct({
        name: '',
        brand: '',
        description: '',
        price: '',
        category: categories[0] || '',
        stock: '50',
        image: null
      })
      setImagePreview(null)
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await api.delete(`/supplies/${productId}`)
      toast.success('Product deleted successfully')
      setProducts(products.filter(p => p._id !== productId))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const getCategoryLabel = (cat) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">My Products</h1>
          <p className="text-muted mb-0">
            Manage products in your categories: {categories.map(getCategoryLabel).join(', ')}
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add New Product
        </button>
      </div>

      {/* Category Filter */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="text-muted">Filter by category:</span>
            <button 
              className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedCategory('all')}
            >
              All ({products.length})
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {getCategoryLabel(cat)} ({products.filter(p => p.category === cat).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length > 0 ? (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Your Price (₹)</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="rounded me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => e.target.src = '/placeholder.png'}
                          />
                        ) : (
                          <div 
                            className="rounded me-3 bg-light d-flex align-items-center justify-content-center"
                            style={{ width: '50px', height: '50px' }}
                          >
                            📦
                          </div>
                        )}
                        <div>
                          <h6 className="mb-0">{product.name}</h6>
                          <small className="text-muted">{product.description?.substring(0, 50)}...</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        product.category === 'electrical' ? 'bg-warning text-dark' :
                        product.category === 'plumbing' ? 'bg-info' : 'bg-success'
                      }`}>
                        {getCategoryLabel(product.category)}
                      </span>
                    </td>
                    <td>{product.brand || '-'}</td>
                    <td>
                      {editingPrice === product._id ? (
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ width: '100px' }}
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            min="1"
                            autoFocus
                          />
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleUpdatePrice(product._id)}
                          >
                            ✓
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => { setEditingPrice(null); setNewPrice(''); }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold">₹{product.price}</span>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => { setEditingPrice(product._id); setNewPrice(product.price.toString()); }}
                            title="Edit Price"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {product.stock > 0 ? (
                        <span className="badge bg-success">In Stock ({product.stock})</span>
                      ) : (
                        <span className="badge bg-danger">Out of Stock</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button 
                          className={`btn btn-sm ${product.stock > 0 ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleStock(product._id, product.stock)}
                          disabled={updatingStock === product._id}
                        >
                          {updatingStock === product._id ? '...' : product.stock > 0 ? 'Mark Out' : 'Mark In'}
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteProduct(product._id)}
                          title="Delete Product"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No products found</h5>
            <p className="text-muted mb-3">
              {selectedCategory !== 'all' 
                ? `No products in ${getCategoryLabel(selectedCategory)} category`
                : 'Start adding products to your inventory'}
            </p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              Add Your First Product
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total Products</h6>
              <h2 className="mb-0">{products.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">In Stock</h6>
              <h2 className="mb-0">{products.filter(p => p.stock > 0).length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h6 className="card-title">Out of Stock</h6>
              <h2 className="mb-0">{products.filter(p => p.stock === 0).length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Product</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowAddModal(false)
                    setImagePreview(null)
                    setNewProduct({
                      name: '',
                      brand: '',
                      description: '',
                      price: '',
                      category: categories[0] || '',
                      stock: '50',
                      image: null
                    })
                  }}
                ></button>
              </div>
              <form onSubmit={handleAddProduct}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label">Product Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., LED Bulb 9W"
                          required
                        />
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Brand</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newProduct.brand}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                              placeholder="e.g., Philips"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Category *</label>
                            <select
                              className="form-select"
                              value={newProduct.category}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                              required
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Price (₹) *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                              placeholder="e.g., 250"
                              min="1"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Stock Quantity</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newProduct.stock}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                              placeholder="e.g., 50"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your product..."
                        ></textarea>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Product Image</label>
                        <div 
                          className="border rounded p-3 text-center"
                          style={{ minHeight: '200px', cursor: 'pointer' }}
                          onClick={() => document.getElementById('product-image').click()}
                        >
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="img-fluid rounded"
                              style={{ maxHeight: '180px' }}
                            />
                          ) : (
                            <div className="text-muted py-5">
                              <p className="mb-0">📷 Click to upload image</p>
                              <small>JPG, PNG, GIF</small>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          id="product-image"
                          className="d-none"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerProducts
