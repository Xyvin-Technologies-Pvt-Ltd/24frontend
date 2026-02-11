export interface Promotion {
  _id: string
  type: 'poster' | 'video'
  start_date: string
  end_date: string
  link?: string
  media: string
  status: 'published' | 'unpublished' | 'expired'
  priority?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePromotionData {
  type: 'poster' | 'video'
  start_date: string
  end_date: string
  link?: string
  media: string
  status?: 'published' | 'unpublished' | 'expired'
  priority?: string
}

export interface UpdatePromotionData extends Partial<CreatePromotionData> { }

// Backend response format
export interface BackendPromotionsResponse {
  status: number
  message: string
  data: Promotion[]
  total_count: number
}

export interface BackendPromotionResponse {
  status: number
  message: string
  data: Promotion
  total_count?: null
}

// Frontend interface for consistency
export interface PromotionsResponse {
  success: boolean
  message: string
  data: Promotion[]
  total_count: number
}

export interface PromotionResponse {
  success: boolean
  message: string
  data: Promotion
}

export interface PromotionsQueryParams {
  page_no?: number
  limit?: number
  type?: 'poster' | 'video'
  search?: string
  status?: 'published' | 'unpublished' | 'expired'
  start_date?: string
  end_date?: string
}