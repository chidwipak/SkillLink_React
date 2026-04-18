import { useState, useEffect } from 'react'
import { Card, Button, Form, Modal } from 'react-bootstrap'
import toast from 'react-hot-toast'
import api from '../../services/api'

const MultipleAddressManager = ({ addresses = [], onAddressesUpdated }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  })
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setFormData({
      label: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false
    })
    setEditingIndex(null)
  }

  const handleAddNew = () => {
    resetForm()
    setShowModal(true)
  }

  const handleEdit = (address, index) => {
    setFormData({
      label: address.label || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || 'India',
      isDefault: address.isDefault || false
    })
    setEditingIndex(index)
    setShowModal(true)
  }

  const handleDelete = async (index) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return
    }

    const updatedAddresses = addresses.filter((_, i) => i !== index)
    await saveAddresses(updatedAddresses)
  }

  const handleSetDefault = async (index) => {
    const updatedAddresses = addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index
    }))
    await saveAddresses(updatedAddresses)
  }

  const saveAddresses = async (updatedAddresses) => {
    setLoading(true)
    try {
      const response = await api.put('/auth/profile', {
        addresses: updatedAddresses,
        address: updatedAddresses.find(a => a.isDefault) || updatedAddresses[0]
      })
      
      if (response.data.success) {
        toast.success('Addresses updated successfully!')
        if (onAddressesUpdated) {
          onAddressesUpdated(updatedAddresses)
        }
      }
    } catch (error) {
      console.error('Error saving addresses:', error)
      toast.error('Failed to update addresses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill in all fields')
      return
    }

    let updatedAddresses = [...addresses]
    
    if (editingIndex !== null) {
      // Update existing address
      updatedAddresses[editingIndex] = formData
    } else {
      // Add new address
      // If this is the first address or marked as default, make it default
      if (updatedAddresses.length === 0 || formData.isDefault) {
        updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }))
        formData.isDefault = true
      }
      updatedAddresses.push(formData)
    }

    await saveAddresses(updatedAddresses)
    setShowModal(false)
    resetForm()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Saved Addresses</h5>
        <Button variant="primary" size="sm" onClick={handleAddNew}>
          <i className="fas fa-plus me-1"></i> Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
            <p className="text-muted">No addresses saved yet</p>
            <Button variant="primary" onClick={handleAddNew}>
              Add Your First Address
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="row">
          {addresses.map((address, index) => (
            <div key={index} className="col-md-6 mb-3">
              <Card className={address.isDefault ? 'border-primary' : ''}>
                <Card.Body>
                  {address.isDefault && (
                    <span className="badge bg-primary mb-2">Default</span>
                  )}
                  {address.label && (
                    <h6 className="mb-2">{address.label}</h6>
                  )}
                  <p className="mb-1 small">{address.street}</p>
                  <p className="mb-1 small">{address.city}, {address.state} {address.zipCode}</p>
                  <p className="mb-3 small text-muted">{address.country}</p>
                  
                  <div className="d-flex gap-2">
                    {!address.isDefault && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleSetDefault(index)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => handleEdit(address, index)}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Address Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingIndex !== null ? 'Edit Address' : 'Add New Address'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Address Label (Optional)</Form.Label>
              <Form.Control
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Home, Office, etc."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Street Address *</Form.Label>
              <Form.Control
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
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
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>State *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
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
                    value={formData.country}
                    disabled
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Set as default address"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Address'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default MultipleAddressManager
