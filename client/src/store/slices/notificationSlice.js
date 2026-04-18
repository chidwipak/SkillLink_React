import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications')
      return response.data.notifications
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      return notificationId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/notifications/mark-all-read')
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const deleteReadNotifications = createAsyncThunk(
  'notifications/deleteRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/notifications/cleanup/read')
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload)
      if (!action.payload.isRead) {
        state.unreadCount += 1
      }
    },
    clearNotifications: (state) => {
      state.items = []
      state.unreadCount = 0
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.unreadCount = action.payload.filter(n => !n.isRead).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find((n) => n._id === action.payload)
        if (notification && !notification.isRead) {
          notification.isRead = true
          state.unreadCount -= 1
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => { n.isRead = true })
        state.unreadCount = 0
      })
      .addCase(deleteReadNotifications.fulfilled, (state) => {
        state.items = state.items.filter(n => !n.isRead)
      })
  },
})

export const { addNotification, clearNotifications } = notificationSlice.actions
export default notificationSlice.reducer
