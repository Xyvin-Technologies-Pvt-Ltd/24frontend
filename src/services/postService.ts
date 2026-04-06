import { api } from '@/lib/api';
import type {
  PostsResponse,
  PostsQueryParams,
  Post,
  PostAnalyticsResponse,
  PostAnalyticsWithoutPendingResponse,
} from '@/types/post';

export const postService = {
  getPosts: async (params: PostsQueryParams = {}): Promise<PostsResponse> => {
    const response = await api.get('/feeds', { params }); 
    return response.data;
  },

  getPostsWithoutPending: async (params: PostsQueryParams = {}): Promise<PostsResponse> => {
    const response = await api.get('/feeds/without-pending', { params });
    return response.data;
  },

  getFeedAnalytics: async (): Promise<PostAnalyticsResponse> => {
    const response = await api.get('/feeds/analytics');
    return response.data;
  },

  getFeedAnalyticsWithoutPending: async (): Promise<PostAnalyticsWithoutPendingResponse> => {
    const response = await api.get('/feeds/analytics/without-pending');
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

  deletePost: async (id: string): Promise<{ status: number; message: string; data: Post }> => {
    const response = await api.delete(`/feeds/${id}`);
    return response.data;
  },
};
