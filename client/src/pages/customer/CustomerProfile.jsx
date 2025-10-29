import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button, Form, Modal } from 'react-bootstrap'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { updateUser } from '../../store/slices/authSlice'
import ImageWithFallback from '../../components/common/ImageWithFallback'

const CustomerProfile = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [profileImage, setProfileImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Address states
  const [addresses, setAddresses] = useState([])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressFormData, setAddressFormData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  })
  const [addressRequired, setAddressRequired] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
      setPreview(user.profilePicture)
      setAddresses(user.addresses || [])
      
      // Check if address is missing
      if (!user.address || !user.address.street) {
        setAddressRequired(true)
        setShowAddressModal(true)
      }
    }
  }, [user])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setProfileImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('phone', formData.phone)
      if (profileImage) {
        submitData.append('profilePicture', profileImage)
      }

      const response = await api.put('/auth/profile', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        toast.success('Profile updated successfully!')
        dispatch(updateUser(response.data.user))
        setProfileImage(null)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Address management functions
  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address)
      setAddressFormData({
        label: address.label || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || 'India',
        isDefault: address.isDefault || false
      })
    } else {
      setEditingAddress(null)
      setAddressFormData({
        label: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: addresses.length === 0
      })
    }
    setShowAddressModal(true)
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    
    if (!addressFormData.street || !addressFormData.city || !addressFormData.state || !addressFormData.zipCode) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      let updatedAddresses = [...addresses]
      
      if (editingAddress) {
        // Update existing address
        const index = updatedAddresses.findIndex(a => 
          a.street === editingAddress.street && a.city === editingAddress.city
        )
        if (index !== -1) {
          updatedAddresses[index] = { ...addressFormData }
        }
      } else {
        // Add new address
        updatedAddresses.push({ ...addressFormData })
      }

      // If this is set as default, remove default from others
      if (addressFormData.isDefault) {
        updatedAddresses = updatedAddresses.map((addr, idx) => ({
          ...addr,
          isDefault: addr === addressFormData || 
            (editingAddress && addr.street === editingAddress.street ? addressFormData.isDefault : false) ||
            (!editingAddress && idx === updatedAddresses.length - 1)
        }))
      }

      // Ensure at least one default
      if (!updatedAddresses.some(a => a.isDefault) && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true
      }

      const response = await api.put('/auth/profile', {
        addresses: updatedAddresses
      })

      if (response.data.success) {
        toast.success(editingAddress ? 'Address updated!' : 'Address added!')
        setAddresses(updatedAddresses)
        dispatch(updateUser(response.data.user))
        setShowAddressModal(false)
        setAddressRequired(false)
        setEditingAddress(null)
      }
    } catch (error) {
      console.error('Address save error:', error)
      toast.error(error.response?.data?.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressToDelete) => {
    if (addresses.length <= 1) {
      toast.error('You need at least one address')
      return
    }

    const confirmed = window.confirm('Are you sure you want to delete this address?')
    if (!confirmed) return

    setLoading(true)
    try {
      let updatedAddresses = addresses.filter(a => 
        !(a.street === addressToDelete.street && a.city === addressToDelete.city)
      )

      // If deleted was default, set first as default
      if (addressToDelete.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true
      }

      const response = await api.put('/auth/profile', {
        addresses: updatedAddresses
      })

      if (response.data.success) {
        toast.success('Address deleted!')
        setAddresses(updatedAddresses)
        dispatch(updateUser(response.data.user))
      }
    } catch (error) {
      console.error('Delete address error:', error)
      toast.error('Failed to delete address')
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (addressToSetDefault) => {
    setLoading(true)
    try {
      const updatedAddresses = addresses.map(a => ({
        ...a,
        isDefault: a.street === addressToSetDefault.street && a.city === addressToSetDefault.city
      }))

      const response = await api.put('/auth/profile', {
        addresses: updatedAddresses
      })

      if (response.data.success) {
        toast.success('Default address updated!')
        setAddresses(updatedAddresses)
        dispatch(updateUser(response.data.user))
      }
    } catch (error) {
      console.error('Set default error:', error)
      toast.error('Failed to update default address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4 fw-semibold">My Profile</h4>

      {/* Address Warning Alert */}
      {(!user?.address || !user?.address?.street) && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <span className="me-2">⚠️</span>
          <div>
            <strong>Profile Incomplete!</strong> Please add your address to book services and place orders.
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Profile Information Card */}
        <div className="col-lg-6">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent py-3">
              <h5 className="mb-0 fw-semibold">Profile Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileSubmit}>
                {/* Profile Picture */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <div 
                      className="rounded-circle overflow-hidden mx-auto"
                      style={{
                        width: '120px',
                        height: '120px',
                        border: '3px solid #e2e8f0'
                      }}
                    >
                      {preview ? (
                        <ImageWithFallback
                          src={preview}
                          alt={user?.name}
                          type="user"
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                          <i className="fas fa-user fa-3x text-muted"></i>
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="profilePictureInput" 
                      className="btn btn-primary btn-sm position-absolute rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        bottom: '0', 
                        right: '0', 
                        width: '36px', 
                        height: '36px',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fas fa-camera"></i>
                    </label>
                    <input
                      type="file"
                      id="profilePictureInput"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {profileImage && (
                    <div className="mt-2">
                      <small className="text-success">New image selected</small>
                    </div>
                  )}
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading} 
                  className="w-100"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>

        {/* Addresses Card */}
        <div className="col-lg-6">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">My Addresses</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => openAddressModal(null)}
              >
                <i className="fas fa-plus me-1"></i> Add New
              </Button>
            </Card.Header>
            <Card.Body>
              {addresses.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                  <p className="text-muted mb-3">No addresses saved yet</p>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => openAddressModal(null)}
                  >
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="row g-3">
                  {addresses.map((address, index) => (
                    <div key={index} className="col-12">
                      <div className={`border rounded p-3 ${address.isDefault ? 'border-primary bg-primary bg-opacity-10' : ''}`}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold">
                              {address.label || `Address ${index + 1}`}
                            </span>
                            {address.isDefault && (
                              <span className="badge bg-primary">Default</span>
                            )}
                          </div>
                          <div className="d-flex gap-1">
                            {!address.isDefault && (
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleSetDefault(address)}
                                disabled={loading}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => openAddressModal(address)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteAddress(address)}
                              disabled={loading || addresses.length <= 1}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </div>
                        <p className="mb-1 small">{address.street}</p>
                        <p className="mb-0 text-muted small">
                          {address.city}, {address.state} - {address.zipCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Address Modal */}
      <Modal 
        show={showAddressModal} 
        onHide={addressRequired ? null : () => setShowAddressModal(false)}
        backdrop={addressRequired ? 'static' : true}
        keyboard={!addressRequired}
        centered
      >
        <Modal.Header closeButton={!addressRequired}>
          <Modal.Title>
            {addressRequired && <span className="text-warning me-2">⚠️</span>}
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {addressRequired && (
            <div className="alert alert-warning mb-3">
              <strong>Address Required!</strong><br />
              Please add your address to use the platform features.
            </div>
          )}
          <Form onSubmit={handleAddressSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Address Label (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Home, Work, Office"
                value={addressFormData.label}
                onChange={(e) => setAddressFormData({ ...addressFormData, label: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Street Address *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter street address"
                value={addressFormData.street}
                onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                required
              />
            </Form.Group>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <Form.Label>City *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="City"
                  value={addressFormData.city}
                  onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <Form.Label>State *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="State"
                  value={addressFormData.state}
                  onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <Form.Label>ZIP Code *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="ZIP Code"
                  value={addressFormData.zipCode}
                  onChange={(e) => setAddressFormData({ ...addressFormData, zipCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  required
                  maxLength={6}
                />
              </div>
              <div className="col-6">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  value={addressFormData.country}
                  onChange={(e) => setAddressFormData({ ...addressFormData, country: e.target.value })}
                />
              </div>
            </div>

            {addresses.length > 0 && (
              <Form.Check
                type="checkbox"
                label="Set as default address"
                checked={addressFormData.isDefault}
                onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                className="mb-3"
              />
            )}

            <div className="d-flex gap-2">
              {!addressRequired && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowAddressModal(false)}
                  className="flex-grow-1"
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
                className="flex-grow-1"
              >
                {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default CustomerProfile
