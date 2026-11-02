import { api } from '@/lib/api'
import type {
  BackendItemResponse,
  BackendListResponse,
  CertificateLayout,
  CertificatePreviewData,
  Initiative,
  InitiativeAnalytics,
  InitiativeFormData,
  InitiativeParticipant,
  InitiativesQueryParams,
  ParticipantsQueryParams,
} from '@/types/initiative'

export const initiativeService = {
  // Get campaigns (admin sees active + inactive)
  getInitiatives: async (params: InitiativesQueryParams = {}): Promise<BackendListResponse<Initiative>> => {
    const response = await api.get('/initiatives', { params })
    return response.data
  },

  getInitiativeById: async (id: string): Promise<BackendItemResponse<Initiative>> => {
    const response = await api.get(`/initiatives/${id}`)
    return response.data
  },

  createInitiative: async (data: InitiativeFormData): Promise<BackendItemResponse<Initiative>> => {
    const response = await api.post('/initiatives', data)
    return response.data
  },

  updateInitiative: async (id: string, data: Partial<InitiativeFormData>): Promise<BackendItemResponse<Initiative>> => {
    const response = await api.put(`/initiatives/${id}`, data)
    return response.data
  },

  // Turn the campaign on/off in the app
  updateInitiativeStatus: async (id: string, status: 'active' | 'inactive'): Promise<BackendItemResponse<Initiative>> => {
    const response = await api.patch(`/initiatives/${id}/status`, { status })
    return response.data
  },

  deleteInitiative: async (id: string): Promise<BackendItemResponse<Initiative>> => {
    const response = await api.delete(`/initiatives/${id}`)
    return response.data
  },

  getParticipants: async (id: string, params: ParticipantsQueryParams = {}): Promise<BackendListResponse<InitiativeParticipant>> => {
    const response = await api.get(`/initiatives/${id}/participants`, { params })
    return response.data
  },

  // Download participants as CSV
  downloadParticipants: async (id: string, params: ParticipantsQueryParams = {}): Promise<Blob> => {
    const response = await api.get(`/initiatives/${id}/participants/download`, {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  getAnalytics: async (id: string): Promise<BackendItemResponse<InitiativeAnalytics>> => {
    const response = await api.get(`/initiatives/${id}/analytics`)
    return response.data
  },

  // Built-in template layout, used as the form's starting values
  getCertificateDefaults: async (): Promise<BackendItemResponse<{ layout: CertificateLayout; template_size: { width: number; height: number } }>> => {
    const response = await api.get('/initiatives/certificate/defaults')
    return response.data
  },

  // Render certificate settings with sample data (nothing is saved)
  previewCertificate: async (data: CertificatePreviewData): Promise<Blob> => {
    const response = await api.post('/initiatives/certificate/preview', data, { responseType: 'blob' })
    return response.data
  },
}
