import { api } from '@/lib/api'

export interface UploadResponse {
  success: boolean
  message: string
  data: {
    url: string
    filename: string
  }
}

export const uploadService = {
  // Upload file to server
  uploadFile: async (file: File, folder: string = 'promotions'): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },

  // Upload multiple files
  uploadFiles: async (files: File[], folder: string = 'promotions'): Promise<UploadResponse> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append(`files`, file)
    })
    formData.append('folder', folder)
    
    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }
}