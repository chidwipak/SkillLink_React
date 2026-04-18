import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../store/slices/authSlice'
import { useCelebration } from '../../contexts/CelebrationContext'
import toast from 'react-hot-toast'
import '../../styles/auth.css'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [verificationModal, setVerificationModal] = useState(null)
  const { isLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { celebrate } = useCelebration()

  // Real-time validation
  useEffect(() => {
    const newErrors = {}
    
    // Email validation
    if (touched.email) {
      if (!formData.email) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }
    
    // Password validation
    if (touched.password && !formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
  }, [formData, touched])

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({ email: true, password: true })
    
    // Validate before submit
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    
    try {
      await dispatch(login(formData)).unwrap()
      celebrate({ count: 200 })
      toast.success('Welcome back! 🎉')
      navigate('/dashboard')
    } catch (error) {
      if (error?.verification_status === 'Pending') {
        setVerificationModal({
          type: 'pending',
          message: 'Your account is pending approval. Please wait until it is approved by the verifier.',
        })
      } else if (error?.verification_status === 'Rejected') {
        setVerificationModal({
          type: 'rejected',
          message: error.message || 'Your account was rejected. Please register again with valid details.',
          feedback: error.rejection_feedback,
        })
      } else {
        toast.error(error?.message || error || 'Login failed. Please check your credentials.')
      }
    }
  }

  const getInputClassName = (field) => {
    let className = 'auth-input'
    if (touched[field]) {
      if (errors[field]) {
        className += ' is-invalid'
      } else if (formData[field]) {
        className += ' is-valid'
      }
    }
    return className
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="auth-logo mx-auto">
            <span>🔧</span>
          </div>
        </div>
        
        {/* Title */}
        <h1 className="auth-title text-center">Welcome Back</h1>
        <p className="auth-subtitle text-center mb-4">
          Sign in to continue to SkillLink
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="auth-input-group">
            <span className="auth-icon">📧</span>
            <input
              type="email"
              className={getInputClassName('email')}
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={() => handleBlur('email')}
              autoComplete="email"
            />
            <label className="auth-label">Email address</label>
            {touched.email && errors.email && (
              <div className="validation-message error">
                <span>⚠️</span> {errors.email}
              </div>
            )}
            {touched.email && !errors.email && formData.email && (
              <div className="validation-message success">
                <span>✓</span> Valid email
              </div>
            )}
          </div>

          {/* Password Input */}
          <div className="auth-input-group">
            <span className="auth-icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              className={getInputClassName('password')}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onBlur={() => handleBlur('password')}
              autoComplete="current-password"
            />
            <label className="auth-label">Password</label>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            {touched.password && errors.password && (
              <div className="validation-message error">
                <span>⚠️</span> {errors.password}
              </div>
            )}
          </div>

          {/* Remember & Forgot */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', color: '#475569' }}>
              <input type="checkbox" className="auth-checkbox" />
              <span style={{ fontSize: '0.9rem' }}>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.9rem' }}>
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="auth-btn auth-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner"></span>
                Signing in...
              </>
            ) : (
              <>Sign In</>
            )}
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <span style={{ color: '#64748b' }}>Don't have an account? </span>
            <Link to="/register" className="auth-link fw-semibold">
              Create Account
            </Link>
          </div>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          © 2025 SkillLink. All rights reserved.
        </p>
      </div>

      {/* Verification Status Modal */}
      {verificationModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', maxWidth: '420px', width: '90%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 24px 20px',
              background: verificationModal.type === 'pending'
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              textAlign: 'center', color: 'white'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                {verificationModal.type === 'pending' ? '⏳' : '❌'}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                {verificationModal.type === 'pending' ? 'Account Pending Approval' : 'Account Rejected'}
              </h3>
            </div>
            {/* Modal Content */}
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 16px' }}>
                {verificationModal.message}
              </p>
              {verificationModal.feedback && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
                  padding: '12px 16px', marginBottom: '16px', textAlign: 'left'
                }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>Rejection Feedback:</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#b91c1c' }}>{verificationModal.feedback}</p>
                </div>
              )}
              <button
                onClick={() => setVerificationModal(null)}
                style={{
                  padding: '10px 32px', borderRadius: '12px', border: 'none',
                  background: verificationModal.type === 'pending'
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                {verificationModal.type === 'pending' ? 'OK, I\'ll Wait' : 'OK, Understood'}
              </button>
              {verificationModal.type === 'rejected' && (
                <div style={{ marginTop: '12px' }}>
                  <Link to="/register" className="auth-link" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Register Again →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
