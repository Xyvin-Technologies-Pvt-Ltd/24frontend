export interface Promotion {
  _id: string
  type: 'poster'
  start_date: string
  end_date: string
  link?: string
  media: string
  status: 'published' | 'unpublished' | 'expired'
  createdAt: string
  updatedAt: string
}

export interface CreatePromotionData {
  type: 'poster'
  start_date: string
  end_date: string
  link?: string
  media: string
  status?: 'published' | 'unpublished' | 'expired'
}

export interface UpdatePromotionData extends Partial<CreatePromotionData> {}

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
  type?: 'poster'
  search?: string
  status?: 'published' | 'unpublished' | 'expired'
  start_date?: string
  end_date?: string
}