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
  const [csvFile, setCsvFile] = useState(null)
  const [csvUploading, setCsvUploading] = useState(false)
  const [showCsvSection, setShowCsvSection] = useState(false)

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

  const handleCsvUpload = async () => {
    if (!csvFile) { toast.error('Please select a CSV file'); return }
    try {
      setCsvUploading(true)
      const formData = new FormData()
      formData.append('csvFile', csvFile)
      const res = await api.post('/supplies/csv-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(res.data.message || `Uploaded ${res.data.productsCreated} products!`)
      if (res.data.errors?.length > 0) {
        toast(`${res.data.errors.length} row(s) had issues`, { icon: '⚠️' })
      }
      setCsvFile(null)
      setShowCsvSection(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'CSV upload failed')
    } finally {
      setCsvUploading(false)
    }
  }

  const getCategoryLabel = (cat) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-enter px-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">My Products</h1>
          <p className="text-sm text-gray-500">
            Manage products in your categories: {categories.map(getCategoryLabel).join(', ')}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className="sk-btn sk-btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add New Product
          </button>
          <button 
            className={`sk-btn ${showCsvSection ? 'sk-btn-danger' : 'sk-btn-success'}`}
            onClick={() => setShowCsvSection(!showCsvSection)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            {showCsvSection ? 'Cancel CSV' : 'CSV Upload'}
          </button>
        </div>
      </div>

      {/* CSV Upload Section */}
      {showCsvSection && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5 mb-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl flex-shrink-0">📄</div>
            <div className="flex-1">
              <h3 className="font-bold text-green-800 text-lg">Bulk Product Upload via CSV</h3>
              <p className="text-sm text-green-600 mb-3">Upload a CSV file with columns: <code className="bg-green-100 px-1.5 py-0.5 rounded text-xs">name, brand, category, price, stock, description</code></p>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${csvFile ? 'border-green-400 bg-green-50' : 'border-green-300 hover:border-green-400 hover:bg-green-50/50'}`}>
                    {csvFile ? (
                      <div><span className="text-green-700 font-semibold">{csvFile.name}</span><span className="text-green-500 text-xs ml-2">({(csvFile.size / 1024).toFixed(1)} KB)</span></div>
                    ) : (
                      <div><span className="text-green-600 text-sm">Click to select CSV file or drag & drop</span></div>
                    )}
                    <input type="file" accept=".csv" className="hidden" onChange={(e) => setCsvFile(e.target.files[0])} />
                  </div>
                </label>
                <button onClick={handleCsvUpload} disabled={!csvFile || csvUploading} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-200">
                  {csvUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              <p className="text-xs text-green-500 mt-2">Category must be one of: electrical, plumbing, carpentry. Max 5MB.</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Filter:</span>
          <button 
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${selectedCategory === 'all' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            onClick={() => setSelectedCategory('all')}
          >
            All ({products.length})
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${selectedCategory === cat ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {getCategoryLabel(cat)} ({products.filter(p => p.category === cat).length})
            </button>
          ))}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-5 text-white shadow-lg shadow-indigo-200">
          <h6 className="text-indigo-100 text-sm font-medium mb-1">Total Products</h6>
          <h2 className="text-3xl font-extrabold mb-0">{products.length}</h2>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white shadow-lg shadow-green-200">
          <h6 className="text-emerald-100 text-sm font-medium mb-1">In Stock</h6>
          <h2 className="text-3xl font-extrabold mb-0">{products.filter(p => p.stock > 0).length}</h2>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-5 text-white shadow-lg shadow-red-200">
          <h6 className="text-red-100 text-sm font-medium mb-1">Out of Stock</h6>
          <h2 className="text-3xl font-extrabold mb-0">{products.filter(p => p.stock === 0).length}</h2>
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
