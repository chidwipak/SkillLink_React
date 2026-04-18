import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../../store/slices/authSlice'
import { useCelebration } from '../../contexts/CelebrationContext'
import toast from 'react-hot-toast'
import '../../styles/auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    profilePicture: null,
    // Worker fields
    experience: '',
    serviceCategory: 'electrician',
    skills: '',
    aadharDocument: null,
    // Seller fields
    businessName: '',
    businessDescription: '',
    gstNumber: '',
    shopExteriorImage: null,
    shopInteriorImage: null,
    businessDocument: null,
    // Delivery fields
    vehicleType: 'bike',
    vehicleNumber: '',
    drivingLicense: null,
    deliveryDocument: null,
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const { isLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { celebrate } = useCelebration()

  // Real-time validation
  useEffect(() => {
    const newErrors = {}

    // Name validation - only alphabets and spaces
    if (touched.name) {
      if (!formData.name) {
        newErrors.name = 'Name is required'
      } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
        newErrors.name = 'Name should contain only letters and spaces'
      } else if (formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters'
      }
    }

    // Email validation
    if (touched.email) {
      if (!formData.email) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }

    // Phone validation - exactly 10 digits
    if (touched.phone) {
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Phone must be exactly 10 digits'
      }
    }

    // Password validation
    if (touched.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = 'Password must contain at least 1 uppercase letter'
      } else if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least 1 number'
      } else if (!/(?=.*[@$!%*?&#])/.test(formData.password)) {
        newErrors.password = 'Password must contain at least 1 special character (@$!%*?&#)'
      }
    }

    // Confirm password validation
    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
  }, [formData, touched])

  // Password strength calculator
  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return 0
    let strength = 0
    if (password.length >= 6) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[@$!%*?&#]/.test(password)) strength++
    return strength
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
  }

  // Handle name input - only allow alphabets and spaces
  const handleNameChange = (e) => {
    const value = e.target.value
    // Allow only letters and spaces
    if (value === '' || /^[a-zA-Z\s]*$/.test(value)) {
      setFormData({ ...formData, name: value })
    }
  }

  // Handle phone input - only allow numbers
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setFormData({ ...formData, phone: value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, profilePicture: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, [fieldName]: file })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields before submit
    const allFields = ['name', 'email', 'phone', 'password', 'confirmPassword']
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}))

    // Check for errors
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors before submitting')
      return
    }

    // Profile picture is mandatory for all users
    if (!formData.profilePicture) {
      toast.error('Profile picture is required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      submitData.append('password', formData.password)
      submitData.append('phone', formData.phone)
      submitData.append('role', formData.role)

      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture)
      }

      // Worker-specific data
      if (formData.role === 'worker') {
        submitData.append('experience', formData.experience)
        submitData.append('serviceCategory', formData.serviceCategory)
        submitData.append('skills', formData.skills)
        if (formData.aadharDocument) {
          submitData.append('aadharDocument', formData.aadharDocument)
        }
      }

      // Seller-specific data
      if (formData.role === 'seller') {
        submitData.append('businessName', formData.businessName)
        submitData.append('businessDescription', formData.businessDescription)
        submitData.append('gstNumber', formData.gstNumber)
        if (formData.shopExteriorImage) {
          submitData.append('shopExteriorImage', formData.shopExteriorImage)
        }
        if (formData.shopInteriorImage) {
          submitData.append('shopInteriorImage', formData.shopInteriorImage)
        }
        if (formData.businessDocument) {
          submitData.append('businessDocument', formData.businessDocument)
        }
      }

      // Delivery-specific data
      if (formData.role === 'delivery') {
        submitData.append('vehicleType', formData.vehicleType)
        submitData.append('vehicleNumber', formData.vehicleNumber)
        if (formData.drivingLicense) {
          submitData.append('drivingLicense', formData.drivingLicense)
        }
        if (formData.deliveryDocument) {
          submitData.append('deliveryDocument', formData.deliveryDocument)
        }
      }

      await dispatch(register(submitData)).unwrap()
      celebrate({ count: 200 })
      toast.success('Registration successful! 🎉 Please verify your email.')
      // Store email for verification page
      localStorage.setItem('pendingVerificationEmail', formData.email)
      navigate('/verify-email', { state: { email: formData.email } })
    } catch (error) {
      toast.error(error || 'Registration failed')
    }
  }

  const roleOptions = [
    { value: 'customer', label: 'Customer', icon: '🛒', desc: 'Book services & shop' },
    { value: 'worker', label: 'Worker', icon: '🔧', desc: 'Offer your services' },
    { value: 'seller', label: 'Seller', icon: '🏪', desc: 'Sell products' },
    { value: 'delivery', label: 'Delivery', icon: '🚚', desc: 'Deliver orders' },
  ]

  const serviceCategories = [
    { value: 'electrician', label: 'Electrician', icon: '⚡' },
    { value: 'plumber', label: 'Plumber', icon: '🔧' },
    { value: 'carpenter', label: 'Carpenter', icon: '🪚' },
  ]

  const vehicleTypes = [
    { value: 'bike', label: 'Bike', icon: '🏍️' },
    { value: 'scooter', label: 'Scooter', icon: '🛵' },
    { value: 'bicycle', label: 'Bicycle', icon: '🚲' },
  ]

  const needsExtraStep = ['worker', 'seller', 'delivery'].includes(formData.role)

  const canProceedToStep2 = () => {
    return formData.name && formData.email && formData.phone && formData.password && formData.confirmPassword && formData.profilePicture && Object.keys(errors).length === 0
  }

  const handleNextStep = () => {
    // Touch all fields to show errors
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true })

    if (!formData.profilePicture) {
      toast.error('Profile picture is required')
      return
    }

    if (!canProceedToStep2()) {
      toast.error('Please fix all errors before continuing')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setStep(2)
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

  // File upload component with new styling
  const FileUploadBox = ({ label, fieldName, accept = "image/*,.pdf", icon = "📄", currentFile }) => (
    <div className="mb-3">
      <label style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <div className={`file-upload-zone ${currentFile ? 'has-file' : ''}`}>
        <input
          type="file"
          accept={accept}
          className="d-none"
          id={fieldName}
          onChange={(e) => handleFileChange(e, fieldName)}
        />
        <label htmlFor={fieldName} style={{ cursor: 'pointer', display: 'block' }}>
          {currentFile ? (
            <>
              <span className="file-upload-icon" style={{ color: '#10b981' }}>✓</span>
              <p className="file-upload-text" style={{ color: '#10b981' }}>{currentFile.name}</p>
              <p className="file-upload-hint">Click to change</p>
            </>
          ) : (
            <>
              <span className="file-upload-icon">{icon}</span>
              <p className="file-upload-text">Click to upload</p>
              <p className="file-upload-hint">PDF, JPG, PNG (max 5MB)</p>
            </>
          )}
        </label>
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        {/* Logo */}
        <div className="text-center mb-3">
          <div className="auth-logo mx-auto">
            <span>🔧</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="auth-title text-center">Create Account</h1>
        <p className="auth-subtitle text-center mb-3">
          {step === 1 ? 'Join SkillLink today' : `Complete your ${formData.role} profile`}
        </p>

        {/* Step indicator */}
        {needsExtraStep && (
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}></div>
            <div className={`step-line ${step > 1 ? 'completed' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
                {/* STEP 1: Basic Information */}
                {step === 1 && (
                  <div className="form-section">
                    {/* Profile Picture Upload */}
                    <div className="profile-upload">
                      <div className="profile-preview">
                        {previewImage ? (
                          <img src={previewImage} alt="Preview" />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <label className="profile-upload-btn">
                        <span style={{ fontSize: '0.8rem' }}>📷</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="d-none"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-center mb-3" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      Profile photo <span style={{ color: '#ef4444' }}>*</span>
                    </p>

                    {/* Name Input */}
                    <div className="auth-input-group">
                      <span className="auth-icon">👤</span>
                      <input
                        type="text"
                        className={getInputClassName('name')}
                        placeholder="Full name"
                        value={formData.name}
                        onChange={handleNameChange}
                        onBlur={() => handleBlur('name')}
                      />
                      <label className="auth-label">Full Name</label>
                      {touched.name && errors.name && (
                        <div className="validation-message error">
                          <span>⚠️</span> {errors.name}
                        </div>
                      )}
                      {touched.name && !errors.name && formData.name && (
                        <div className="validation-message success">
                          <span>✓</span> Valid name
                        </div>
                      )}
                    </div>

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
                      />
                      <label className="auth-label">Email Address</label>
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

                    {/* Phone Input */}
                    <div className="auth-input-group">
                      <span className="auth-icon">📱</span>
                      <input
                        type="tel"
                        className={getInputClassName('phone')}
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        onBlur={() => handleBlur('phone')}
                        maxLength={10}
                      />
                      <label className="auth-label">Phone Number (10 digits)</label>
                      {touched.phone && errors.phone && (
                        <div className="validation-message error">
                          <span>⚠️</span> {errors.phone}
                        </div>
                      )}
                      {touched.phone && !errors.phone && formData.phone && (
                        <div className="validation-message success">
                          <span>✓</span> Valid phone ({formData.phone.length}/10)
                        </div>
                      )}
                    </div>

                    {/* Role Selection */}
                    <div className="mb-3">
                      <label style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
                        I want to join as
                      </label>
                      <div className="role-selector">
                        {roleOptions.map((role) => (
                          <div
                            key={role.value}
                            className={`role-option ${formData.role === role.value ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, role: role.value })}
                          >
                            <span className="role-icon">{role.icon}</span>
                            <div className="role-title">{role.label}</div>
                            <div className="role-desc">{role.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="auth-input-group">
                      <span className="auth-icon">🔒</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={getInputClassName('password')}
                        placeholder="Create password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onBlur={() => handleBlur('password')}
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
                      {formData.password && (
                        <div className="password-strength">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`strength-bar ${getPasswordStrength() >= level ? 'active' : ''} ${getPasswordStrength() <= 1 ? 'weak' : getPasswordStrength() <= 2 ? 'medium' : 'strong'
                                }`}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="auth-input-group">
                      <span className="auth-icon">🔒</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={getInputClassName('confirmPassword')}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onBlur={() => handleBlur('confirmPassword')}
                      />
                      <label className="auth-label">Confirm Password</label>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <div className="validation-message error">
                          <span>⚠️</span> {errors.confirmPassword}
                        </div>
                      )}
                      {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                        <div className="validation-message success">
                          <span>✓</span> Passwords match
                        </div>
                      )}
                    </div>

                    {/* Submit/Continue Button */}
                    {needsExtraStep ? (
                      <button
                        type="button"
                        className="auth-btn auth-btn-primary"
                        onClick={handleNextStep}
                      >
                        Continue →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="auth-btn auth-btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="btn-spinner"></span>
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* STEP 2: Role-Specific Information */}
                {step === 2 && (
                  <div className="form-section">
                    {/* Worker Fields */}
                    {formData.role === 'worker' && (
                      <>
                        <div className="auth-alert auth-alert-info">
                          <span style={{ fontSize: '1.2rem' }}>👷</span>
                          <div>
                            <strong>Worker Registration</strong>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                              Please provide your professional details for verification.
                            </p>
                          </div>
                        </div>

                        {/* Service Category */}
                        <div className="mb-3">
                          <label style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
                            Service Category
                          </label>
                          <div className="category-grid">
                            {serviceCategories.map((cat) => (
                              <div
                                key={cat.value}
                                className={`category-option ${formData.serviceCategory === cat.value ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, serviceCategory: cat.value })}
                              >
                                <span className="category-icon">{cat.icon}</span>
                                <div className="category-name">{cat.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Experience */}
                        <div className="auth-input-group">
                          <span className="auth-icon">📅</span>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            className="auth-input"
                            placeholder="Years of experience"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                          />
                          <label className="auth-label">Years of Experience</label>
                        </div>

                        {/* Skills */}
                        <div className="mb-3">
                          <label style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
                            Skills <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <textarea
                            className="auth-input"
                            style={{ minHeight: '80px', paddingTop: '16px' }}
                            placeholder="e.g., Wiring, Fan Installation, Circuit Repair"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          />
                          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '6px' }}>
                            Separate skills with commas
                          </p>
                        </div>

                        <FileUploadBox
                          label="Aadhar Card (ID Proof)"
                          fieldName="aadharDocument"
                          icon="🪪"
                          currentFile={formData.aadharDocument}
                        />
                      </>
                    )}

                    {/* Seller Fields */}
                    {formData.role === 'seller' && (
                      <>
                        <div className="auth-alert auth-alert-info">
                          <span style={{ fontSize: '1.2rem' }}>🏪</span>
                          <div>
                            <strong>Seller Registration</strong>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                              Please provide your business details for verification.
                            </p>
                          </div>
                        </div>

                        <div className="auth-input-group">
                          <span className="auth-icon">🏪</span>
                          <input
                            type="text"
                            className="auth-input"
                            placeholder="Business/Shop name"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          />
                          <label className="auth-label">Business Name</label>
                        </div>

                        <div className="mb-3">
                          <label style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
                            Business Description
                          </label>
                          <textarea
                            className="auth-input"
                            style={{ minHeight: '80px', paddingTop: '16px' }}
                            placeholder="Describe what your shop sells..."
                            value={formData.businessDescription}
                            onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                          />
                        </div>

                        <div className="auth-input-group">
                          <span className="auth-icon">📋</span>
                          <input
                            type="text"
                            className="auth-input"
                            placeholder="GST Number (optional)"
                            value={formData.gstNumber}
                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                          />
                          <label className="auth-label">GST Number</label>
                        </div>

                        <div className="row g-3">
                          <div className="col-6">
                            <FileUploadBox
                              label="Shop Exterior"
                              fieldName="shopExteriorImage"
                              accept="image/*"
                              icon="🏬"
                              currentFile={formData.shopExteriorImage}
                            />
                          </div>
                          <div className="col-6">
                            <FileUploadBox
                              label="Shop Interior"
                              fieldName="shopInteriorImage"
                              accept="image/*"
                              icon="🏠"
                              currentFile={formData.shopInteriorImage}
                            />
                          </div>
                        </div>

                        <FileUploadBox
                          label="Business Document / Aadhar"
                          fieldName="businessDocument"
                          icon="🪪"
                          currentFile={formData.businessDocument}
                        />
                      </>
                    )}

                    {/* Delivery Fields */}
                    {formData.role === 'delivery' && (
                      <>
                        <div className="auth-alert auth-alert-info">
                          <span style={{ fontSize: '1.2rem' }}>🚚</span>
                          <div>
                            <strong>Delivery Partner Registration</strong>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                              Please provide your vehicle and license details.
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '8px', display: 'block', fontWeight: '500' }}>
                            Vehicle Type
                          </label>
                          <div className="category-grid">
                            {vehicleTypes.map((veh) => (
                              <div
                                key={veh.value}
                                className={`category-option ${formData.vehicleType === veh.value ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, vehicleType: veh.value })}
                              >
                                <span className="category-icon">
                                  {veh.value === 'bike' ? '🏍️' : veh.value === 'scooter' ? '🛵' : '🚲'}
                                </span>
                                <div className="category-name">{veh.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="auth-input-group">
                          <span className="auth-icon">🚗</span>
                          <input
                            type="text"
                            className="auth-input"
                            placeholder="Vehicle number"
                            value={formData.vehicleNumber}
                            onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                            style={{ textTransform: 'uppercase' }}
                          />
                          <label className="auth-label">Vehicle Number</label>
                        </div>

                        <FileUploadBox
                          label="Driving License"
                          fieldName="drivingLicense"
                          icon="🪪"
                          currentFile={formData.drivingLicense}
                        />

                        <FileUploadBox
                          label="Aadhar Card (ID Proof)"
                          fieldName="deliveryDocument"
                          icon="📄"
                          currentFile={formData.deliveryDocument}
                        />
                      </>
                    )}

                    {/* Navigation Buttons */}
                    <div className="d-flex gap-3 mt-4">
                      <button
                        type="button"
                        className="auth-btn auth-btn-secondary flex-grow-1"
                        onClick={() => setStep(1)}
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="auth-btn auth-btn-primary flex-grow-1"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="btn-spinner"></span>
                            Creating...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="auth-divider">
                  <span>or</span>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <span style={{ color: '#64748b' }}>Already have an account? </span>
                  <Link to="/login" className="auth-link fw-semibold">
                    Sign In
                  </Link>
                </div>
              </form>

              {/* Footer */}
              <p className="auth-footer">
                © 2025 SkillLink. All rights reserved.
              </p>
            </div>
          </div>
        )
      }

export default Register
