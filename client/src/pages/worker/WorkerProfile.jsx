import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button, Form, Modal } from 'react-bootstrap'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { updateUser } from '../../store/slices/authSlice'
import ImageWithFallback from '../../components/common/ImageWithFallback'

const WorkerProfile = () => {
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
  
  // Address state
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressRequired, setAddressRequired] = useState(false)
  const [addressFormData, setAddressFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
      setPreview(user.profilePicture)
      
      if (user.address) {
        setAddressFormData({
          street: user.address.street || '',
          city: user.address.city || '',
          state: user.address.state || '',
          zipCode: user.address.zipCode || '',
          country: user.address.country || 'India'
        })
      }
      
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

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    
    if (!addressFormData.street || !addressFormData.city || !addressFormData.state || !addressFormData.zipCode) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await api.put('/auth/profile', {
        address: addressFormData
      })

      if (response.data.success) {
        toast.success('Address saved successfully!')
        dispatch(updateUser(response.data.user))
        setShowAddressModal(false)
        setAddressRequired(false)
      }
    } catch (error) {
      console.error('Address save error:', error)
      toast.error(error.response?.data?.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4 fw-semibold">Worker Profile</h4>

      {/* Address Warning Alert */}
      {(!user?.address || !user?.address?.street) && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <span className="me-2">⚠️</span>
          <div>
            <strong>Profile Incomplete!</strong> Please add your address to receive bookings in your area.
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
                          type="worker"
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                          <i className="fas fa-user-hard-hat fa-3x text-muted"></i>
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

        {/* Address Card */}
        <div className="col-lg-6">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Service Area Address</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowAddressModal(true)}
              >
                <i className="fas fa-edit me-1"></i> Edit
              </Button>
            </Card.Header>
            <Card.Body>
              {user?.address && user?.address?.street ? (
                <div className="border rounded p-4">
                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Current Address</h6>
                      <p className="mb-1">{user.address.street}</p>
                      <p className="text-muted mb-0">
                        {user.address.city}, {user.address.state} - {user.address.zipCode}
                      </p>
                      {user.address.country && (
                        <p className="text-muted mb-0 small">{user.address.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                  <p className="text-muted mb-3">No address saved yet</p>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setShowAddressModal(true)}
                  >
                    Add Your Address
                  </Button>
                </div>
              )}

              <div className="alert alert-info mt-4 mb-0 small">
                <i className="fas fa-info-circle me-2"></i>
                Your address helps customers in your area find you for local services.
              </div>
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
            {user?.address?.street ? 'Update Address' : 'Add Your Address'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {addressRequired && (
            <div className="alert alert-warning mb-3">
              <strong>Address Required!</strong><br />
              Please add your address to receive service bookings in your area.
            </div>
          )}
          <Form onSubmit={handleAddressSubmit}>
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
                {loading ? 'Saving...' : 'Save Address'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default WorkerProfile
