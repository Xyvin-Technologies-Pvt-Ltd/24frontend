import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feedbackService } from '@/services/feedbackService'
import type { FeedbackQueryParams } from '@/types/feedback'

const feedbackKeys = {
  all: ['feedback'] as const,
  lists: () => [...feedbackKeys.all, 'list'] as const,
  list: (params: FeedbackQueryParams) => [...feedbackKeys.lists(), params] as const,
}

export const useFeedbacks = (params: FeedbackQueryParams = {}) => {
  return useQuery({
    queryKey: feedbackKeys.list(params),
    queryFn: () => feedbackService.getFeedbacks(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => feedbackService.deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() })
    },
  })
}
