export type PostStatus = 'pending' | 'approved' | 'rejected' | 'reported' | 'deleted';

export interface Post {
    _id: string;
    author: {
        name: string;
        image?: string;
        district?: string;
    } | null;
    content: string;
    type?: 'image' | 'video';
    media?: string;
    mediaAlt?: string;
    status: PostStatus;
    like_count: number;
    comment_count: number;
    is_liked: boolean;
    reason?: string;
    approved_at?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PostsQueryParams {
    page_no?: number;
    limit?: number;
    search?: string;
    status?: PostStatus;
    username?: string;
    created_date_from?: string;
    created_date_to?: string;
    approved_date_from?: string;
    approved_date_to?: string;
}

export interface PostsResponse {
    status: number;
    message: string;
    data: Post[];
    total_count: number;
}

export interface PostAnalyticsMetric {
    value: number;
    growth: number;
    trend: 'up' | 'down' | 'neutral';
}

export interface PostAnalyticsData {
    total_posts: PostAnalyticsMetric;
    pending_posts: PostAnalyticsMetric;
}

export interface PostAnalyticsWithoutPendingData {
    total_posts: PostAnalyticsMetric;
}

export interface PostAnalyticsResponse {
    status: number;
    message: string;
    data: PostAnalyticsData;
}

export interface PostAnalyticsWithoutPendingResponse {
    status: number;
    message: string;
    data: PostAnalyticsWithoutPendingData;
}

export interface ApprovePostData {
    status: 'approved' | 'rejected';
    reason?: string;
}
