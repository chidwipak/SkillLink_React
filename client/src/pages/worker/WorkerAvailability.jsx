import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const WorkerAvailability = () => {
  const { user } = useSelector((state) => state.auth)
  const [saving, setSaving] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Fetch worker's current availability status on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await api.get('/dashboard/worker/stats')
        if (response.data?.worker) {
          setIsAvailable(response.data.worker.isAvailable || false)
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchAvailability()
  }, [])

  const handleToggle = async () => {
    if (saving) return // Prevent double-clicks
    
    const previousValue = isAvailable
    const newValue = !isAvailable
    
    // Optimistic update - change UI immediately
    setIsAvailable(newValue)
    setSaving(true)
    
    try {
      const response = await api.put('/workers/availability', { isAvailable: newValue })
      // Confirm with server response
      setIsAvailable(response.data.worker.isAvailable)
      toast.success(`Availability ${response.data.worker.isAvailable ? 'enabled' : 'disabled'}`)
    } catch (error) {
      // Revert on error
      setIsAvailable(previousValue)
      toast.error(error.response?.data?.message || 'Failed to update availability')
    } finally {
      setSaving(false)
    }
  }

  if (initialLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="ent-dashboard">
      <div className="ent-container">
        {/* Header */}
        <header className="ent-header ent-animate">
          <div>
            <h1 className="ent-header-title">Availability Settings</h1>
            <p className="ent-header-subtitle">Manage when you're available to accept new job bookings</p>
          </div>
        </header>

        <div className="ent-row ent-row-2">
          {/* Main Card */}
          <div className="ent-card ent-animate">
            <div className="ent-card-header">
              <h3 className="ent-card-title">
                <i className="fas fa-toggle-on"></i> Current Status
              </h3>
            </div>
            <div className="ent-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Toggle Availability</h4>
                  <p style={{ margin: 0, color: 'var(--slate-500)' }}>
                    Control whether customers can send you booking requests
                  </p>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={saving}
                  className={`ent-btn ${isAvailable ? 'ent-btn-success' : 'ent-btn-secondary'}`}
                  style={{ minWidth: '160px', padding: '12px 20px', height: '48px', transition: 'background-color 0.2s, opacity 0.2s' }}
                >
                  <i className={`fas fa-${isAvailable ? 'toggle-on' : 'toggle-off'}`} style={{ marginRight: '8px' }}></i>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>

              <div className={`ent-alert ${isAvailable ? 'ent-alert-success' : 'ent-alert-warning'}`}>
                <i className={`fas fa-${isAvailable ? 'check-circle' : 'exclamation-triangle'}`}></i>
                <div>
                  <strong>{isAvailable ? 'You are currently available' : 'You are currently unavailable'}</strong>
                  <p style={{ margin: '4px 0 0' }}>
                    {isAvailable
                      ? 'Customers can see and book your services. You will receive notifications for new booking requests.'
                      : 'Customers cannot book your services right now. You will not receive new booking requests.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Info Card */}
          <div>
            <div className="ent-card ent-animate">
              <div className="ent-card-header">
                <h3 className="ent-card-title">
                  <i className="fas fa-info-circle"></i> How It Works
                </h3>
              </div>
              <div className="ent-card-body">
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="ent-badge ent-badge-success">Available</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                    Visible to customers, can receive booking requests
                  </p>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--slate-200)', margin: '12px 0' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="ent-badge ent-badge-default">Unavailable</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                    Shown as unavailable, cannot receive new requests
                  </p>
                </div>
              </div>
            </div>

            <div className="ent-card ent-animate" style={{ marginTop: '16px' }}>
              <div className="ent-card-body" style={{ textAlign: 'center' }}>
                <i className="fas fa-star" style={{ fontSize: '2rem', color: 'var(--warning)' }}></i>
                <h4 style={{ margin: '12px 0 8px' }}>Pro Tip</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                  Workers who maintain consistent availability get more bookings and better ratings!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="ent-card ent-animate" style={{ marginTop: '24px' }}>
          <div className="ent-card-header">
            <h3 className="ent-card-title">
              <i className="fas fa-lightbulb" style={{ color: 'var(--warning)' }}></i> Tips for Managing Availability
            </h3>
          </div>
          <div className="ent-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <i className="fas fa-check-circle" style={{ color: 'var(--success)', marginTop: '2px' }}></i>
                <span>Turn off availability when you're on vacation or unable to take new work</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <i className="fas fa-check-circle" style={{ color: 'var(--success)', marginTop: '2px' }}></i>
                <span>Keep your availability updated to avoid disappointing customers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <i className="fas fa-check-circle" style={{ color: 'var(--success)', marginTop: '2px' }}></i>
                <span>You can still complete ongoing bookings when unavailable</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <i className="fas fa-check-circle" style={{ color: 'var(--success)', marginTop: '2px' }}></i>
                <span>Respond promptly to bookings to maintain high ratings</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <i className="fas fa-check-circle" style={{ color: 'var(--success)', marginTop: '2px' }}></i>
                <span>Toggle availability as needed - there are no penalties</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerAvailability
