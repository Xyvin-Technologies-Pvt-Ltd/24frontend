import { api } from '@/lib/api'

// Backend response format
export interface BackendUploadResponse {
  status: number
  message: string
  data: string // S3 URL as string
  total_count: null
}

// Frontend interface for consistency
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
    formData.append('file', file) // Backend expects field name 'file'
    formData.append('folder', folder)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const backendResponse: BackendUploadResponse = response.data

    // Transform backend response to match frontend interface
    return {
      success: backendResponse.status >= 200 && backendResponse.status < 300,
      message: backendResponse.message,
      data: {
        url: backendResponse.data, // S3 URL
        filename: file.name
      }
    }
  },

  // Upload multiple files (not implemented in backend, keeping for future use)
  uploadFiles: async (files: File[], folder: string = 'promotions'): Promise<UploadResponse> => {
    // For now, upload files one by one since backend doesn't support multiple uploads
    const uploadPromises = files.map((file: File) => uploadService.uploadFile(file, folder))
    const results = await Promise.all(uploadPromises)

    // Return the first successful upload or the last result
    const successfulUpload = results.find((result: UploadResponse) => result.success) || results[results.length - 1]

    return successfulUpload
  }
}