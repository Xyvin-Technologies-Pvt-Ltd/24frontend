import { api } from '@/lib/api'
import type { 
  CreateCampaignData, 
  UpdateCampaignData, 
  CampaignsResponse, 
  CampaignResponse,
  CampaignsQueryParams,
  ApproveCampaignData
} from '@/types/campaign'

export const campaignService = {
  // Get all campaigns with pagination and filters
  getCampaigns: async (params: CampaignsQueryParams = {}): Promise<CampaignsResponse> => {
    const response = await api.get('/campaign', { params })
    return response.data
  },

  // Get campaign by ID
  getCampaignById: async (id: string): Promise<CampaignResponse> => {
    const response = await api.get(`/campaign/${id}`)
    return response.data
  },

  // Create new campaign
  createCampaign: async (campaignData: CreateCampaignData): Promise<CampaignResponse> => {
    const response = await api.post('/campaign', campaignData)
    return response.data
  },

  // Update campaign
  updateCampaign: async (id: string, campaignData: UpdateCampaignData): Promise<CampaignResponse> => {
    const response = await api.put(`/campaign/${id}`, campaignData)
    return response.data
  },

  // Delete campaign (soft delete)
  deleteCampaign: async (id: string): Promise<CampaignResponse> => {
    const response = await api.delete(`/campaign/${id}`)
    return response.data
  },

  // Approve/Reject campaign (admin only)
  approveCampaign: async (id: string, approvalData: ApproveCampaignData): Promise<CampaignResponse> => {
    const response = await api.put(`/campaign/${id}`, approvalData)
    return response.data
  },

  // Download campaigns as CSV
  downloadCampaigns: async (params: CampaignsQueryParams = {}): Promise<Blob> => {
    const response = await api.get('/campaign/download', { 
      params,
      responseType: 'blob'
    })
    return response.data
  }
}