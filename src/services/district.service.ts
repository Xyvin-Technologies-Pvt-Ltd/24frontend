import { api } from '@/lib/api'

export interface DistrictData {
    _id: string
    name: string
    uid: string
    createdAt: string
    status: string
    // Add other backend fields if needed
}

export interface DistrictResponse {
    message: string
    data: DistrictData | DistrictData[]
    total_count?: number
}

export const districtService = {
    getDistricts: async (params?: { page_no?: number; limit?: number; search?: string; status?: string; full_data?: boolean }) => {
        const response = await api.get('/district', { params })
        return response.data
    },

    createDistrict: async (data: { name: string }) => {
        const response = await api.post('/district', data)
        return response.data
    },

    getDistrictById: async (id: string) => {
        const response = await api.get(`/district/${id}`)
        return response.data
    },

    updateDistrict: async (id: string, data: { name?: string; status?: string }) => {
        const response = await api.put(`/district/${id}`, data)
        return response.data
    },

    deleteDistrict: async (id: string) => {
        const response = await api.delete(`/district/${id}`)
        return response.data
    }
}
