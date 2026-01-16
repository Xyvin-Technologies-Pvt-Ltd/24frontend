import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import type { AdminLoginData } from '@/types/auth'

export const useAdminLogin = () => {
  return useMutation({
    mutationFn: (loginData: AdminLoginData) => 
      authService.adminLogin(loginData),
  })
}
