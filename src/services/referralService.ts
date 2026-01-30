import { api } from '@/lib/api'
import type { 
  UserReferralData,
  MarkRewardPostedResponse
} from '@/types/referral'

export const referralService = {
  // Get referrals for a specific user (admin view)
  getUserReferrals: async (userId: string): Promise<UserReferralData> => {
    const response = await api.get(`/referral/admin/${userId}`)
    return response.data.data
  },

  // Mark user's reward as posted
  markRewardPosted: async (userId: string): Promise<MarkRewardPostedResponse> => {
    const response = await api.post(`/referral/admin/${userId}/mark-posted`)
    return response.data
  }
}