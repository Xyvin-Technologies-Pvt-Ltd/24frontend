import { api } from "@/lib/api"
import type {
  AssociationFormData,
  AssociationsResponse,
  AssociationDetailResponse,
  AssociationStatsResponse,
  AssociationQueryParams,
  AssociationStatus,
} from "@/types/association"

export const associationService = {
  // Admin list all associations with pagination and filters
  getAssociations: async (
    params: AssociationQueryParams = {}
  ): Promise<AssociationsResponse> => {
    const response = await api.get("/association/admin/all", { params })
    return response.data
  },

  // Admin get association detail by ID
  getAssociationById: async (
    id: string
  ): Promise<AssociationDetailResponse> => {
    const response = await api.get(`/association/admin/${id}`)
    return response.data
  },

  // Admin get stats
  getAssociationStats: async (): Promise<AssociationStatsResponse> => {
    const response = await api.get("/association/admin/stats")
    return response.data
  },

  // Create new association
  createAssociation: async (
    data: AssociationFormData
  ): Promise<AssociationDetailResponse> => {
    const response = await api.post("/association", data)
    return response.data
  },

  // Admin update association
  updateAssociation: async (
    id: string,
    data: Partial<AssociationFormData>
  ): Promise<AssociationDetailResponse> => {
    const response = await api.put(`/association/admin/${id}`, data)
    return response.data
  },

  // Admin update status (approve, reject, suspend)
  updateAssociationStatus: async (
    id: string,
    payload: {
      status: AssociationStatus
      is_verified?: boolean
      rejection_reason?: string
    }
  ): Promise<AssociationDetailResponse> => {
    const response = await api.put(`/association/admin/${id}/status`, payload)
    return response.data
  },

  // Admin soft delete association
  deleteAssociation: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/association/admin/${id}`)
    return response.data
  },
}
