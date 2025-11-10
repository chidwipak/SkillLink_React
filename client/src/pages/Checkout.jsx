import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Modal, Form, Button, Dropdown } from 'react-bootstrap'
import { updateUser } from '../store/slices/authSlice'

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  })
  const [orderData, setOrderData] = useState({
    shippingAddress: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    }
  })

  // Load saved addresses from user profile
  useEffect(() => {
    if (user) {
      const userAddresses = user.addresses || []
      // Also add the main address if it exists
      if (user.address && (user.address.street || user.address.city)) {
        const mainAddr = {
          ...user.address,
          label: user.address.label || 'Primary',
          isDefault: true
        }
        // Check if it's not already in addresses
        const exists = userAddresses.some(a => 
          a.street === mainAddr.street && a.city === mainAddr.city && a.pincode === mainAddr.pincode
        )
        if (!exists) {
          setAddresses([mainAddr, ...userAddresses])
        } else {
          setAddresses(userAddresses)
        }
      } else {
        setAddresses(userAddresses)
      }
    }
  }, [user])

  // Set default address on load
  useEffect(() => {
    if (addresses.length > 0 && selectedAddressIndex === -1) {
      const defaultIndex = addresses.findIndex(a => a.isDefault)
      if (defaultIndex >= 0) {
        setSelectedAddressIndex(defaultIndex)
        selectAddress(defaultIndex)
      } else {
        setSelectedAddressIndex(0)
        selectAddress(0)
      }
    }
  }, [addresses])

  const selectAddress = (index) => {
    if (index >= 0 && addresses[index]) {
      const addr = addresses[index]
      setOrderData({
        shippingAddress: {
          name: user?.name || '',
          phone: user?.phone || '',
          address: `${addr.street}${addr.landmark ? ', ' + addr.landmark : ''}`,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode
        }
      })
    }
  }

  const handleAddressSelect = (index) => {
    setSelectedAddressIndex(index)
    selectAddress(index)
  }

  const handleAddNewAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all address fields')
      return
    }

    try {
      const updatedAddresses = [...addresses, newAddress]
      
      // Save to backend
      const response = await api.put('/auth/profile', {
        addresses: updatedAddresses
      })

      if (response.data.user) {
        dispatch(updateUser(response.data.user))
      }

      setAddresses(updatedAddresses)
      setSelectedAddressIndex(updatedAddresses.length - 1)
      selectAddress(updatedAddresses.length - 1)
      setShowAddressModal(false)
      setNewAddress({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      })
      toast.success('Address added successfully')
    } catch (error) {
      console.error('Error adding address:', error)
      toast.error('Failed to add address')
    }
  }

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) {
          setCart(parsed)
        } else {
          navigate('/shop')
        }
      } catch (e) {
        navigate('/shop')
      }
    } else {
      navigate('/shop')
    }
  }, [])

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const deliveryFee = 50
  const platformFee = Math.round(getSubtotal() * 0.02) // 2% platform fee
  const total = getSubtotal() + deliveryFee + platformFee

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Map cart items to order format, handling different possible ID fields
      const items = cart.map(item => ({
        product: item._id || item.id || item.productId,
        quantity: item.quantity,
        price: item.price
      }))

      console.log('Placing order with items:', items)

      const response = await api.post('/orders', {
        items,
        shippingAddress: orderData.shippingAddress
      })

      toast.success('Order placed successfully!')
      localStorage.removeItem('cart')
      navigate(`/dashboard/customer/orders/${response.data.order._id}`)
    } catch (error) {
      console.error('Order error:', error.response?.data || error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Form */}
        <div className="md:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            
            {/* Address Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Delivery Address</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={selectedAddressIndex}
                  onChange={(e) => handleAddressSelect(parseInt(e.target.value))}
                >
                  <option value={-1}>-- Select an address --</option>
                  {addresses.map((addr, idx) => (
                    <option key={idx} value={idx}>
                      {addr.label || 'Address'}: {addr.street}, {addr.city} - {addr.pincode}
                      {addr.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="btn btn-outline px-4"
                >
                  + Add New
                </button>
              </div>
              {addresses.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No saved addresses. Add a new address or fill in the details below.
                </p>
              )}
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={orderData.shippingAddress.name}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      shippingAddress: { ...orderData.shippingAddress, name: e.target.value }
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={orderData.shippingAddress.phone}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      shippingAddress: { ...orderData.shippingAddress, phone: e.target.value }
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  required
                  rows="3"
                  value={orderData.shippingAddress.address}
                  onChange={(e) => setOrderData({
                    ...orderData,
                    shippingAddress: { ...orderData.shippingAddress, address: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="House no, Street, Landmark"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    required
                    value={orderData.shippingAddress.city}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      shippingAddress: { ...orderData.shippingAddress, city: e.target.value }
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    required
                    value={orderData.shippingAddress.state}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      shippingAddress: { ...orderData.shippingAddress, state: e.target.value }
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <input
                    type="text"
                    required
                    value={orderData.shippingAddress.pincode}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      shippingAddress: { ...orderData.shippingAddress, pincode: e.target.value }
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{getSubtotal()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee (2%)</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary-600">₹{total}</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>💳 Cash on Delivery available</p>
              <p>📦 Delivery in 3-5 business days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Address Label</Form.Label>
              <Form.Select
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Street Address *</Form.Label>
              <Form.Control
                type="text"
                placeholder="House no, Street name"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Landmark</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nearby landmark (optional)"
                value={newAddress.landmark || ''}
                onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
              />
            </Form.Group>
            <div className="grid grid-cols-2 gap-3">
              <Form.Group className="mb-3">
                <Form.Label>City *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>State *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  required
                />
              </Form.Group>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Pincode *</Form.Label>
              <Form.Control
                type="text"
                placeholder="6-digit pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Set as default address"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddNewAddress}>
            Save Address
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Checkout
