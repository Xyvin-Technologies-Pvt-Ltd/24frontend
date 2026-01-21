import { api } from '@/lib/api'
import type { 
  CreateDistrictData,
  UpdateDistrictData,
  DistrictsResponse,
  DistrictResponse,
  DistrictsQueryParams
} from '@/types/district'

export const districtService = {
  // Get all districts
  getDistricts: async (params: DistrictsQueryParams = {}): Promise<DistrictsResponse> => {
    const response = await api.get('/district', { params })
    return response.data
  },

  // Get district by ID
  getDistrictById: async (id: string): Promise<DistrictResponse> => {
    const response = await api.get(`/district/${id}`)
    return response.data
  },

  // Create district
  createDistrict: async (districtData: CreateDistrictData): Promise<DistrictResponse> => {
    const response = await api.post('/district', districtData)
    return response.data
  },

  // Update district
  updateDistrict: async (id: string, districtData: UpdateDistrictData): Promise<DistrictResponse> => {
    const response = await api.put(`/district/${id}`, districtData)
    return response.data
  },

  // Delete district
  deleteDistrict: async (id: string): Promise<DistrictResponse> => {
    const response = await api.delete(`/district/${id}`)
    return response.data
  }
}
