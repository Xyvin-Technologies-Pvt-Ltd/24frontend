import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourceService } from '@/services/resourceService'
import type { 
  CreateResourceData, 
  UpdateResourceData, 
  ResourcesQueryParams
} from '@/types/resource'

// Query keys
export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: ResourcesQueryParams) => [...resourceKeys.lists(), params] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...resourceKeys.details(), id] as const,
}

// Get resources with pagination and filters
export const useResources = (params: ResourcesQueryParams = {}) => {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: () => resourceService.getResources(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single resource by ID
export const useResource = (id: string) => {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => resourceService.getResourceById(id),
    enabled: !!id,
  })
}

// Create resource mutation
export const useCreateResource = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (resourceData: CreateResourceData) => resourceService.createResource(resourceData),
    onSuccess: () => {
      // Invalidate and refetch resources list
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
    onError: (error: any) => {
      console.error('Failed to create resource:', error)
      // The error will be available in the component via mutation.error
    },
  })
}

// Update resource mutation
export const useUpdateResource = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, resourceData }: { id: string; resourceData: UpdateResourceData }) => 
      resourceService.updateResource(id, resourceData),
    onSuccess: (_, variables) => {
      // Invalidate resources list and specific resource detail
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(variables.id) })
    },
  })
}

// Delete resource mutation
export const useDeleteResource = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => resourceService.deleteResource(id),
    onSuccess: () => {
      // Invalidate resources list
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}