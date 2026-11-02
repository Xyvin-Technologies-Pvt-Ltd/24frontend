import type { MultilingualField } from './event'

export type InitiativeStatus = 'active' | 'inactive' | 'deleted'

export interface CertificateTextLayout {
  enabled?: boolean
  x?: number
  y?: number
  font_size?: number
  color?: string
  align?: 'left' | 'center' | 'right'
  max_width?: number
  font?: 'serif' | 'sans'
  bold?: boolean
  prefix?: string
}

export interface CertificatePhotoLayout {
  enabled?: boolean
  x?: number
  y?: number
  width?: number
  height?: number
  shape?: 'circle' | 'rounded' | 'square'
  border_color?: string
  border_width?: number
}

export interface CertificateLayout {
  photo: CertificatePhotoLayout
  name: CertificateTextLayout
  campaign_name: CertificateTextLayout
  join_date: CertificateTextLayout
  certificate_id: CertificateTextLayout
}

export type CertificateTextElement = Exclude<keyof CertificateLayout, 'photo'>

export interface InitiativeCertificate {
  template_image?: string
  template_width?: number
  template_height?: number
  template_version?: number
  id_prefix?: string
  layout?: Partial<CertificateLayout>
}

export interface Initiative {
  _id: string
  title: MultilingualField
  description: MultilingualField
  pledge_text?: MultilingualField
  banner_image?: string
  status: InitiativeStatus
  certificate: InitiativeCertificate
  certificate_sequence?: number
  participants_count?: number
  certificate_downloads?: number
  photo_aspect_ratio?: number
  template_size?: { width: number; height: number }
  default_layout?: CertificateLayout
  createdAt: string
  updatedAt: string
}

export interface InitiativeParticipant {
  _id: string
  initiative: string
  user?: { _id: string; name?: string; image?: string; id_number?: string } | string
  full_name: string
  phone?: string
  district?: { _id: string; name?: string } | string | null
  location: string
  photo: string
  pledge_accepted: boolean
  joined_at: string
  certificate_id: string
  certificate: {
    png_url: string | null
    pdf_url: string | null
    generated_at: string | null
  }
  downloads: { png: number; pdf: number }
  shares: number
}

export interface InitiativeAnalytics {
  total_signups: number
  signups_today: number
  signups_last_7_days: number
  certificate_downloads: number
  png_downloads: number
  pdf_downloads: number
  users_downloaded: number
  shares: number
}

export interface InitiativesQueryParams {
  page_no?: number
  limit?: number
  search?: string
  status?: Exclude<InitiativeStatus, 'deleted'>
}

export interface ParticipantsQueryParams {
  page_no?: number
  limit?: number
  search?: string
  start_date?: string
  end_date?: string
}

export interface InitiativeFormData {
  title: MultilingualField
  description: MultilingualField
  pledge_text: MultilingualField
  banner_image: string
  status: Exclude<InitiativeStatus, 'deleted'>
  certificate: {
    template_image: string
    id_prefix: string
    layout: CertificateLayout
  }
}

export interface CertificatePreviewData {
  title?: { en?: string; ml?: string }
  certificate?: {
    template_image?: string
    id_prefix?: string
    layout?: Partial<CertificateLayout>
  }
  full_name?: string
  photo?: string
}

export interface BackendListResponse<T> {
  status: number
  message: string
  data: T[]
  total_count: number
}

export interface BackendItemResponse<T> {
  status: number
  message: string
  data: T
}
