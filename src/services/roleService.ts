import { api } from '@/lib/api'

export interface Role {
    _id: string
    role_name: string
    permissions: string[]
    status: string
    createdAt: string
    updatedAt: string
}

export interface RolesResponse {
    message: string
    data: Role[]
}

export const roleService = {
    // Get all roles
    getRoles: async (): Promise<RolesResponse> => {
        const response = await api.get('/roles')
        return response.data
    },
}
