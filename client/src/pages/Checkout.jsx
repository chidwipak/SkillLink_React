import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '../services/api'
import toast from 'react-hot-toast'
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

    // Validate we have items with proper structure
    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty')
      navigate('/shop')
      return
    }

    // Validate and filter cart items
    const validItems = []
    const invalidItems = []

    cart.forEach(item => {
      const productId = item._id || item.id || item.productId
      
      // Validate productId exists and looks like a valid MongoDB ObjectId (24 hex chars)
      if (!productId || typeof productId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(productId)) {
        console.error('Invalid product ID in cart:', item)
        invalidItems.push(item)
      } else {
        validItems.push({
          product: productId,
          quantity: item.quantity || 1,
          price: item.price
        })
      }
    })

    // If there are invalid items, remove them and show error
    if (invalidItems.length > 0) {
      const newCart = cart.filter(item => {
        const productId = item._id || item.id || item.productId
        return productId && typeof productId === 'string' && /^[0-9a-fA-F]{24}$/.test(productId)
      })
      
      setCart(newCart)
      localStorage.setItem('cart', JSON.stringify(newCart))
      
      toast.error(`${invalidItems.length} invalid item(s) removed from cart. Please add products from product detail page.`)
      return
    }

    if (validItems.length === 0) {
      toast.error('No valid items in cart')
      navigate('/shop')
      return
    }

    // Navigate to payment gateway with order data
    navigate('/payment', {
      state: {
        orderData: {
          items: validItems,
          shippingAddress: orderData.shippingAddress
        },
        orderType: 'product'
      }
    })
  }

  if (cart.length === 0) {
    return (
      <div className="sk-empty-state" style={{ minHeight: '60vh' }}>
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/shop')} className="sk-btn sk-btn-primary">Continue Shopping</button>
      </div>
    )
  }

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Shipping Address</h2>

            {/* Address Selection */}
            <div className="mb-5">
              <label className="sk-label">Select Delivery Address</label>
              <div className="flex gap-2">
                <select
                  className="sk-input flex-1"
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
                <button type="button" onClick={() => setShowAddressModal(true)} className="sk-btn sk-btn-outline">+ Add New</button>
              </div>
              {addresses.length === 0 && (
                <p className="text-sm text-gray-400 mt-1">No saved addresses. Add a new address or fill in the details below.</p>
              )}
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="sk-label">Full Name</label>
                  <input type="text" required value={orderData.shippingAddress.name}
                    onChange={(e) => setOrderData({ ...orderData, shippingAddress: { ...orderData.shippingAddress, name: e.target.value } })}
                    className="sk-input" />
                </div>
                <div>
                  <label className="sk-label">Phone Number</label>
                  <input type="tel" required value={orderData.shippingAddress.phone}
                    onChange={(e) => setOrderData({ ...orderData, shippingAddress: { ...orderData.shippingAddress, phone: e.target.value } })}
                    className="sk-input" />
                </div>
              </div>

              <div>
                <label className="sk-label">Address</label>
                <textarea required rows="3" value={orderData.shippingAddress.address}
                  onChange={(e) => setOrderData({ ...orderData, shippingAddress: { ...orderData.shippingAddress, address: e.target.value } })}
                  className="sk-input" placeholder="House no, Street, Landmark" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="sk-label">City</label>
                  <input type="text" required value={orderData.shippingAddress.city}
                    onChange={(e) => setOrderData({ ...orderData, shippingAddress: { ...orderData.shippingAddress, city: e.target.value } })}
                    className="sk-input" />
                </div>
                <div>
                  <label className="sk-label">State</label>
                  <input type="text" required value={orderData.shippingAddress.state}
                    onChange={(e) => setOrderData({ ...orderData, shippingAddress: { ...orderData.shippingAddress, state: e.target.value } })}
                    className="sk-input" />
                </div>
                <div>
                  <label className="sk-label">Pincode</label>
                  <input type="text" required value={orderData.shippingAddress.pincode}
                    onChange={(e) => setOrderData({ ...orderData, shippingAddress: { ...orderData.shippingAddress, pincode: e.target.value } })}
                    className="sk-input" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="sk-btn sk-btn-primary w-full disabled:opacity-50 mt-2">
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.name} x {item.quantity}</span>
                  <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{getSubtotal()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platform Fee (2%)</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₹{total}</span>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-sm text-gray-500">
              <p className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Secure payment</p>
              <p className="flex items-center gap-2"><svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> Delivery in 3-5 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="sk-modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="sk-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Add New Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="sk-label">Address Label</label>
                <select className="sk-input" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="sk-label">Street Address *</label>
                <input type="text" className="sk-input" placeholder="House no, Street name" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} required />
              </div>
              <div>
                <label className="sk-label">Landmark</label>
                <input type="text" className="sk-input" placeholder="Nearby landmark (optional)" value={newAddress.landmark || ''} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="sk-label">City *</label>
                  <input type="text" className="sk-input" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
                </div>
                <div>
                  <label className="sk-label">State *</label>
                  <input type="text" className="sk-input" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="sk-label">Pincode *</label>
                <input type="text" className="sk-input" placeholder="6-digit pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
                Set as default address
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button className="sk-btn sk-btn-outline" onClick={() => setShowAddressModal(false)}>Cancel</button>
              <button className="sk-btn sk-btn-primary" onClick={handleAddNewAddress}>Save Address</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Checkout
