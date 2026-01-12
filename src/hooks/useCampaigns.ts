import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { campaignService } from '@/services/campaignService'
import type { 
  CreateCampaignData, 
  UpdateCampaignData, 
  CampaignsQueryParams,
  ApproveCampaignData
} from '@/types/campaign'

// Query keys
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (params: CampaignsQueryParams) => [...campaignKeys.lists(), params] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
}

// Get campaigns with pagination and filters
export const useCampaigns = (params: CampaignsQueryParams = {}) => {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () => campaignService.getCampaigns(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single campaign by ID
export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignService.getCampaignById(id),
    enabled: !!id,
  })
}

// Create campaign mutation
export const useCreateCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (campaignData: CreateCampaignData) => 
      campaignService.createCampaign(campaignData),
    onSuccess: () => {
      // Invalidate and refetch campaigns list
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
    },
  })
}

// Update campaign mutation
export const useUpdateCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignData }) =>
      campaignService.updateCampaign(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

// Delete campaign mutation
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
    },
  })
}

// Approve/Reject campaign mutation (admin only)
export const useApproveCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveCampaignData }) =>
      campaignService.approveCampaign(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

// Download campaigns mutation
export const useDownloadCampaigns = () => {
  return useMutation({
    mutationFn: (params: CampaignsQueryParams = {}) => 
      campaignService.downloadCampaigns(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `campaigns-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
  })
}