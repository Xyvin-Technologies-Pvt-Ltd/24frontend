// Multilingual field interface
export interface MultilingualField {
  en: string
  ml: string
}

export interface Resource {
  attachments: any
  _id: string
  content_name: MultilingualField
  category: string
  content: MultilingualField
  guideline_description?: MultilingualField
  guideline_images?: string[]
  video_links?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateResourceData {
  content_name: MultilingualField
  category: string
  content: MultilingualField
  guideline_description?: MultilingualField
  attachments?: string[]
  video_links?: string[]
  guideline_images?: string[]
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