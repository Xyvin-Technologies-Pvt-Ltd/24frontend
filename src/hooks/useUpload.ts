import { useState, useCallback } from 'react'
import { uploadService, type UploadResponse } from '@/services/uploadService'
import { type CompressionResult } from '@/utils/imageCompression'

export interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  results: UploadResponse[]
}

export interface UseUploadReturn {
  uploadState: UploadState
  uploadFile: (file: File, folder?: string) => Promise<UploadResponse>
  uploadFiles: (files: File[], folder?: string) => Promise<UploadResponse[]>
  compressImages: (files: File[]) => Promise<CompressionResult[]>
  resetUploadState: () => void
}

const initialState: UploadState = {
  isUploading: false,
  progress: 0,
  error: null,
  results: []
}

export const useUpload = (): UseUploadReturn => {
  const [uploadState, setUploadState] = useState<UploadState>(initialState)

  const resetUploadState = useCallback(() => {
    setUploadState(initialState)
  }, [])

  const uploadFile = useCallback(async (file: File, folder = 'promotions'): Promise<UploadResponse> => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null
    }))

    try {
      setUploadState(prev => ({ ...prev, progress: 50 }))
      
      const result = await uploadService.uploadFile(file, folder)
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        results: [result]
      }))

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage,
        results: []
      }))

      throw error
    }
  }, [])

  const uploadFiles = useCallback(async (files: File[], folder = 'promotions'): Promise<UploadResponse[]> => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      results: []
    }))

    try {
      const results: UploadResponse[] = []
      const totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const progress = Math.round(((i + 1) / totalFiles) * 100)
        
        setUploadState(prev => ({ ...prev, progress }))
        
        const result = await uploadService.uploadFile(file, folder)
        results.push(result)
        
        setUploadState(prev => ({
          ...prev,
          results: [...results]
        }))
      }

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100
      }))

      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage
      }))

      throw error
    }
  }, [])

  const compressImages = useCallback(async (files: File[]): Promise<CompressionResult[]> => {
    try {
      return await uploadService.compressImages(files)
    } catch (error) {
      console.error('Image compression failed:', error)
      throw error
    }
  }, [])

  return {
    uploadState,
    uploadFile,
    uploadFiles,
    compressImages,
    resetUploadState
  }
}