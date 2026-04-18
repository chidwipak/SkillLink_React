import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { updateUser } from '../store/slices/authSlice'
import ImageWithFallback from '../components/common/ImageWithFallback'
import '../styles/modern.css'

// Helper to get full image URL
const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  // Remove leading slash if present for proper concatenation
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${import.meta.env.VITE_API_BASE_URL || ''}${cleanPath}`
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
    <div className="page-enter max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h4 className="text-xl font-bold text-gray-900">My Profile</h4>
          <p className="text-gray-500 text-sm mt-0.5">Manage your account information</p>
        </div>
        {!isEditing && (
          <button className="sk-btn sk-btn-primary sk-btn-sm" onClick={() => setIsEditing(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="text-center py-10 px-6">
              <div className="relative w-36 h-36 mx-auto mb-5 rounded-full overflow-hidden ring-4 ring-indigo-100 bg-gray-50">
                <ImageWithFallback
                  src={previewImage || getImageUrl(user?.profilePicture)}
                  alt={user?.name}
                  type="user"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 inset-x-0 py-2 text-white text-center bg-indigo-500/90 cursor-pointer text-xs font-medium hover:bg-indigo-600/90 transition-colors">
                    <svg className="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Change
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              <h5 className="text-lg font-bold text-gray-900 mb-0.5">{user?.name}</h5>
              <p className="text-gray-500 text-sm mb-3">{user?.email}</p>
              {user?.role !== 'customer' && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${user?.isVerified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {user?.isVerified ? '✓ Verified' : '⏳ Pending'}
                </span>
              )}
              <div className="mt-3">
                <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold capitalize bg-indigo-50 text-indigo-700">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h6 className="font-bold text-gray-900 text-sm">Account Information</h6>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="sk-label">Full Name</label>
                    <input
                      type="text"
                      className="sk-input"
                      value={isEditing ? formData.name : user?.name || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || /^[a-zA-Z\s]*$/.test(value)) {
                          setFormData({ ...formData, name: value })
                        }
                      }}
                      disabled={!isEditing}
                      placeholder="Your name"
                    />
                    {isEditing && <p className="text-gray-400 text-xs mt-1">Only letters and spaces allowed</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="sk-label">Email Address</label>
                    <input type="email" className="sk-input bg-gray-50" value={user?.email || ''} disabled />
                    <p className="text-gray-400 text-xs mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="sk-label">Phone Number</label>
                    <input
                      type="tel"
                      className="sk-input"
                      value={isEditing ? formData.phone : user?.phone || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setFormData({ ...formData, phone: value })
                      }}
                      disabled={!isEditing}
                      placeholder="Your phone number"
                      maxLength={10}
                    />
                    {isEditing && <p className="text-gray-400 text-xs mt-1">{formData.phone.length}/10 digits</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="sk-label">Account Type</label>
                    <input type="text" className="sk-input bg-gray-50 capitalize" value={user?.role || ''} disabled />
                    <p className="text-gray-400 text-xs mt-1">Role cannot be changed</p>
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="sk-label">Member Since</label>
                    <input
                      type="text"
                      className="sk-input bg-gray-50"
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                      disabled
                    />
                  </div>

                  {/* Verification Status */}
                  {user?.role !== 'customer' && (
                    <div>
                      <label className="sk-label">Verification Status</label>
                      <input
                        type="text"
                        className={`sk-input bg-gray-50 ${user?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}
                        value={user?.isVerified ? 'Verified ✓' : 'Pending Verification'}
                        disabled
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button type="button" className="sk-btn sk-btn-outline" onClick={cancelEdit} disabled={loading}>Cancel</button>
                    <button type="submit" className="sk-btn sk-btn-primary" disabled={loading}>
                      {loading ? (
                        <><span className="sk-spinner w-4 h-4 mr-2"></span> Saving...</>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h6 className="font-bold text-gray-900 text-sm">Security</h6>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800 mb-0.5">Password</p>
                  <p className="text-gray-500 text-sm">Last changed: Never</p>
                </div>
                <button className="sk-btn sk-btn-outline sk-btn-sm">Change Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
