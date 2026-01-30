export interface Referral {
  _id: string
  referrer: string
  referee: {
    _id: string
    name: string
    email: string
    phone: string
    campus?: {
      _id: string
      name: string
      district?: {
        _id: string
        name: string
      }
    }
    createdAt: string
  }
  status: 'applied' | 'invalidated'
  createdAt: string
  updatedAt: string
}

export interface ReferralSummary {
  referral_code: string
  count: number
  target: number
  reward_status: 'not_eligible' | 'eligible' | 'posted'
  referrals: Referral[]
}

export interface UserReferralData {
  user: {
    _id: string
    name: string
    referral_code: string
    referral_count: number
    referral_reward_status: 'not_eligible' | 'eligible' | 'posted'
  }
  target: number
  referrals: Referral[]
}

export interface ReferralResponse {
  success: boolean
  message: string
  data: ReferralSummary | UserReferralData
}

export interface MarkRewardPostedResponse {
  success: boolean
  message: string
  data: {
    _id: string
    referral_reward_status: 'posted'
    referral_reward_posted_at: string
  }
}