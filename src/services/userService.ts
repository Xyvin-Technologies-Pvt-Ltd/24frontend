import { api } from '@/lib/api'
import type {
  CreateUserData,
  UpdateUserData,
  UpdateUserStatusData,
  UsersResponse,
  UserResponse,
  UsersQueryParams
} from '@/types/user'

export const userService = {
  // Get all users with pagination and filters
  getUsers: async (params: UsersQueryParams = {}): Promise<UsersResponse> => {
    const response = await api.get('/user', { params })
    return response.data
  },

  // Get user by ID (admin route - requires auth)
  // Get all users without pagination
  getUsersAll: async (): Promise<UsersResponse> => {
    const response = await api.get('/user/all')
    return response.data
  },

  // Get user by ID
  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await api.get(`/user/${id}`)
    return response.data
  },

  // Get public user profile (no auth required)
  getPublicUserProfile: async (id: string): Promise<UserResponse> => {
    const response = await api.get(`/public/profile/${id}`)
    return response.data
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<UserResponse> => {
    const response = await api.post('/user', userData)
    return response.data
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserData): Promise<UserResponse> => {
    const response = await api.put(`/user/${id}`, userData)
    return response.data
  },

  // Update user status
  updateUserStatus: async (id: string, statusData: UpdateUserStatusData): Promise<UserResponse> => {
    const response = await api.put(`/user/${id}/status`, statusData)
    return response.data
  },

  // Delete user (soft delete)
  deleteUser: async (id: string): Promise<UserResponse> => {
    const response = await api.delete(`/user/${id}`)
    return response.data
  },

  // Download users CSV
  downloadUsers: async (params: UsersQueryParams = {}): Promise<Blob> => {
    const response = await api.get('/user/download', {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Get user statistics (counts by status)
  getUserStats: async (): Promise<{ active: number; inactive: number; total: number }> => {
    const response = await api.get('/user/stats')
    return response.data.data
  }
}