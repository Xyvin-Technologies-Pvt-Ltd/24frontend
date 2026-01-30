import { api } from '@/lib/api'

export interface CampusData {
    _id: string
    name: string
    uid: string
    district: string // This is the district ID
    createdAt: string
    status: string
}

export const campusService = {
    getCampuses: async (params?: { page_no?: number; limit?: number; search?: string; status?: string; district?: string }) => {
        const response = await api.get('/campus', { params })
        return response.data
    },

    createCampus: async (data: { name: string; district: string }) => {
        const response = await api.post('/campus', data)
        return response.data
    },

    getCampusById: async (id: string) => {
        const response = await api.get(`/campus/${id}`)
        return response.data
    },

    updateCampus: async (id: string, data: { name?: string; district?: string; status?: string }) => {
        const response = await api.put(`/campus/${id}`, data)
        return response.data
    },

    deleteCampus: async (id: string) => {
        const response = await api.delete(`/campus/${id}`)
        return response.data
    }
}
