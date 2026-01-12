import { api } from '@/lib/api'
import type { 
  CreateResourceData, 
  UpdateResourceData, 
  ResourcesResponse, 
  ResourceResponse,
  ResourcesQueryParams,
  BackendResourcesResponse,
  BackendResourceResponse
} from '@/types/resource'

export const resourceService = {
  // Get all resources with pagination and filters
  getResources: async (params: ResourcesQueryParams = {}): Promise<ResourcesResponse> => {
    const response = await api.get('/resources', { params })
    const backendResponse: BackendResourcesResponse = response.data
    
    // Transform backend response to frontend format
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data,
      total_count: backendResponse.total_count
    }
  },

  // Get resource by ID
  getResourceById: async (id: string): Promise<ResourceResponse> => {
    const response = await api.get(`/resources/${id}`)
    const backendResponse: BackendResourceResponse = response.data
    
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data
    }
  },

  // Create new resource
  createResource: async (resourceData: CreateResourceData): Promise<ResourceResponse> => {
    const response = await api.post('/resources', resourceData)
    const backendResponse: BackendResourceResponse = response.data
    
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data
    }
  },

  // Update resource
  updateResource: async (id: string, resourceData: UpdateResourceData): Promise<ResourceResponse> => {
    const response = await api.put(`/resources/${id}`, resourceData)
    const backendResponse: BackendResourceResponse = response.data
    
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data
    }
  },

  // Delete resource
  deleteResource: async (id: string): Promise<ResourceResponse> => {
    const response = await api.delete(`/resources/${id}`)
    const backendResponse: BackendResourceResponse = response.data
    
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: backendResponse.data
    }
  }
}