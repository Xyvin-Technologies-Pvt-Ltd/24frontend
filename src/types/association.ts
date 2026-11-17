export interface MultilingualField {
  en: string
  ml: string
}

export type AssociationStatus = 'pending' | 'active' | 'rejected' | 'suspended' | 'deleted'

export interface AssociationContactPerson {
  name: string
  phone: string
  email: string
  role: string
}

export interface Association {
  _id: string
  name: MultilingualField
  category: string
  about?: MultilingualField
  location?: string
  district?: string | { _id: string; name: string }
  district_name?: string
  ward?: string
  established_year?: number | null
  registration_number?: string
  certificate_url?: string
  banner_image?: string
  logo_image?: string
  monogram?: string
  gradient_start?: string
  gradient_end?: string
  badge_color?: string
  member_count: number
  event_count: number
  profile_views: number
  is_verified: boolean
  status: AssociationStatus
  rejection_reason?: string
  contact_person?: AssociationContactPerson
  social_links?: string[]
  created_by?: {
    _id: string
    name: string
    email?: string
    phone?: string
    image?: string
  }
  createdAt: string
  updatedAt: string
}

export interface AssociationMember {
  _id: string
  association_id: string
  user_id: {
    _id: string
    name: string
    image?: string
    phone?: string
    email?: string
    profession?: string
  }
  role: string
  is_committee: boolean
  status: 'pending' | 'active' | 'rejected' | 'removed'
  joined_at: string
  createdAt: string
}

export interface AssociationDetail extends Association {
  members_count?: number
  committee_members?: AssociationMember[]
}

export interface AssociationFormData {
  name: MultilingualField
  category: string
  about?: MultilingualField
  location?: string
  district?: string
  district_name?: string
  ward?: string
  established_year?: number | null
  registration_number?: string
  certificate_url?: string
  banner_image?: string
  logo_image?: string
  monogram?: string
  gradient_start?: string
  gradient_end?: string
  badge_color?: string
  contact_person?: AssociationContactPerson
  social_links?: string[]
  is_verified?: boolean
  status?: AssociationStatus
}

export interface AssociationQueryParams {
  page_no?: number
  limit?: number
  search?: string
  status?: string
  category?: string
  district?: string
}

export interface AssociationStats {
  total: number
  pending: number
  active: number
  rejected: number
  total_members: number
}

export interface AssociationsResponse {
  success: boolean
  message: string
  data: {
    data: Association[]
    total_count: number
    page_no: number
    limit: number
    total_pages: number
  }
}

export interface AssociationDetailResponse {
  success: boolean
  message: string
  data: AssociationDetail
}

export interface AssociationStatsResponse {
  success: boolean
  message: string
  data: AssociationStats
}
