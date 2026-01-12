import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { promotionService } from '@/services/promotionService'
import type { 
  CreatePromotionData, 
  UpdatePromotionData, 
  PromotionsQueryParams
} from '@/types/promotion'

// Query keys
export const promotionKeys = {
  all: ['promotions'] as const,
  lists: () => [...promotionKeys.all, 'list'] as const,
  list: (params: PromotionsQueryParams) => [...promotionKeys.lists(), params] as const,
  details: () => [...promotionKeys.all, 'detail'] as const,
  detail: (id: string) => [...promotionKeys.details(), id] as const,
  userPromotions: () => [...promotionKeys.all, 'user'] as const,
}

// Get promotions with pagination and filters
export const usePromotions = (params: PromotionsQueryParams = {}) => {
  return useQuery({
    queryKey: promotionKeys.list(params),
    queryFn: () => promotionService.getPromotions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single promotion by ID
export const usePromotion = (id: string) => {
  return useQuery({
    queryKey: promotionKeys.detail(id),
    queryFn: () => promotionService.getPromotionById(id),
    enabled: !!id,
  })
}

// Get published promotions for users
export const usePromotionsForUser = (params: PromotionsQueryParams = {}) => {
  return useQuery({
    queryKey: promotionKeys.userPromotions(),
    queryFn: () => promotionService.getPromotionsForUser(params),
    staleTime: 5 * 60 * 1000,
  })
}

// Create promotion mutation
export const useCreatePromotion = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (promotionData: CreatePromotionData) => promotionService.createPromotion(promotionData),
    onSuccess: () => {
      // Invalidate and refetch promotions list
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: promotionKeys.userPromotions() })
    },
    onError: (error: any) => {
      console.error('Failed to create promotion:', error)
      // The error will be available in the component via mutation.error
    },
  })
}

// Update promotion mutation
export const useUpdatePromotion = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, promotionData }: { id: string; promotionData: UpdatePromotionData }) => 
      promotionService.updatePromotion(id, promotionData),
    onSuccess: (_, variables) => {
      // Invalidate promotions list and specific promotion detail
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: promotionKeys.userPromotions() })
    },
  })
}

// Delete promotion mutation
export const useDeletePromotion = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => promotionService.deletePromotion(id),
    onSuccess: () => {
      // Invalidate promotions list
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: promotionKeys.userPromotions() })
    },
  })
}