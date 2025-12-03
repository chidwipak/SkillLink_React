# 🚀 Complete Address & Profile Image Implementation Guide

## Components Created ✅

### 1. AddressModal.jsx
**Location**: `client/src/components/common/AddressModal.jsx`
- Modal for adding/editing single address
- Can be made mandatory (non-closable) for incomplete profiles
- Used by: Workers, Sellers, Delivery persons

### 2. MultipleAddressManager.jsx
**Location**: `client/src/components/common/MultipleAddressManager.jsx`
- Full address management with multiple addresses
- Add, edit, delete, set default
- Used by: Customers

### 3. Backend Updates ✅
**File**: `controllers/authControllerAPI.js`
- `updateProfile` function now handles:
  - Single address for workers/sellers/delivery
  - Multiple addresses array for customers
  - Profile picture updates with old image deletion

---

## Implementation Steps for Each Dashboard

### 🛒 CUSTOMER DASHBOARD

#### File: `client/src/pages/customer/CustomerProfile.jsx`

```jsx
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button, Form } from 'react-bootstrap'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { updateUser } from '../../store/slices/authSlice'
import AddressModal from '../../components/common/AddressModal'
import MultipleAddressManager from '../../components/common/MultipleAddressManager'
import ImageWithFallback from '../../components/common/ImageWithFallback'

const CustomerProfile = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePicture: null
  })
  const [preview, setPreview] = useState(user?.profilePicture || null)
  const [loading, setLoading] = useState(false)

  // Check if address is missing on component mount
  useEffect(() => {
    if (!user?.address || !user?.address?.street) {
      setShowAddressModal(true)
    }
  }, [user])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, profilePicture: file })
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('phone', formData.phone)
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture)
      }

      const response = await api.put('/auth/profile', submitData)
      
      if (response.data.success) {
        toast.success('Profile updated successfully!')
        dispatch(updateUser(response.data.user))
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressesSaved = (updatedAddresses) => {
    dispatch(updateUser({ addresses: updatedAddresses }))
  }

  return (
    <div className="container-fluid">
      <h2 className="mb-4">My Profile</h2>

      {/* Address Warning */}
      {(!user?.address || !user?.address?.street) && (
        <div className="alert alert-warning mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Profile Incomplete!</strong> Please add your address to continue.
        </div>
      )}

      <div className="row">
        {/* Profile Information Card */}
        <div className="col-md-6 mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Profile Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Profile Picture */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <div 
                      style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid #ddd'
                      }}
                    >
                      {preview ? (
                        <ImageWithFallback
                          src={preview}
                          alt="Profile"
                          type="user"
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                          <i className="fas fa-user fa-4x text-muted"></i>
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="profilePictureInput" 
                      className="btn btn-primary btn-sm position-absolute"
                      style={{ bottom: '0', right: '0', borderRadius: '50%', width: '40px', height: '40px' }}
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
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={loading} className="w-100">
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>

        {/* Addresses Card */}
        <div className="col-md-6 mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Addresses</h5>
            </Card.Header>
            <Card.Body>
              <MultipleAddressManager 
                addresses={user?.addresses || []}
                onAddressesUpdated={handleAddressesSaved}
              />
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Address Modal - Non-closable if address missing */}
      <AddressModal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        onAddressSaved={(address) => {
          dispatch(updateUser({ address }))
          setShowAddressModal(false)
        }}
        canClose={user?.address && user?.address?.street}
      />
    </div>
  )
}

export default CustomerProfile
```

---

### 🔧 WORKER DASHBOARD

#### File: `client/src/pages/worker/WorkerProfile.jsx`

```jsx
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button, Form } from 'react-bootstrap'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { updateUser } from '../../store/slices/authSlice'
import AddressModal from '../../components/common/AddressModal'
import ImageWithFallback from '../../components/common/ImageWithFallback'

const WorkerProfile = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePicture: null
  })
  const [preview, setPreview] = useState(user?.profilePicture || null)
  const [loading, setLoading] = useState(false)

  // Check if address is missing on component mount
  useEffect(() => {
    if (!user?.address || !user?.address?.street) {
      setShowAddressModal(true)
    }
  }, [user])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, profilePicture: file })
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('phone', formData.phone)
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture)
      }

      const response = await api.put('/auth/profile', submitData)
      
      if (response.data.success) {
        toast.success('Profile updated successfully!')
        dispatch(updateUser(response.data.user))
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Worker Profile</h2>

      {/* Address Warning */}
      {(!user?.address || !user?.address?.street) && (
        <div className="alert alert-warning mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Profile Incomplete!</strong> Please add your address to accept bookings.
        </div>
      )}

      <div className="row">
        <div className="col-md-8 mx-auto">
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Profile Picture */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <div 
                      style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid #ddd'
                      }}
                    >
                      {preview ? (
                        <ImageWithFallback
                          src={preview}
                          alt="Profile"
                          type="user"
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                          <i className="fas fa-user fa-4x text-muted"></i>
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="profilePictureInput" 
                      className="btn btn-primary btn-sm position-absolute"
                      style={{ bottom: '0', right: '0', borderRadius: '50%', width: '40px', height: '40px' }}
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
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </Form.Group>

                {/* Current Address Display */}
                {user?.address && user?.address?.street && (
                  <Form.Group className="mb-3">
                    <Form.Label>Current Address</Form.Label>
                    <div className="p-3 bg-light rounded">
                      <p className="mb-1">{user.address.street}</p>
                      <p className="mb-0">{user.address.city}, {user.address.state} {user.address.zipCode}</p>
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowAddressModal(true)}
                    >
                      Update Address
                    </Button>
                  </Form.Group>
                )}

                <Button type="submit" variant="primary" disabled={loading} className="w-100">
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        onAddressSaved={(address) => {
          dispatch(updateUser({ address }))
          setShowAddressModal(false)
        }}
        existingAddress={user?.address}
        canClose={user?.address && user?.address?.street}
      />
    </div>
  )
}

export default WorkerProfile
```

**Apply the same pattern for**:
- `client/src/pages/seller/SellerProfile.jsx`
- `client/src/pages/delivery/DeliveryProfile.jsx`

---

### 📦 BOOKING/ORDER FORMS - Address Selection

#### ServiceDetail.jsx - Update booking form

```jsx
// Add this import
import { Form } from 'react-bootstrap'

// In the booking form section, add address selection:
<Form.Group className="mb-3">
  <Form.Label>Service Address *</Form.Label>
  {user?.addresses && user.addresses.length > 0 ? (
    <>
      <Form.Select 
        value={selectedAddress}
        onChange={(e) => {
          if (e.target.value === 'new') {
            setShowNewAddressForm(true)
            setSelectedAddress('')
          } else {
            setShowNewAddressForm(false)
            setSelectedAddress(e.target.value)
          }
        }}
        required
      >
        <option value="">Select an address</option>
        {user.addresses.map((addr, index) => (
          <option key={index} value={index}>
            {addr.label ? `${addr.label} - ` : ''}{addr.street}, {addr.city}
          </option>
        ))}
        <option value="new">+ Add New Address</option>
      </Form.Select>
      
      {showNewAddressForm && (
        <div className="mt-3 p-3 border rounded">
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              placeholder="Street Address"
              value={newAddress.street}
              onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
              required
            />
          </Form.Group>
          <div className="row">
            <div className="col-6">
              <Form.Control
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                required
              />
            </div>
            <div className="col-6">
              <Form.Control
                type="text"
                placeholder="ZIP Code"
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                required
              />
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <div>
      <p className="text-muted small">No saved addresses found</p>
      <Form.Control
        type="text"
        placeholder="Enter service address"
        value={manualAddress}
        onChange={(e) => setManualAddress(e.target.value)}
        required
      />
    </div>
  )}
</Form.Group>
```

---

### 🚚 DELIVERY DASHBOARD - Show Both Addresses

#### DeliveryAssignments.jsx

```jsx
// In the order/assignment card, display both addresses:
<Card.Body>
  <h6>Delivery Details</h6>
  
  {/* Pickup Address (Seller) */}
  <div className="mb-3">
    <strong className="text-primary">📦 Pickup From:</strong>
    <div className="ms-3">
      <p className="mb-0"><strong>{order.seller?.businessName || 'Seller'}</strong></p>
      {order.seller?.user?.address && (
        <>
          <p className="mb-0 small">{order.seller.user.address.street}</p>
          <p className="mb-0 small">{order.seller.user.address.city}, {order.seller.user.address.state} {order.seller.user.address.zipCode}</p>
          {order.seller.user.phone && (
            <p className="mb-0 small">📞 {order.seller.user.phone}</p>
          )}
        </>
      )}
    </div>
  </div>

  {/* Delivery Address (Customer) */}
  <div className="mb-3">
    <strong className="text-success">🏠 Deliver To:</strong>
    <div className="ms-3">
      <p className="mb-0"><strong>{order.customer?.name || 'Customer'}</strong></p>
      {order.deliveryAddress ? (
        <>
          <p className="mb-0 small">{order.deliveryAddress.street}</p>
          <p className="mb-0 small">{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
        </>
      ) : order.customer?.address && (
        <>
          <p className="mb-0 small">{order.customer.address.street}</p>
          <p className="mb-0 small">{order.customer.address.city}, {order.customer.address.state} {order.customer.address.zipCode}</p>
        </>
      )}
      {order.customer?.phone && (
        <p className="mb-0 small">📞 {order.customer.phone}</p>
      )}
    </div>
  </div>

  <Button 
    variant="success" 
    onClick={() => handleAcceptDelivery(order._id)}
    className="w-100"
  >
    Accept Delivery
  </Button>
</Card.Body>
```

---

## Backend Updates Required

### Update Order/Booking Models

#### models/Order.js
```javascript
// Add deliveryAddress field
deliveryAddress: {
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String
},
```

#### models/Booking.js
```javascript
// Add serviceAddress field
serviceAddress: {
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String
},
```

### Update Controllers to Populate Addresses

#### controllers/orderControllerAPI.js
```javascript
// In getAllOrders, getOrderById, etc.
.populate({
  path: 'customer',
  select: 'name email phone address',
})
.populate({
  path: 'seller',
  select: 'businessName user',
  populate: {
    path: 'user',
    select: 'name phone address'
  }
})
```

#### controllers/deliveryControllerAPI.js
```javascript
// Same population strategy for delivery assignments
.populate({
  path: 'order',
  populate: [
    {
      path: 'customer',
      select: 'name phone address'
    },
    {
      path: 'seller',
      populate: {
        path: 'user',
        select: 'name phone address'
      }
    }
  ]
})
```

---

## Testing Checklist

- [ ] Customer can add multiple addresses
- [ ] Customer can set default address
- [ ] Customer sees address selection in booking/order forms
- [ ] Worker prompted for address on first login
- [ ] Worker can update address anytime
- [ ] Worker sees customer address in booking requests
- [ ] Seller prompted for address on first login
- [ ] Seller can update address and shop images
- [ ] Delivery person sees both pickup and delivery addresses
- [ ] Profile pictures upload and display correctly
- [ ] Profile picture changes reflect immediately
- [ ] All dashboards show updated images after edit

---

## Quick Start

1. **Restart servers**:
```bash
npm run dev
```

2. **Test flow**:
   - Register new user → Upload profile pic
   - Login → See address prompt
   - Add address → Verify saved
   - Book service → See address selection
   - Check worker dashboard → See customer address

---

**Status**: Components created ✅, Backend updated ✅, Implementation guide complete ✅

Now you need to apply these patterns to each dashboard profile page!
