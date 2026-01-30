import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { referralService } from '@/services/referralService'

// Query keys
export const referralKeys = {
  all: ['referrals'] as const,
  user: (userId: string) => [...referralKeys.all, 'user', userId] as const,
}

// Get user referrals (for admin view)
export const useUserReferrals = (userId: string) => {
  return useQuery({
    queryKey: referralKeys.user(userId),
    queryFn: () => referralService.getUserReferrals(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mark reward as posted mutation
export const useMarkRewardPosted = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: string) => referralService.markRewardPosted(userId),
    onSuccess: (_, userId) => {
      // Invalidate and refetch user referrals
      queryClient.invalidateQueries({ queryKey: referralKeys.user(userId) })
    },
  })
}