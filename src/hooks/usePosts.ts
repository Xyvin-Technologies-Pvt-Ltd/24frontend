import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/postService';
import type { PostsQueryParams } from '@/types/post';

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (params: PostsQueryParams) => [...postKeys.lists(), params] as const,
};

// Fetch posts (default pending)
export const usePosts = (params: PostsQueryParams = {}) => {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => postService.getPosts({ ...params, status: 'pending' }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useApprovePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.approvePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
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
    },
  });
};
