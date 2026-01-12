import { api } from '@/lib/api'
import type { 
  CreatePromotionData, 
  UpdatePromotionData, 
  PromotionsResponse, 
  PromotionResponse,
  PromotionsQueryParams,
  BackendPromotionsResponse,
  BackendPromotionResponse
} from '@/types/promotion'

export const promotionService = {
  // Get all promotions with pagination and filters
  getPromotions: async (params: PromotionsQueryParams = {}): Promise<PromotionsResponse> => {
    const response = await api.get('/promotion', { params })
    const backendResponse: BackendPromotionsResponse = response.data
    
    // Transform backend response to frontend format
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data,
      total_count: backendResponse.total_count
    }
  },

  // Get promotion by ID
  getPromotionById: async (id: string): Promise<PromotionResponse> => {
    const response = await api.get(`/promotion/${id}`)
    const backendResponse: BackendPromotionResponse = response.data
    
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data
    }
  },

  // Get published promotions for users
  getPromotionsForUser: async (params: PromotionsQueryParams = {}): Promise<PromotionsResponse> => {
    const response = await api.get('/promotion/user', { params })
    const backendResponse: BackendPromotionsResponse = response.data
    
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data,
      total_count: backendResponse.total_count
    }
  },

  // Create new promotion
  createPromotion: async (promotionData: CreatePromotionData): Promise<PromotionResponse> => {
    const response = await api.post('/promotion', promotionData)
    const backendResponse: BackendPromotionResponse = response.data
    
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data
    }
  },

  // Update promotion
  updatePromotion: async (id: string, promotionData: UpdatePromotionData): Promise<PromotionResponse> => {
    const response = await api.put(`/promotion/${id}`, promotionData)
    const backendResponse: BackendPromotionResponse = response.data
    
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data
    }
  },

  // Delete promotion
  deletePromotion: async (id: string): Promise<PromotionResponse> => {
    const response = await api.delete(`/promotion/${id}`)
    const backendResponse: BackendPromotionResponse = response.data
    
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data
    }
  }
}