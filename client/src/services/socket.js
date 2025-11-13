import { io } from 'socket.io-client'
import { store } from '../store/store'
import { fetchNotifications } from '../store/slices/notificationSlice'
import toast from 'react-hot-toast'

class SocketService {
  constructor() {
    this.socket = null
  }

  connect() {
    const token = localStorage.getItem('token')
    
    if (!token) {
      console.log('No token found, skipping socket connection')
      return
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
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
      toast.success('Booking status updated')
    })

    // Listen for order updates
    this.socket.on('order-updated', (data) => {
      console.log('📦 Order updated:', data)
      toast.success('Order status updated')
    })

    // Listen for new bookings (for workers)
    this.socket.on('new-booking', (data) => {
      console.log('📅 New booking received:', data)
      toast.success('You have a new booking!', { duration: 5000 })
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
