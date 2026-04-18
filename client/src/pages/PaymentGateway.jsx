import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCelebration } from '../contexts/CelebrationContext'
import toast from 'react-hot-toast'
import api from '../services/api'

const PaymentGateway = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { celebrate } = useCelebration()
  const { orderData, orderType } = location.state || {}
  
  const [selectedMethod, setSelectedMethod] = useState('')
  const [processing, setProcessing] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  })
  const [upiId, setUpiId] = useState('')
  const [selectedBank, setSelectedBank] = useState('')

  useEffect(() => {
    if (!orderData) {
      toast.error('No order data found')
      navigate('/shop')
    }
  }, [orderData, navigate])

  const paymentMethods = [
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: 'fa-credit-card',
      description: 'Visa, Mastercard, Rupay'
    },
    { 
      id: 'upi', 
      name: 'UPI', 
      icon: 'fa-mobile-alt',
      description: 'Google Pay, PhonePe, Paytm'
    },
    { 
      id: 'netbanking', 
      name: 'Net Banking', 
      icon: 'fa-university',
      description: 'All major banks'
    },
    { 
      id: 'wallet', 
      name: 'Wallets', 
      icon: 'fa-wallet',
      description: 'Paytm, PhonePe, Amazon Pay'
    },
    { 
      id: 'cod', 
      name: 'Cash on Delivery', 
      icon: 'fa-money-bill-wave',
      description: 'Pay when you receive'
    }
  ]

  const banks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
    'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank'
  ]

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method')
      return
    }

    // Validate based on payment method
    if (selectedMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardName || 
          !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
        toast.error('Please fill all card details')
        return
      }
      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Invalid card number')
        return
      }
      if (cardDetails.cvv.length !== 3) {
        toast.error('Invalid CVV')
        return
      }
    } else if (selectedMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID')
        return
      }
    } else if (selectedMethod === 'netbanking') {
      if (!selectedBank) {
        toast.error('Please select a bank')
        return
      }
    }

    setProcessing(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Place the order with payment info
      const response = await api.post('/orders', {
        ...orderData,
        paymentMethod: selectedMethod,
        paymentStatus: selectedMethod === 'cod' ? 'pending' : 'completed'
      })

      // Clear cart after successful order
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cartUpdated'))

      toast.success('Payment successful! Order placed.')
      celebrate({ count: 200 })
      navigate('/dashboard/customer/orders', { 
        replace: true,
        state: { newOrder: response.data.order }
      })
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  if (!orderData) return null

  const totalAmount = orderData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 page-enter">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              Secure Payment
            </h1>
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Order Total</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₹{totalAmount.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{orderData.items?.length || 0} items</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Encrypted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Select Payment Method</h2>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                  selectedMethod === method.id
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      selectedMethod === method.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {method.id === 'card' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
                        {method.id === 'upi' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />}
                        {method.id === 'netbanking' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                        {method.id === 'wallet' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />}
                        {method.id === 'cod' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />}
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{method.name}</h3>
                      <p className="text-xs text-gray-400">{method.description}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedMethod === method.id ? 'border-indigo-600' : 'border-gray-300'
                  }`}>
                    {selectedMethod === method.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details Form */}
        {selectedMethod && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 fade-in-up visible">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Payment Details</h2>

            {/* Card Payment Form */}
            {selectedMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="sk-label">Card Number</label>
                  <input type="text" maxLength="19" value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                    placeholder="1234 5678 9012 3456" className="sk-input" />
                </div>
                <div>
                  <label className="sk-label">Cardholder Name</label>
                  <input type="text" value={cardDetails.cardName}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value.toUpperCase() })}
                    placeholder="JOHN DOE" className="sk-input" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="sk-label">Month</label>
                    <select value={cardDetails.expiryMonth}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiryMonth: e.target.value })}
                      className="sk-input">
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>{month.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="sk-label">Year</label>
                    <select value={cardDetails.expiryYear}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiryYear: e.target.value })}
                      className="sk-input">
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => 2025 + i).map(year => (
                        <option key={year} value={year.toString().slice(-2)}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="sk-label">CVV</label>
                    <input type="password" maxLength="3" value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                      placeholder="123" className="sk-input" />
                  </div>
                </div>
              </div>
            )}

            {/* UPI */}
            {selectedMethod === 'upi' && (
              <div>
                <label className="sk-label">UPI ID</label>
                <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                  placeholder="yourname@upi" className="sk-input" />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  You'll receive a payment request on your UPI app
                </p>
              </div>
            )}

            {/* Net Banking */}
            {selectedMethod === 'netbanking' && (
              <div>
                <label className="sk-label">Select Your Bank</label>
                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="sk-input">
                  <option value="">Choose a bank</option>
                  {banks.map((bank) => (<option key={bank} value={bank}>{bank}</option>))}
                </select>
              </div>
            )}

            {/* Wallet */}
            {selectedMethod === 'wallet' && (
              <div className="text-center py-6">
                <div className="inline-flex gap-6">
                  {[{ name: 'Paytm', color: 'blue' }, { name: 'PhonePe', color: 'purple' }, { name: 'Amazon', color: 'orange' }].map(w => (
                    <div key={w.name} className="text-center cursor-pointer hover:scale-110 transition-transform">
                      <div className={`w-16 h-16 bg-${w.color}-50 rounded-2xl flex items-center justify-center mb-2 border border-${w.color}-100`}>
                        <svg className={`w-7 h-7 text-${w.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-xs font-medium text-gray-600">{w.name}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4">You'll be redirected to your wallet app</p>
              </div>
            )}

            {/* COD */}
            {selectedMethod === 'cod' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">Cash on Delivery</h4>
                    <p className="text-xs text-gray-600">
                      Please keep exact change handy. Our delivery partner will collect ₹{totalAmount.toFixed(2)} at delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Badge */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
            {[
              { label: '100% Secure', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { label: 'SSL Encrypted', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              { label: 'Trusted Payment', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={b.icon} /></svg>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button onClick={() => navigate(-1)} disabled={processing}
            className="sk-btn sk-btn-outline flex-1 py-3.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
          <button onClick={handlePayment} disabled={!selectedMethod || processing}
            className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {processing ? (
              <><span className="sk-spinner w-5 h-5"></span> Processing...</>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pay ₹{totalAmount.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentGateway
