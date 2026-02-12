import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3003'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY || 'your-api-key-here',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')

      // Check if this is a critical auth failure (like login endpoint)
      // vs a permission issue on a specific resource
      const isLoginEndpoint = error.config?.url?.includes('/auth/login')
      const isTokenRefresh = error.config?.url?.includes('/auth/refresh')

      // Only reload immediately for critical auth endpoints
      // For other endpoints, let the component handle the error
      if (isLoginEndpoint || isTokenRefresh) {
        window.location.reload()
      }
      // For other 401s, we'll let the component show an error message
      // and the user can manually navigate back or refresh
    }
    return Promise.reject(error)
  }
)