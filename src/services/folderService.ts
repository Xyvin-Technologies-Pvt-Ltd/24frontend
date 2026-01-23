import { api } from '@/lib/api'
import type { 
  CreateFolderData, 
  UpdateFolderData, 
  FoldersResponse, 
  FolderResponse,
  FoldersQueryParams,
  AddFilesToFolderData,
  RemoveFilesFromFolderData,
  AddToPublicFolderData,
  RemoveFromPublicFolderData
} from '@/types/folder'

export const folderService = {
  // Create new folder
  createFolder: async (folderData: CreateFolderData): Promise<FolderResponse> => {
    const response = await api.post('/folder', folderData)
    return response.data
  },

  // Get folders by event ID with pagination and filters
  getFoldersByEventId: async (eventId: string, params: FoldersQueryParams = {}): Promise<FoldersResponse> => {
    const response = await api.get(`/folder/event/${eventId}`, { params })
    return response.data
  },

  // Get folder by ID
  getFolderById: async (id: string, type?: 'image' | 'video'): Promise<FolderResponse> => {
    const params = type ? { type } : {}
    const response = await api.get(`/folder/${id}`, { params })
    return response.data
  },

  // Update folder
  updateFolder: async (id: string, folderData: UpdateFolderData): Promise<FolderResponse> => {
    const response = await api.put(`/folder/${id}`, folderData)
    return response.data
  },

  // Delete folder
  deleteFolder: async (id: string): Promise<FolderResponse> => {
    const response = await api.delete(`/folder/${id}`)
    return response.data
  },

  // Add files to folder
  addFilesToFolder: async (id: string, filesData: AddFilesToFolderData): Promise<FolderResponse> => {
    const response = await api.post(`/folder/add-file/${id}`, filesData)
    return response.data
  },

  // Remove files from folder
  removeFilesFromFolder: async (id: string, filesData: RemoveFilesFromFolderData): Promise<FolderResponse> => {
    const response = await api.post(`/folder/remove-file/${id}`, filesData)
    return response.data
  },

  // Add files to public folder
  addToPublicFolder: async (filesData: AddToPublicFolderData): Promise<FolderResponse> => {
    const response = await api.post('/folder/add-to-public-folder', filesData)
    return response.data
  },

  // Remove files from public folder
  removeFromPublicFolder: async (filesData: RemoveFromPublicFolderData): Promise<FolderResponse> => {
    const response = await api.post('/folder/remove-from-public-folder', filesData)
    return response.data
  }
}