import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import toast from 'react-hot-toast'
import api from '../../services/api'

const AddressModal = ({ show, onHide, onAddressSaved, existingAddress = null, canClose = true }) => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (existingAddress) {
      setFormData({
        street: existingAddress.street || '',
        city: existingAddress.city || '',
        state: existingAddress.state || '',
        zipCode: existingAddress.zipCode || '',
        country: existingAddress.country || 'India'
      })
    }
  }, [existingAddress])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill in all address fields')
      return
    }

    setLoading(true)
    try {
      const response = await api.put('/auth/profile', {
        address: formData
      })
      
      if (response.data.success) {
        toast.success('Address saved successfully!')
        if (onAddressSaved) {
          onAddressSaved(formData)
        }
        if (canClose) {
          onHide()
        }
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error(error.response?.data?.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal 
      show={show} 
      onHide={canClose ? onHide : null} 
      backdrop={canClose ? true : 'static'}
      keyboard={canClose}
      centered
    >
      <Modal.Header closeButton={canClose}>
        <Modal.Title>
          {!canClose && <span className="text-danger me-2">⚠️</span>}
          {existingAddress ? 'Update Address' : 'Add Your Address'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!canClose && (
          <div className="alert alert-warning mb-3">
            <strong>Profile Incomplete!</strong><br />
            Please add your address to continue using the platform.
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Street Address *</Form.Label>
            <Form.Control
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Enter street address"
              required
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>City *</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>State *</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>ZIP Code *</Form.Label>
                <Form.Control
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Enter ZIP code"
                  maxLength="6"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled
                />
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            {canClose && (
              <Button variant="secondary" onClick={onHide}>
                Cancel
              </Button>
            )}
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Address'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default AddressModal
