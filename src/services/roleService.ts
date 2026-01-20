import { api } from '@/lib/api'
import type {
    CreateRoleData,
    UpdateRoleData,
    RolesResponse,
    RoleResponse,
    RolesQueryParams,
} from '@/types/role'

export const roleService = {
    getRoles: async (params: RolesQueryParams = {}): Promise<RolesResponse> => {
        const response = await api.get('/roles', { params })
        return response.data
    },

    getRoleById: async (id: string): Promise<RoleResponse> => {
        const response = await api.get(/roles/${ id })
        return response.data
    },
    createRole: async (roleData: CreateRoleData): Promise<RoleResponse> => {
        const response = await api.post('/roles', roleData)
        return response.data
    },
    updateRole: async (id: string, roleData: UpdateRoleData): Promise<RoleResponse> => {
        const response = await api.put(/roles/${ id }, roleData)
        return response.data
    },

    deleteRole: async (id: string): Promise<RoleResponse> => {
        const response = await api.delete(/roles/${ id })
        return response.data
    }
}