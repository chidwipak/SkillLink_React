import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { updateUser } from '../store/slices/authSlice'
import ImageWithFallback from '../components/common/ImageWithFallback'

// Helper to get full image URL
const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  // Remove leading slash if present for proper concatenation
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${cleanPath}`
}

const Profile = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profilePicture: null,
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setFormData({ ...formData, profilePicture: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate name (only letters and spaces)
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      toast.error('Name should contain only letters and spaces')
      return
    }
    
    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('phone', formData.phone)
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture)
      }

      const response = await api.put('/auth/profile', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      dispatch(updateUser(response.data.user))
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      setPreviewImage(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      profilePicture: null,
    })
    setPreviewImage(null)
  }

  const profileImageUrl = previewImage || user?.profilePicture || '/images/default-profile.png'

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h4 className="mb-1 fw-semibold">My Profile</h4>
          <p className="text-muted mb-0 small">Manage your account information</p>
        </div>
        {!isEditing && (
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setIsEditing(true)}
          >
            <span className="me-1">✏️</span> Edit Profile
          </button>
        )}
      </div>

      <div className="row g-4">
        {/* Profile Picture Section */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center py-5">
              <div 
                className="mx-auto mb-4 rounded-circle overflow-hidden position-relative"
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  border: '4px solid #e2e8f0',
                  backgroundColor: '#f8fafc'
                }}
              >
                <ImageWithFallback
                  src={previewImage || getImageUrl(user?.profilePicture)}
                  alt={user?.name}
                  type="user"
                  className="w-100 h-100 object-fit-cover"
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
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              <h5 className="mb-1 fw-semibold">{user?.name}</h5>
              <p className="text-muted small mb-2">{user?.email}</p>
              {/* Only show verification status for non-customer roles */}
              {user?.role !== 'customer' && (
                <span className={`badge ${user?.isVerified ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {user?.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                </span>
              )}
              <div className="mt-3">
                <span className="badge bg-primary text-capitalize fs-6">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent py-3">
              <h6 className="mb-0 fw-semibold">Account Information</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Name */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={isEditing ? formData.name : user?.name || ''}
                      onChange={(e) => {
                        // Only allow letters and spaces
                        const value = e.target.value
                        if (value === '' || /^[a-zA-Z\s]*$/.test(value)) {
                          setFormData({ ...formData, name: value })
                        }
                      }}
                      disabled={!isEditing}
                      placeholder="Your name"
                    />
                    {isEditing && (
                      <small className="text-muted">Only letters and spaces allowed</small>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control bg-light" 
                      value={user?.email || ''} 
                      disabled 
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  {/* Phone */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      value={isEditing ? formData.phone : user?.phone || ''} 
                      onChange={(e) => {
                        // Only allow numbers, max 10 digits
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setFormData({ ...formData, phone: value })
                      }}
                      disabled={!isEditing}
                      placeholder="Your phone number"
                      maxLength={10}
                    />
                    {isEditing && (
                      <small className="text-muted">{formData.phone.length}/10 digits</small>
                    )}
                  </div>

                  {/* Role */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Account Type</label>
                    <input 
                      type="text" 
                      className="form-control bg-light text-capitalize" 
                      value={user?.role || ''} 
                      disabled 
                    />
                    <small className="text-muted">Role cannot be changed</small>
                  </div>

                  {/* Member Since */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Member Since</label>
                    <input 
                      type="text" 
                      className="form-control bg-light" 
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'} 
                      disabled 
                    />
                  </div>

                  {/* Verification Status - Only for non-customer roles */}
                  {user?.role !== 'customer' && (
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Verification Status</label>
                      <input 
                        type="text" 
                        className={`form-control bg-light ${user?.isVerified ? 'text-success' : 'text-warning'}`}
                        value={user?.isVerified ? 'Verified ✓' : 'Pending Verification'} 
                        disabled 
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={cancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Security Section */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-transparent py-3">
              <h6 className="mb-0 fw-semibold">Security</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 fw-medium">Password</p>
                  <p className="text-muted small mb-0">Last changed: Never</p>
                </div>
                <button className="btn btn-outline-primary btn-sm">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
