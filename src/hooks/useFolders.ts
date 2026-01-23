import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { folderService } from '@/services/folderService'
import type { 
  CreateFolderData, 
  UpdateFolderData, 
  FoldersQueryParams,
  AddFilesToFolderData,
  RemoveFilesFromFolderData,
  AddToPublicFolderData,
  RemoveFromPublicFolderData
} from '@/types/folder'

// Query keys
export const folderKeys = {
  all: ['folders'] as const,
  lists: () => [...folderKeys.all, 'list'] as const,
  list: (eventId: string, params: FoldersQueryParams) => [...folderKeys.lists(), eventId, params] as const,
  details: () => [...folderKeys.all, 'detail'] as const,
  detail: (id: string, type?: 'image' | 'video') => [...folderKeys.details(), id, type] as const,
}

// Get folders by event ID with pagination and filters
export const useFoldersByEventId = (eventId: string, params: FoldersQueryParams = {}) => {
  return useQuery({
    queryKey: folderKeys.list(eventId, params),
    queryFn: () => folderService.getFoldersByEventId(eventId, params),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single folder by ID
export const useFolder = (id: string, type?: 'image' | 'video') => {
  return useQuery({
    queryKey: folderKeys.detail(id, type),
    queryFn: () => folderService.getFolderById(id, type),
    enabled: !!id,
    retry: false, // Don't retry on failure to prevent multiple 401s
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create folder mutation
export const useCreateFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (folderData: CreateFolderData) => folderService.createFolder(folderData),
    onSuccess: (_, variables) => {
      // Invalidate folders list for the specific event
      queryClient.invalidateQueries({ 
        queryKey: folderKeys.lists(),
        predicate: (query) => {
          const [, , eventId] = query.queryKey
          return eventId === variables.event
        }
      })
    },
  })
}

// Update folder mutation
export const useUpdateFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, folderData }: { id: string; folderData: UpdateFolderData }) => 
      folderService.updateFolder(id, folderData),
    onSuccess: (_, variables) => {
      // Invalidate folders list and specific folder detail
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: folderKeys.detail(variables.id) })
    },
  })
}

// Delete folder mutation
export const useDeleteFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => folderService.deleteFolder(id),
    onSuccess: () => {
      // Invalidate folders list
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() })
    },
  })
}

// Add files to folder mutation
export const useAddFilesToFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, filesData }: { id: string; filesData: AddFilesToFolderData }) => 
      folderService.addFilesToFolder(id, filesData),
    onSuccess: (_, variables) => {
      // Invalidate folder detail and folders list
      queryClient.invalidateQueries({ queryKey: folderKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() })
    },
  })
}

// Remove files from folder mutation
export const useRemoveFilesFromFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, filesData }: { id: string; filesData: RemoveFilesFromFolderData }) => 
      folderService.removeFilesFromFolder(id, filesData),
    onSuccess: (_, variables) => {
      // Invalidate folder detail and folders list
      queryClient.invalidateQueries({ queryKey: folderKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() })
    },
  })
}

// Add to public folder mutation
export const useAddToPublicFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (filesData: AddToPublicFolderData) => folderService.addToPublicFolder(filesData),
    onSuccess: (_, variables) => {
      // Invalidate folders list for the specific event
      queryClient.invalidateQueries({ 
        queryKey: folderKeys.lists(),
        predicate: (query) => {
          const [, , eventId] = query.queryKey
          return eventId === variables.event_id
        }
      })
    },
  })
}

// Remove from public folder mutation
export const useRemoveFromPublicFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (filesData: RemoveFromPublicFolderData) => folderService.removeFromPublicFolder(filesData),
    onSuccess: (_, variables) => {
      // Invalidate folders list for the specific event
      queryClient.invalidateQueries({ 
        queryKey: folderKeys.lists(),
        predicate: (query) => {
          const [, , eventId] = query.queryKey
          return eventId === variables.event_id
        }
      })
    },
  })
}