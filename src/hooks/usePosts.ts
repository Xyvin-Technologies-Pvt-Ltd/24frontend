import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/postService';
import type { PostsQueryParams } from '@/types/post';

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (params: PostsQueryParams) => [...postKeys.lists(), params] as const,
  analytics: () => [...postKeys.all, 'analytics'] as const,
  analyticsWithoutPending: () => [...postKeys.all, 'analytics-without-pending'] as const,
};

// Fetch posts (default pending)
export const usePosts = (params: PostsQueryParams = {}) => {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () =>
      postService.getPosts({
        ...params,
        status: params.status ?? 'pending',
      }),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePostsWithoutPending = (params: PostsQueryParams = {}) => {
  return useQuery({
    queryKey: [...postKeys.lists(), 'without-pending', params],
    queryFn: () => postService.getPostsWithoutPending(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useApprovePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.approvePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.analytics() });
    },
  });
};

export const useRejectPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      postService.rejectPost(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.analytics() });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.analytics() });
    },
  });
};

export const usePostAnalytics = () => {
  return useQuery({
    queryKey: postKeys.analytics(),
    queryFn: () => postService.getFeedAnalytics(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePostAnalyticsWithoutPending = () => {
  return useQuery({
    queryKey: postKeys.analyticsWithoutPending(),
    queryFn: () => postService.getFeedAnalyticsWithoutPending(),
    staleTime: 5 * 60 * 1000,
  });
};
