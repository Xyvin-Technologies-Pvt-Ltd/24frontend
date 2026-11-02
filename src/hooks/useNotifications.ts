import { keepPreviousData, useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notificationService'
import type { 
  CreateNotificationData, 
  UpdateNotificationData,
  NotificationsQueryParams,
  AudienceQueryParams,
} from '@/types/notification'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: NotificationsQueryParams) => [...notificationKeys.lists(), params] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  userNotifications: () => [...notificationKeys.all, 'user'] as const,
  userList: (params: NotificationsQueryParams) => [...notificationKeys.userNotifications(), params] as const,
  audience: (params: AudienceQueryParams) => [...notificationKeys.all, 'audience', params] as const,
  audienceSummary: () => [...notificationKeys.all, 'audience-summary'] as const,
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
    // keep refreshing while emails are going out, so the counts update live
    refetchInterval: (query) =>
      ['pending', 'sending'].includes(query.state.data?.data?.email?.status || '') ? 3000 : false,
  })
}

// Paged user list for the audience picker ("Load more" fetches the next page)
export const useNotificationAudience = (params: Omit<AudienceQueryParams, 'page_no'> = {}, enabled = true) =>
  useInfiniteQuery({
    queryKey: notificationKeys.audience(params),
    queryFn: ({ pageParam }) => notificationService.getAudience({ ...params, page_no: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0)
      return loaded < lastPage.total_count ? allPages.length + 1 : undefined
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })

export const useNotificationAudienceSummary = () =>
  useQuery({
    queryKey: notificationKeys.audienceSummary(),
    queryFn: () => notificationService.getAudienceSummary(),
    staleTime: 60 * 1000,
  })



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
