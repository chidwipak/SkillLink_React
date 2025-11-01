import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import '../../styles/auth.css'

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Get email from location state or localStorage
    const stateEmail = location.state?.email
    const storedEmail = localStorage.getItem('pendingVerificationEmail')
    
    if (stateEmail) {
      setEmail(stateEmail)
      localStorage.setItem('pendingVerificationEmail', stateEmail)
    } else if (storedEmail) {
      setEmail(storedEmail)
    }
    
    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [location.state])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
      setOtp(newOtp)
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const otpString = otp.join('')
    
    if (!email) {
      toast.error('Email not found. Please register again.')
      navigate('/register')
      return
    }
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }

    setIsLoading(true)

    try {
      await api.post('/auth/verify-email', { email, otp: otpString })
      toast.success('Email verified successfully! 🎉')
      localStorage.removeItem('pendingVerificationEmail')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found. Please register again.')
      navigate('/register')
      return
    }

    setResendLoading(true)
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('New OTP sent to your email!')
      setCountdown(60) // 60 seconds countdown
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      
      <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
        <div className="row justify-content-center w-100">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <div className="auth-card p-4 p-md-5">
              {/* Success Icon */}
              <div className="text-center mb-4">
                <div className="auth-logo mx-auto" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <span>📧</span>
                </div>
              </div>
              
              {/* Title */}
              <h1 className="auth-title text-center">Verify Email</h1>
              <p className="auth-subtitle text-center mb-2">
                Enter the 6-digit code sent to
              </p>
              {email && (
                <p className="text-center mb-4" style={{ color: '#3b82f6', fontSize: '0.95rem', fontWeight: '500' }}>
                  {email}
                </p>
              )}

              <form onSubmit={handleSubmit}>
                {/* OTP Input Boxes */}
                <div className="d-flex justify-content-center gap-2 mb-4" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => inputRefs.current[index] = el}
                      type="text"
                      maxLength="1"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      style={{
                        width: '50px',
                        height: '60px',
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        background: '#f8fafc',
                        border: digit ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                        borderRadius: '12px',
                        color: '#1e293b',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = digit ? '#3b82f6' : '#e2e8f0'}
                    />
                  ))}
                </div>

                {/* Timer info */}
                <p className="text-center mb-4" style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  OTP expires in <span style={{ color: '#f59e0b', fontWeight: '600' }}>10 minutes</span>
                </p>

                {/* Verify Button */}
                <button 
                  type="submit" 
                  className="auth-btn auth-btn-primary"
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center mt-4">
                  <span style={{ color: '#64748b' }}>Didn't receive the code? </span>
                  {countdown > 0 ? (
                    <span style={{ color: '#3b82f6', fontWeight: '500' }}>
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="auth-link fw-semibold"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {resendLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  )}
                </div>

                {/* Back to Register */}
                <div className="text-center mt-3">
                  <Link to="/register" className="auth-link" style={{ fontSize: '0.85rem' }}>
                    ← Back to Register
                  </Link>
                </div>
              </form>
            </div>

            {/* Footer */}
            <p className="auth-footer">
              © 2025 SkillLink. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
