import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', response.data.token)
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      return response.data.user
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile')
      return response.data.user
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
})

// Load initial state from localStorage
const loadInitialState = () => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr)
      return {
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error)
    }
  }
  
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(getProfile.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        localStorage.removeItem('user')
        state.user = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        localStorage.removeItem('user')
        localStorage.removeItem('refreshToken')
      })
  },
})

export const { clearError, updateUser } = authSlice.actions
export default authSlice.reducer
