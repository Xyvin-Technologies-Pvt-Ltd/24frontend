import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notificationService'
import type { 
  CreateNotificationData, 
  UpdateNotificationData,
  NotificationsQueryParams,
} from '@/types/notification'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: NotificationsQueryParams) => [...notificationKeys.lists(), params] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  userNotifications: () => [...notificationKeys.all, 'user'] as const,
  userList: (params: NotificationsQueryParams) => [...notificationKeys.userNotifications(), params] as const,
}

export const useNotifications = (params: NotificationsQueryParams = {}) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 5 * 60 * 1000, 
  })
}

export const useNotification = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.getNotificationById(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  })
}



export const useCreateNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (notificationData: CreateNotificationData) => 
      notificationService.createNotification(notificationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

export const useUpdateNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, notificationData }: { id: string; notificationData: UpdateNotificationData }) => 
      notificationService.updateNotification(id, notificationData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(variables.id) })
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

export const useSendNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => notificationService.sendNotification(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) })
    },
  })
}
