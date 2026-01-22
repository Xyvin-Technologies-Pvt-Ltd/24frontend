export interface AdminLoginData {
  email: string
  password: string
}

export interface AdminLoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: AuthUser & {
      permissions: string[]
    }
  }
}

export interface AuthUser {
  _id: string
  email: string
  is_admin: boolean
  role?: string
  status: string
}
