export interface Role {
  _id: string
  role_name: string
  description: string
  permissions: string[]
  status: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateRoleData {
  role_name: string
  description: string
  permissions: string[]
  status?: boolean
}

export interface UpdateRoleData extends Partial<CreateRoleData> {
  status?: boolean
}

export interface RolesResponse {
  success: boolean
  message: string
  data: Role[]
  total_count: number
}

export interface RoleResponse {
  success: boolean
  message: string
  data: Role
}

export interface RolesQueryParams {
  page_no?: number
  limit?: number
  search?: string
}