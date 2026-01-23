export interface FolderFile {
  _id: string
  type: 'image' | 'video'
  url: string
  user: string
}

export interface Folder {
  _id: string
  name: string
  event: string
  files: FolderFile[]
  image_count?: number
  video_count?: number
  createdAt: string
  updatedAt: string
}

export interface CreateFolderData {
  name: string
  event: string
  files?: FolderFile[]
}

export interface UpdateFolderData {
  name?: string
  event?: string
  files?: FolderFile[]
}

export interface FoldersResponse {
  success: boolean
  message: string
  data: Folder[]
  total_count: number
}

export interface FolderResponse {
  success: boolean
  message: string
  data: Folder
}

export interface FoldersQueryParams {
  page_no?: number
  limit?: number
  search?: string
  type?: 'image' | 'video'
}

export interface AddFilesToFolderData {
  files: {
    type: 'image' | 'video'
    url: string
  }[]
}

export interface RemoveFilesFromFolderData {
  file_ids: string[]
}

export interface AddToPublicFolderData {
  files: {
    type: 'image' | 'video'
    url: string
  }[]
  event_id: string
}

export interface RemoveFromPublicFolderData {
  file_ids: string[]
  event_id: string
}