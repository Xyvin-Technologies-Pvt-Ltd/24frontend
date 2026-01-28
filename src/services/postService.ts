import { api } from '@/lib/api';
import type { PostsResponse, PostsQueryParams,  Post } from '@/types/post';

export const postService = {
  getPosts: async (params: PostsQueryParams = {}): Promise<PostsResponse> => {
    const response = await api.get('/feeds', { params }); 
    return response.data;
  },

  approvePost: async (id: string): Promise<{ status: number; message: string; data: Post }> => {
    const response = await api.patch(`/feeds/approve/approved/${id}`);
    return response.data;
  },

  rejectPost: async (id: string, reason?: string): Promise<{ status: number; message: string; data: Post }> => {
    const response = await api.patch(`/feeds/approve/rejected/${id}`, { reason });
    return response.data;
  },
};
