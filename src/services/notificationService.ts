import { api } from '@/lib/api'
import type { 
  CreateNotificationData, 
  UpdateNotificationData, 
  NotificationsResponse, 
  NotificationResponse,
  NotificationsQueryParams,
} from '@/types/notification'

export const notificationService = {
  getNotifications: async (params: NotificationsQueryParams = {}): Promise<NotificationsResponse> => {
    const response = await api.get('/notification', { params })
    return response.data
  },

  getNotificationById: async (id: string): Promise<NotificationResponse> => {
    const response = await api.get(`/notification/${id}`)
    return response.data
  },

  createNotification: async (notificationData: CreateNotificationData): Promise<NotificationResponse> => {
    const response = await api.post('/notification', notificationData)
    return response.data
  },

  updateNotification: async (id: string, notificationData: UpdateNotificationData): Promise<NotificationResponse> => {
    const response = await api.put(`/notification/${id}`, notificationData)
    return response.data
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<NotificationResponse> => {
    const response = await api.delete(`/notification/${id}`)
    return response.data
  },

  // Send notification
  sendNotification: async (id: string): Promise<NotificationResponse> => {
    const response = await api.post(`/notification/send/${id}`)
    return response.data
  }
}