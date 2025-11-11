import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { updateUser } from '../../store/slices/authSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const SellerShop = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [sellerData, setSellerData] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    businessDescription: '',
    businessPhone: '',
    businessAddress: '',
    gstNumber: '',
    profilePicture: null,
    shopExteriorImage: null,
    shopInteriorImage: null,
  })
  
  const [previews, setPreviews] = useState({
    profile: null,
    exterior: null,
    interior: null,
  })

  useEffect(() => {
    fetchSellerProfile()
  }, [])

  const fetchSellerProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/dashboard/seller/profile')
      const data = response.data
      setSellerData(data)
      setFormData({
        name: user?.name || '',
        businessName: data.seller?.businessName || '',
        businessDescription: data.seller?.businessDescription || '',
        businessPhone: data.seller?.businessPhone || user?.phone || '',
        businessAddress: data.seller?.businessAddress || '',
        gstNumber: data.seller?.gstNumber || '',
        profilePicture: null,
        shopExteriorImage: null,
        shopInteriorImage: null,
      })
    } catch (error) {
      toast.error('Failed to load shop data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      const fieldName = type === 'profile' ? 'profilePicture' : 
                        type === 'exterior' ? 'shopExteriorImage' : 'shopInteriorImage'
      
      setFormData(prev => ({ ...prev, [fieldName]: file }))
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('businessName', formData.businessName)
      submitData.append('businessDescription', formData.businessDescription)
      submitData.append('businessPhone', formData.businessPhone)
      submitData.append('businessAddress', formData.businessAddress)
      submitData.append('gstNumber', formData.gstNumber)
      
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture)
      }
      if (formData.shopExteriorImage) {
        submitData.append('shopExteriorImage', formData.shopExteriorImage)
      }
      if (formData.shopInteriorImage) {
        submitData.append('shopInteriorImage', formData.shopInteriorImage)
      }

      const response = await api.put('/dashboard/seller/shop-settings', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data.user) {
        dispatch(updateUser(response.data.user))
      }
      
      toast.success('Shop settings updated successfully!')
      setIsEditing(false)
      setPreviews({ profile: null, exterior: null, interior: null })
      fetchSellerProfile()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update shop settings')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setPreviews({ profile: null, exterior: null, interior: null })
    setFormData({
      name: user?.name || '',
      businessName: sellerData?.seller?.businessName || '',
      businessDescription: sellerData?.seller?.businessDescription || '',
      businessPhone: sellerData?.seller?.businessPhone || user?.phone || '',
      businessAddress: sellerData?.seller?.businessAddress || '',
      gstNumber: sellerData?.seller?.gstNumber || '',
      profilePicture: null,
      shopExteriorImage: null,
      shopInteriorImage: null,
    })
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const profileImageUrl = previews.profile || user?.profilePicture || '/images/default-profile.png'
  const exteriorImageUrl = previews.exterior || sellerData?.seller?.shopImages?.exterior || '/images/shop-placeholder.jpg'
  const interiorImageUrl = previews.interior || sellerData?.seller?.shopImages?.interior || '/images/shop-interior-placeholder.jpg'
  
  // Check if images are just placeholders
  const hasExteriorImage = sellerData?.seller?.shopImages?.exterior || previews.exterior
  const hasInteriorImage = sellerData?.seller?.shopImages?.interior || previews.interior

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h4 className="mb-1 fw-semibold">Shop Settings</h4>
          <p className="text-muted mb-0 small">Manage your shop profile and images</p>
        </div>
        {!isEditing && (
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setIsEditing(true)}
          >
            <span className="me-1">✏️</span> Edit Shop
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Profile Section */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent py-3">
                <h6 className="mb-0 fw-semibold">Profile Picture</h6>
              </div>
              <div className="card-body text-center">
                <div 
                  className="mx-auto mb-3 rounded-circle overflow-hidden position-relative"
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    border: '4px solid #e2e8f0',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <img 
                    src={profileImageUrl} 
                    alt="Profile"
                    className="w-100 h-100 object-fit-cover"
                    onError={(e) => {
                      e.target.src = '/images/default-profile.png'
                    }}
                  />
                  {isEditing && (
                    <label 
                      className="position-absolute bottom-0 start-0 end-0 py-2 text-white text-center"
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.9)', 
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      📷 Change
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="d-none"
                        onChange={(e) => handleImageChange(e, 'profile')}
                      />
                    </label>
                  )}
                </div>
                <h5 className="mb-1 fw-semibold">{user?.name}</h5>
                <p className="text-muted small mb-2">{user?.email}</p>
                <span className={`badge ${sellerData?.seller?.isVerified ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {sellerData?.seller?.isVerified ? '✓ Verified Seller' : '⏳ Pending Verification'}
                </span>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent py-3">
                <h6 className="mb-0 fw-semibold">Business Information</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {/* Username */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Username / Display Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Your display name"
                    />
                  </div>

                  {/* Business Name */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Business / Shop Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Your shop name"
                    />
                  </div>

                  {/* Phone */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Business Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.businessPhone}
                      onChange={(e) => setFormData({...formData, businessPhone: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Contact number"
                    />
                  </div>

                  {/* GST Number */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted">GST Number (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                      disabled={!isEditing}
                      placeholder="GSTIN"
                    />
                  </div>

                  {/* Business Address */}
                  <div className="col-12">
                    <label className="form-label small text-muted">Business Address</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.businessAddress}
                      onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Your shop address"
                    />
                  </div>

                  {/* Business Description */}
                  <div className="col-12">
                    <label className="form-label small text-muted">Business Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.businessDescription}
                      onChange={(e) => setFormData({...formData, businessDescription: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Describe your business and what you sell..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Images Section */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent py-3">
                <h6 className="mb-0 fw-semibold">Shop Images</h6>
                <p className="text-muted small mb-0 mt-1">These images help customers identify your shop</p>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  {/* Shop Exterior */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted fw-medium">
                      🏬 Shop Exterior
                    </label>
                    <div 
                      className="border rounded-3 overflow-hidden position-relative"
                      style={{ 
                        height: '200px',
                        backgroundColor: '#f8fafc',
                        border: '2px dashed #e2e8f0 !important'
                      }}
                    >
                      {exteriorImageUrl ? (
                        <>
                          <img 
                            src={exteriorImageUrl} 
                            alt="Shop Exterior"
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                              e.target.src = '/images/shop-placeholder.jpg'
                            }}
                          />
                          {isEditing && (
                            <label 
                              className="position-absolute bottom-0 start-0 end-0 py-2 text-white text-center"
                              style={{ 
                                background: 'rgba(59, 130, 246, 0.9)', 
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              📷 Change Image
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="d-none"
                                onChange={(e) => handleImageChange(e, 'exterior')}
                              />
                            </label>
                          )}
                        </>
                      ) : (
                        <label 
                          className="d-flex flex-column align-items-center justify-content-center h-100"
                          style={{ cursor: isEditing ? 'pointer' : 'default' }}
                        >
                          <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>🏬</span>
                          <span className="text-muted small mt-2">
                            {isEditing ? 'Click to upload exterior image' : 'No exterior image'}
                          </span>
                          {isEditing && (
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="d-none"
                              onChange={(e) => handleImageChange(e, 'exterior')}
                            />
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Shop Interior */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted fw-medium">
                      🏠 Shop Interior
                    </label>
                    <div 
                      className="border rounded-3 overflow-hidden position-relative"
                      style={{ 
                        height: '200px',
                        backgroundColor: '#f8fafc',
                        border: '2px dashed #e2e8f0 !important'
                      }}
                    >
                      {interiorImageUrl ? (
                        <>
                          <img 
                            src={interiorImageUrl} 
                            alt="Shop Interior"
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                              e.target.src = '/images/shop-interior-placeholder.jpg'
                            }}
                          />
                          {isEditing && (
                            <label 
                              className="position-absolute bottom-0 start-0 end-0 py-2 text-white text-center"
                              style={{ 
                                background: 'rgba(59, 130, 246, 0.9)', 
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              📷 Change Image
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="d-none"
                                onChange={(e) => handleImageChange(e, 'interior')}
                              />
                            </label>
                          )}
                        </>
                      ) : (
                        <label 
                          className="d-flex flex-column align-items-center justify-content-center h-100"
                          style={{ cursor: isEditing ? 'pointer' : 'default' }}
                        >
                          <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>🏠</span>
                          <span className="text-muted small mt-2">
                            {isEditing ? 'Click to upload interior image' : 'No interior image'}
                          </span>
                          {isEditing && (
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="d-none"
                              onChange={(e) => handleImageChange(e, 'interior')}
                            />
                          )}
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Saving...
                      </>
                    ) : (
                      <>Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent py-3">
                <h6 className="mb-0 fw-semibold">Shop Performance</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3 col-6">
                    <div className="text-center p-3 bg-light rounded-3">
                      <div className="display-6 mb-1">⭐</div>
                      <h4 className="mb-1 fw-bold">{sellerData?.seller?.rating?.toFixed(1) || '0.0'}</h4>
                      <small className="text-muted">Rating</small>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="text-center p-3 bg-light rounded-3">
                      <div className="display-6 mb-1">📦</div>
                      <h4 className="mb-1 fw-bold">{sellerData?.products || 0}</h4>
                      <small className="text-muted">Products</small>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="text-center p-3 bg-light rounded-3">
                      <div className="display-6 mb-1">🛍️</div>
                      <h4 className="mb-1 fw-bold">{sellerData?.orders || 0}</h4>
                      <small className="text-muted">Total Orders</small>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="text-center p-3 bg-light rounded-3">
                      <div className="display-6 mb-1">💰</div>
                      <h4 className="mb-1 fw-bold">₹{(sellerData?.revenue || 0).toLocaleString()}</h4>
                      <small className="text-muted">Revenue</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SellerShop
