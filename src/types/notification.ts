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
  status: "Published" | "Unpublished" | "sended"
  send_date: string
  is_all: boolean
  tag: string
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationData {
  type: ('email' | 'in-app' | 'whatsapp')[]
  subject: string
  content: string
  image?: string
  link?: string
  users?: string[]
  is_all?: boolean
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