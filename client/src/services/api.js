import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Only set Content-Type to application/json if data is not FormData
    // FormData should use multipart/form-data which axios sets automatically
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (token expired/invalid) - but not for login/register routes
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip redirect for auth routes
      const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register')
      
      if (!isAuthRoute) {
        originalRequest._retry = true
        
        // Clear token and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Show error message
        const message = error.response?.data?.message || 'Session expired. Please login again.'
        toast.error(message)
        
        // Delay redirect to allow user to see the message
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      }
      
      return Promise.reject(error)
    }

    // Don't show toast for auth routes - let the component handle it
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                        originalRequest.url?.includes('/auth/register') ||
                        originalRequest.url?.includes('/auth/verify')

    // Handle other errors (but not for auth routes which handle their own errors)
    if (error.response?.status !== 401 && !isAuthRoute) {
      const message = error.response?.data?.message || 'An error occurred'
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
