import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchNotifications, markAsRead, markAllAsRead } from '../store/slices/notificationSlice'

const Notifications = () => {
  const { items, isLoading, unreadCount } = useSelector((state) => state.notifications)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const markedAsReadRef = useRef(false)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  // Mark all notifications as read when user views this page
  useEffect(() => {
    if (!isLoading && items.length > 0 && unreadCount > 0 && !markedAsReadRef.current) {
      markedAsReadRef.current = true
      // Small delay to ensure user sees the notifications first
      const timer = setTimeout(() => {
        dispatch(markAllAsRead())
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, items, unreadCount, dispatch])

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id))
  }

  if (isLoading) {
    return (
      <div className="ent-dashboard">
        <div className="ent-container">
          <div className="ent-card">
            <div className="ent-card-body" style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ marginTop: '16px', color: 'var(--slate-500)' }}>Loading notifications...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ent-dashboard">
      <div className="ent-container">
        {/* Header */}
        <header className="ent-header ent-animate">
          <div className="ent-header-left">
            <div className="ent-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-100)' }}>
              <i className="fas fa-bell" style={{ fontSize: '1.25rem', color: 'var(--slate-600)' }}></i>
            </div>
            <div>
              <h1 className="ent-header-title">Notifications</h1>
              <p className="ent-header-subtitle">
                {items.length > 0 ? `${items.length} notification${items.length !== 1 ? 's' : ''}` : 'No notifications'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="ent-header-actions">
              <span className="ent-badge ent-badge-info">{unreadCount} unread</span>
            </div>
          )}
        </header>

        {/* Notifications List */}
        <div className="ent-card ent-animate">
          <div className="ent-card-body" style={{ padding: 0 }}>
            {items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((notification, index) => {
                  const isRejection = notification.type === 'warning' && notification.actionType === 'rebook'
                  const isBroadcastFallback = notification.type === 'warning' && notification.actionType === 'broadcast'
                  const isDeclineNotif = isRejection || isBroadcastFallback

                  return (
                  <div
                    key={notification._id}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: index < items.length - 1 ? '1px solid var(--slate-100)' : 'none',
                      background: isDeclineNotif
                        ? 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)'
                        : !notification.isRead
                          ? 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%)'
                          : 'transparent',
                      borderLeft: isDeclineNotif ? '4px solid #ef4444' : 'none',
                      cursor: !notification.isRead ? 'pointer' : 'default',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          {isDeclineNotif && (
                            <span style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#dc2626', fontSize: '0.8rem', flexShrink: 0
                            }}>
                              <i className="fas fa-exclamation-circle"></i>
                            </span>
                          )}
                          <h6 style={{ margin: 0, fontWeight: 600, color: isDeclineNotif ? '#991b1b' : 'var(--slate-800)' }}>
                            {notification.title}
                          </h6>
                          {!notification.isRead && (
                            <span className="ent-badge ent-badge-info" style={{ fontSize: '0.65rem' }}>New</span>
                          )}
                        </div>
                        <p style={{ 
                          margin: '4px 0 8px', 
                          color: isDeclineNotif ? '#92400e' : 'var(--slate-600)', 
                          fontSize: '0.9rem',
                          paddingLeft: isDeclineNotif ? '36px' : '0'
                        }}>
                          {notification.message}
                        </p>

                        {/* ── Rejection Action Buttons ── */}
                        {isDeclineNotif && (
                          <div style={{ display: 'flex', gap: '8px', paddingLeft: '36px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/dashboard/customer/bookings') }}
                              style={{
                                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                color: '#fff', border: 'none', padding: '6px 14px',
                                borderRadius: '8px', fontWeight: 600, fontSize: '0.78rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                              }}
                            >
                              <i className="fas fa-user-plus"></i> Find Another Worker
                            </button>
                            {notification.metadata?.suggestedWorkers?.length > 0 && (
                              <span style={{
                                background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px',
                                borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: '4px'
                              }}>
                                <i className="fas fa-users"></i> {notification.metadata.availableCount} worker{notification.metadata.availableCount > 1 ? 's' : ''} available
                              </span>
                            )}
                          </div>
                        )}

                        <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>
                          <i className="fas fa-clock" style={{ marginRight: '4px' }}></i>
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="ent-empty" style={{ padding: '60px 20px' }}>
                <div className="ent-empty-icon">🔔</div>
                <h4 className="ent-empty-title">No notifications</h4>
                <p className="ent-empty-text">You're all caught up! New notifications will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
