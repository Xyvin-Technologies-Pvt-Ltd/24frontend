import { api } from '@/lib/api'
import { compressImage, compressImages, isImageFile, bytesToMB, formatFileSize, type CompressionResult } from '@/utils/imageCompression'

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
  compressionInfo?: {
    wasCompressed: boolean
    originalSize: string
    compressedSize: string
    compressionRatio: number
  }
}

export const uploadService = {
  // Upload file to server with automatic image compression
  uploadFile: async (file: File, folder: string = 'promotions'): Promise<UploadResponse> => {
    let fileToUpload = file
    let compressionInfo: UploadResponse['compressionInfo']

    // Compress image if it's above 2MB
    if (isImageFile(file) && bytesToMB(file.size) > 2) {
      try {
        console.log(`Compressing image: ${file.name} (${formatFileSize(file.size)})`)
        
        const compressionResult: CompressionResult = await compressImage(file, {
          maxSizeMB: 2,
          targetSizeMB: 1.3,
          maxWidthOrHeight: 1920,
          quality: 0.8
        })

        fileToUpload = compressionResult.file
        compressionInfo = {
          wasCompressed: true,
          originalSize: formatFileSize(compressionResult.originalSize),
          compressedSize: formatFileSize(compressionResult.compressedSize),
          compressionRatio: compressionResult.compressionRatio
        }

        console.log(`Image compressed: ${compressionInfo.originalSize} → ${compressionInfo.compressedSize} (${Math.round((1 - compressionResult.compressionRatio) * 100)}% reduction)`)
      } catch (error) {
        console.warn('Image compression failed, uploading original file:', error)
        compressionInfo = {
          wasCompressed: false,
          originalSize: formatFileSize(file.size),
          compressedSize: formatFileSize(file.size),
          compressionRatio: 1
        }
      }
    } else {
      compressionInfo = {
        wasCompressed: false,
        originalSize: formatFileSize(file.size),
        compressedSize: formatFileSize(file.size),
        compressionRatio: 1
      }
    }

    const formData = new FormData()
    formData.append('file', fileToUpload) // Backend expects field name 'file'
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
        filename: fileToUpload.name
      },
      compressionInfo
    }
  },

  // Upload multiple files with compression
  uploadFiles: async (files: File[], folder: string = 'promotions'): Promise<UploadResponse[]> => {
    const results: UploadResponse[] = []

    for (const file of files) {
      try {
        const result = await uploadService.uploadFile(file, folder)
        results.push(result)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        results.push({
          success: false,
          message: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: {
            url: '',
            filename: file.name
          },
          compressionInfo: {
            wasCompressed: false,
            originalSize: formatFileSize(file.size),
            compressedSize: formatFileSize(file.size),
            compressionRatio: 1
          }
        })
      }
    }

    return results
  },

  // Batch compress images before upload (for preview/validation)
  compressImages: async (files: File[]): Promise<CompressionResult[]> => {
    return await compressImages(files, {
      maxSizeMB: 2,
      targetSizeMB: 1.3,
      maxWidthOrHeight: 1920,
      quality: 0.8
    })
  }
}