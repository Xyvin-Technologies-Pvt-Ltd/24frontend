import { api } from '@/lib/api'
import type {
    CreateCampusData,
    UpdateCampusData,
    CampusesResponse,
    CampusResponse,
    CampusesQueryParams
} from '@/types/campus'

export const campusService = {
    getCampuses: async (params: CampusesQueryParams = {}): Promise<CampusesResponse> => {
        const response = await api.get('/campus', { params })
        return response.data
    },

    getCampusById: async (id: string): Promise<CampusResponse> => {
        const response = await api.get(`/campus/${id}`)
        return response.data
    },

    createCampus: async (campusData: CreateCampusData): Promise<CampusResponse> => {
        const response = await api.post('/campus', campusData)
        return response.data
    },

    updateCampus: async (id: string, campusData: UpdateCampusData): Promise<CampusResponse> => {
        const response = await api.put(`/campus/${id}`, campusData)
        return response.data
    },

    deleteCampus: async (id: string): Promise<CampusResponse> => {
        const response = await api.delete(`/campus/${id}`)
        return response.data
    }
}
