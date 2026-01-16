import { api } from '@/lib/api'
import type { AdminLoginData, AdminLoginResponse } from '@/types/auth'

export const authService = {
  adminLogin: async (loginData: AdminLoginData): Promise<AdminLoginResponse> => {
    const response = await api.post('/auth/admin-login', loginData)
    return response.data
  },
}
