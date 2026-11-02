export interface Notification {
  _id: string
  type: ('email' | 'in-app' | 'whatsapp')[]
  subject: string
  content: string
  image?: string
  link?: string
  users: {
    user: string
    read: boolean
  }[]
  status: "Published" | "Unpublished" | "sended" | "drafted"
  send_date: string
  is_all: boolean
  target_profession?: string
  tag: string
  // phone push result (in-app)
  push?: {
    sent: number
    failed: number
    no_device: number
    error?: string
  }
  // email delivery result
  email?: {
    status?: 'pending' | 'sending' | 'sent' | 'partially_sent' | 'failed'
    total: number
    sent: number
    failed: number
    no_email: number
    error?: string
    sent_at?: string
  }
  // admin only: the users picked for a "selected users" notification
  selected_users?: AudienceUser[]
  createdAt: string
  updatedAt: string
}

export interface AudienceUser {
  _id: string
  name?: string
  phone?: string
  email?: string
  image?: string
  id_number?: string
}

export interface AudienceSummary {
  total_users: number
  users_with_email: number
  users_with_device: number
}

export interface AudienceQueryParams {
  page_no?: number
  limit?: number
  search?: string
}

export interface AudienceUsersResponse {
  status: number
  message: string
  data: AudienceUser[]
  total_count: number
}

export interface CreateNotificationData {
  type: ('email' | 'in-app' | 'whatsapp')[]
  subject: string
  content: string
  image?: string
  link?: string
  users?: string[]
  is_all?: boolean
  target_profession?: string
  send_date?: string
  status?: string
}

export interface UpdateNotificationData extends Partial<CreateNotificationData> {}

export interface NotificationsResponse {
  success: boolean
  message: string
  data: Notification[]
  total_count: number
}

export interface NotificationResponse {
  success: boolean
  message: string
  data: Notification
}

export interface NotificationsQueryParams {
  page_no?: number
  limit?: number
  search?: string
  status?: string[]
  start_date?: string
  end_date?: string
}

export interface BulkDeleteData {
  ids: string[]
}