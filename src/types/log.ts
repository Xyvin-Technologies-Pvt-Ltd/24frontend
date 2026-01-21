export interface Log {
    _id: string
    action: string
    method: string
    route: string
    createdAt: string
    status_code: number
    ip: string
    user_agent: string
    request_body: any
    error_message?: string
    user_name: string
    user_type: "Admin" | "User"
}

export interface LogsResponse {
    success: boolean
    message: string
    data: Log[]
    total_count: number
}

export interface LogsQueryParams {
    page_no?: number
    limit?: number
    search?: string
    user_type?: "admin" | "user"
}
