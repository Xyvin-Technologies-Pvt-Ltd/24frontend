export interface Resource {
  _id: string
  content_name: string
  category: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface CreateResourceData {
  content_name: string
  category: string
  content: string
}

export interface UpdateResourceData extends Partial<CreateResourceData> {}

// Backend response format
export interface BackendResourcesResponse {
  status: number
  message: string
  data: Resource[]
  total_count: number
}

export interface BackendResourceResponse {
  status: number
  message: string
  data: Resource
  total_count?: null
}

// Frontend interface for consistency
export interface ResourcesResponse {
  success: boolean
  message: string
  data: Resource[]
  total_count: number
}

export interface ResourceResponse {
  success: boolean
  message: string
  data: Resource
}

export interface ResourcesQueryParams {
  page_no?: number
  limit?: number
  category?: string
}