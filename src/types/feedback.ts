export interface Feedback {
  _id: string
  user: string
  message: string
  source?: string
  createdAt: string
  updatedAt: string
}

export interface FeedbackResponse {
  status: number
  message: string
  data: Feedback[]
  total_count: number
}

export interface FeedbackQueryParams {
  page_no?: number
  limit?: number
  search?: string
}
