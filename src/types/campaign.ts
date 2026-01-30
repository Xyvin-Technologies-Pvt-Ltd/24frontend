export interface Campaign {
  _id: string
  title: string
  description: string
  cover_image?: string
  tag: string
  start_date: string
  target_date: string
  target_amount: number
  collected_amount: number
  status: 'active' | 'pending' | 'completed' | 'deleted'
  approval_status: 'approved' | 'pending' | 'rejected'
  reason?: string
  organized_by: string
  created_by: string
  updated_by?: string
  deleted_by?: string
  createdAt: string
  updatedAt: string
  // Aggregated fields from API
  total_amount?: number
  total_donors?: number
  total_donor_count?: number // Backend returns this field
  total_donation?: number
  total_donated_users?: number
}

export interface CreateCampaignData {
  title: string
  description: string
  cover_image: string  // Now required
  tag: string
  start_date: string
  target_date: string
  target_amount: number
  organized_by: string
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  status?: Campaign['status']
  approval_status?: Campaign['approval_status']
  reason?: string
}

export interface CampaignsQueryParams {
  page_no?: number
  limit?: number
  search?: string
  category?: string
  approval_status?: Campaign['approval_status']
  status?: Campaign['status']
  start_date?: string
  end_date?: string
  my_campaigns?: boolean
}

export interface CampaignsResponse {
  status: number
  message: string
  data: Campaign[]
  total_count: number
}

export interface CampaignResponse {
  status: number
  message: string
  data: Campaign
}

export interface ApproveCampaignData {
  approval_status: 'approved' | 'rejected'
  reason?: string
}