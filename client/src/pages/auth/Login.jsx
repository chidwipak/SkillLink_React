import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import '../../styles/auth.css'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const { isLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

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
      toast.success('Welcome back! 🎉')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error || 'Login failed. Please check your credentials.')
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
      {/* Animated background orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      
      <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
        <div className="row justify-content-center w-100">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="auth-card p-4 p-md-5">
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
                <div className="d-flex justify-content-between align-items-center mb-4" style={{ animation: 'inputSlide 0.6s ease-out 0.7s forwards', opacity: 0 }}>
                  <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', color: '#64748b' }}>
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
                <div className="text-center" style={{ animation: 'fadeIn 0.8s ease-out 1.1s forwards', opacity: 0 }}>
                  <span style={{ color: '#64748b' }}>Don't have an account? </span>
                  <Link to="/register" className="auth-link fw-semibold">
                    Create Account
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

export default Login
