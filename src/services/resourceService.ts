import { api } from '@/lib/api'
import type { 
  CreateResourceData, 
  UpdateResourceData, 
  ResourcesResponse, 
  ResourceResponse,
  ResourcesQueryParams
} from '@/types/resource'

export const resourceService = {
  // Get all resources with pagination and filters
  getResources: async (params: ResourcesQueryParams = {}): Promise<ResourcesResponse> => {
    const response = await api.get('/resources', { params })
    return response.data
  },

  // Get resource by ID
  getResourceById: async (id: string): Promise<ResourceResponse> => {
    const response = await api.get(`/resources/${id}`)
    return response.data
  },

  // Create new resource
  createResource: async (resourceData: CreateResourceData): Promise<ResourceResponse> => {
    const response = await api.post('/resources', resourceData)
    return response.data
  },

  // Update resource
  updateResource: async (id: string, resourceData: UpdateResourceData): Promise<ResourceResponse> => {
    const response = await api.put(`/resources/${id}`, resourceData)
    return response.data
  },

  // Delete resource
  deleteResource: async (id: string): Promise<ResourceResponse> => {
    const response = await api.delete(`/resources/${id}`)
    return response.data
  }
}