export type PostStatus = 'pending' | 'approved' | 'rejected';

export interface Post {
    _id: string;
    author: {
        name: string;
        image?: string;
    } | null;
    content: string;
    media?: string;
    mediaAlt?: string;
    status: PostStatus;
    like_count: number;
    comment_count: number;
    is_liked: boolean;
    reason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PostsQueryParams {
    page_no?: number;
    limit?: number;
    search?: string;
    status?: PostStatus;
    username?: string;
}

export interface PostsResponse {
    status: number;
    message: string;
    data: Post[];
    total_count: number;
}

export interface ApprovePostData {
    status: 'approved' | 'rejected';
    reason?: string;
}
