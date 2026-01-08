export interface User {
  _id: string
  name: string
  email: string
  phone: string
  image?: string
  gender?: 'male' | 'female' | 'other'
  dob?: string
  status: 'active' | 'inactive' | 'pending' | 'deleted' | 'suspended' | 'rejected'
  is_admin: boolean
  admin_role?: {
    _id: string
    role_name: string
    permissions: string[]
  }
  last_seen?: string
  online: boolean
  is_installed: boolean
  reject_reason?: string
  createdAt: string
  updatedAt: string
  // Additional fields for frontend compatibility
  campus?: string
  district?: string
  userId?: string
  referrals?: string
  rewardStatus?: "Posted" | "Eligible" | "Not Eligible"
}

export interface CreateUserData {
  name: string
  email: string
  phone: string
  password?: string
  image?: string
  gender?: 'male' | 'female' | 'other'
  dob?: string
  is_admin?: boolean
  admin_role?: string
  fcm?: string
  status?: 'active' | 'inactive' | 'pending' | 'deleted' | 'suspended' | 'rejected'
}

export interface UpdateUserData extends Partial<CreateUserData> {}

export interface UpdateUserStatusData {
  status: 'active' | 'inactive' | 'pending' | 'deleted' | 'suspended' | 'rejected'
  reject_reason?: string
}

export interface UsersResponse {
  success: boolean
  message: string
  data: User[]
  total_count: number
}

export interface UserResponse {
  success: boolean
  message: string
  data: User
}

export interface UsersQueryParams {
  page_no?: number
  limit?: number
  search?: string
  status?: string
  is_admin?: boolean
  start_date?: string
  end_date?: string
  gender?: string
}