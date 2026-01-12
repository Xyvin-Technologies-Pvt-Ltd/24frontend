import { api } from '@/lib/api'
import type { 
  CreatePromotionData, 
  UpdatePromotionData, 
  PromotionsResponse, 
  PromotionResponse,
  PromotionsQueryParams
} from '@/types/promotion'

export const promotionService = {
  // Get all promotions with pagination and filters
  getPromotions: async (params: PromotionsQueryParams = {}): Promise<PromotionsResponse> => {
    const response = await api.get('/promotion', { params })
    return response.data
  },

  // Get promotion by ID
  getPromotionById: async (id: string): Promise<PromotionResponse> => {
    const response = await api.get(`/promotion/${id}`)
    return response.data
  },

  // Get published promotions for users
  getPromotionsForUser: async (params: PromotionsQueryParams = {}): Promise<PromotionsResponse> => {
    const response = await api.get('/promotion/user', { params })
    return response.data
  },

  // Create new promotion
  createPromotion: async (promotionData: CreatePromotionData): Promise<PromotionResponse> => {
    const response = await api.post('/promotion', promotionData)
    return response.data
  },

  // Update promotion
  updatePromotion: async (id: string, promotionData: UpdatePromotionData): Promise<PromotionResponse> => {
    const response = await api.put(`/promotion/${id}`, promotionData)
    return response.data
  },

  // Delete promotion
  deletePromotion: async (id: string): Promise<PromotionResponse> => {
    const response = await api.delete(`/promotion/${id}`)
    return response.data
  }
}