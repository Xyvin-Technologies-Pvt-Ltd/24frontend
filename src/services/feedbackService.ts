import { api } from '@/lib/api'
import type { FeedbackResponse, FeedbackQueryParams, Feedback } from '@/types/feedback'

export const feedbackService = {
  getFeedbacks: async (params: FeedbackQueryParams = {}): Promise<FeedbackResponse> => {
    const response = await api.get('/feedback', { params })
    return response.data
  },

  deleteFeedback: async (id: string): Promise<{ status: number; message: string; data: Feedback }> => {
    const response = await api.delete(`/feedback/${id}`)
    return response.data
  },
}
