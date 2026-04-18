import { io } from 'socket.io-client'
import { store } from '../store/store'
import { fetchNotifications } from '../store/slices/notificationSlice'
import toast from 'react-hot-toast'

class SocketService {
  constructor() {
    this.socket = null
    this._triggerCelebration = null
  }

  // Register a celebration callback (called from React context)
  setCelebrationCallback(fn) {
    this._triggerCelebration = fn
  }

  connect() {
    const token = localStorage.getItem('token')
    
    if (!token) {
      console.log('No token found, skipping socket connection')
      return
    }

    // Prevent duplicate connections
    if (this.socket?.connected) {
      console.log('Socket already connected, skipping')
      return
    }

    // Disconnect existing socket before creating a new one
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.socket = io(import.meta.env.VITE_API_BASE_URL || '/', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id)
      // Authenticate with JWT token
      this.socket.emit('authenticate', token)
    })

    this.socket.on('authenticated', (data) => {
      if (data.success) {
        console.log('✅ Socket authenticated')
      } else {
        console.error('❌ Socket authentication failed:', data.error)
      }
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    // Listen for notifications
    this.socket.on('notification', (notification) => {
      console.log('📬 New notification:', notification)
      
      // Show toast notification
      toast(notification.message, {
        icon: notification.type === 'success' ? '✅' : 
              notification.type === 'error' ? '❌' : 
              notification.type === 'warning' ? '⚠️' : 'ℹ️',
        duration: 4000,
      })
      
      // Refresh notifications in Redux store
      store.dispatch(fetchNotifications())
    })

    // Listen for booking updates
    this.socket.on('booking-updated', (data) => {
      console.log('📅 Booking updated:', data)
      if (data.status === 'completed') {
        toast.success('🎉 Service completed successfully!')
        this._triggerCelebration?.()
      } else {
        toast.success('Booking status updated')
      }
    })

    // Listen for order updates
    this.socket.on('order-updated', (data) => {
      console.log('📦 Order updated:', data)
      if (data.status === 'delivered') {
        toast.success('🎉 Order delivered successfully!')
        this._triggerCelebration?.()
      } else {
        toast.success('Order status updated')
      }
    })

    // Listen for new bookings (for workers)
    this.socket.on('new-booking', (data) => {
      console.log('📅 New booking received:', data)
      toast.success('You have a new booking!', { duration: 5000 })
    })

    // Listen for booking rejection (for customers) — Fallback mechanism
    this.socket.on('booking-rejected', (data) => {
      console.log('❌ Booking rejected:', data)
      const workerName = data.rejectedBy || 'A worker'
      const count = data.availableCount || 0
      const reason = data.reason ? ` — "${data.reason}"` : ''

      toast(
        (t) => {
          // Build a simple HTML-like text for the toast
          const message = `${workerName} declined your booking${reason}. ${
            count > 0
              ? `${count} other worker${count > 1 ? 's' : ''} available!`
              : 'Try again later.'
          }`
          return message
        },
        {
          icon: '⚠️',
          duration: 8000,
          style: {
            borderLeft: '4px solid #ef4444',
            background: '#fef2f2',
            color: '#991b1b',
            fontWeight: 500,
            fontSize: '0.88rem',
          }
        }
      )

      // Refresh notifications in store
      store.dispatch(fetchNotifications())
    })

    // Listen for new orders (for sellers)
    this.socket.on('new-order', (data) => {
      console.log('📦 New order received:', data)
      toast.success('You have a new order!', { duration: 5000 })
    })

    // Listen for delivery location updates
    this.socket.on('delivery-location-updated', (data) => {
      console.log('📍 Delivery location updated:', data)
    })

    // Listen for new delivery assignments
    this.socket.on('new-assignment', (data) => {
      console.log('🚚 New delivery assignment:', data)
      toast.success('You have a new delivery assignment!', { duration: 5000 })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('Socket manually disconnected')
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }

  // Join a specific room
  joinRoom(room) {
    this.emit('join-room', room)
  }

  // Leave a specific room
  leaveRoom(room) {
    this.emit('leave-room', room)
  }

  // Update location (for delivery)
  updateLocation(data) {
    this.emit('location-update', data)
  }
}

export default new SocketService()
