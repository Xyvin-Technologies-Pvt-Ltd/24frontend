import React, { useCallback, useState } from 'react'
import { useUpload } from '@/hooks/useUpload'
import { isImageFile, formatFileSize, bytesToMB } from '@/utils/imageCompression'
import { Button } from '@/components/ui/button'
import { Upload, Image, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface UploadWithCompressionProps {
  onUploadComplete: (urls: string[]) => void
  folder?: string
  multiple?: boolean
  accept?: string
  maxFiles?: number
  className?: string
}

interface FilePreview {
  file: File
  preview?: string
  status: 'pending' | 'compressing' | 'uploading' | 'success' | 'error'
  error?: string
  uploadResult?: any
}

export const UploadWithCompression: React.FC<UploadWithCompressionProps> = ({
  onUploadComplete,
  folder = 'promotions',
  multiple = false,
  accept = 'image/*,application/pdf,.doc,.docx',
  maxFiles = 5,
  className = ''
}) => {
  const { uploadState, uploadFiles, resetUploadState } = useUpload()
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.slice(0, multiple ? maxFiles : 1)

    const filePreviews: FilePreview[] = validFiles.map(file => ({
      file,
      preview: isImageFile(file) ? URL.createObjectURL(file) : undefined,
      status: 'pending'
    }))

    setSelectedFiles(filePreviews)
  }, [multiple, maxFiles])

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return

    try {
      resetUploadState()
      
      // Update status to show compression/upload progress
      setSelectedFiles(prev => prev.map(fp => ({
        ...fp,
        status: isImageFile(fp.file) && bytesToMB(fp.file.size) > 2 ? 'compressing' : 'uploading'
      })))

      const files = selectedFiles.map(fp => fp.file)
      const results = await uploadFiles(files, folder)

      // Update file previews with results
      setSelectedFiles(prev => prev.map((fp, index) => ({
        ...fp,
        status: results[index]?.success ? 'success' : 'error',
        error: results[index]?.success ? undefined : results[index]?.message,
        uploadResult: results[index]
      })))

      // Extract successful URLs
      const successfulUrls = results
        .filter(result => result.success)
        .map(result => result.data.url)

      if (successfulUrls.length > 0) {
        onUploadComplete(successfulUrls)
      }

    } catch (error) {
      console.error('Upload failed:', error)
      setSelectedFiles(prev => prev.map(fp => ({
        ...fp,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      })))
    }
  }, [selectedFiles, uploadFiles, folder, onUploadComplete, resetUploadState])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }, [])

  const clearAll = useCallback(() => {
    selectedFiles.forEach(fp => {
      if (fp.preview) {
        URL.revokeObjectURL(fp.preview)
      }
    })
    setSelectedFiles([])
    resetUploadState()
  }, [selectedFiles, resetUploadState])

  const getStatusIcon = (status: FilePreview['status']) => {
    switch (status) {
      case 'compressing':
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (filePreview: FilePreview) => {
    switch (filePreview.status) {
      case 'compressing':
        return 'Compressing...'
      case 'uploading':
        return 'Uploading...'
      case 'success':
        const result = filePreview.uploadResult
        if (result?.compressionInfo?.wasCompressed) {
          return `Uploaded (${result.compressionInfo.originalSize} → ${result.compressionInfo.compressedSize})`
        }
        return 'Uploaded successfully'
      case 'error':
        return filePreview.error || 'Upload failed'
      default:
        const sizeMB = bytesToMB(filePreview.file.size)
        if (isImageFile(filePreview.file) && sizeMB > 2) {
          return `${formatFileSize(filePreview.file.size)} - Will be compressed`
        }
        return formatFileSize(filePreview.file.size)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Drag and drop files here, or{' '}
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
              browse
              <input
                type="file"
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">
            Images above 2MB will be automatically compressed to ~1.3MB
          </p>
          {multiple && (
            <p className="text-xs text-gray-500">
              Maximum {maxFiles} files
            </p>
          )}
        </div>
      </div>

      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Selected Files</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={uploadState.isUploading}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((filePreview, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border rounded-lg"
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {filePreview.preview ? (
                    <img
                      src={filePreview.preview}
                      alt={filePreview.file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : isImageFile(filePreview.file) ? (
                    <Image className="h-10 w-10 text-gray-400" />
                  ) : (
                    <FileText className="h-10 w-10 text-gray-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {filePreview.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getStatusText(filePreview)}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  {getStatusIcon(filePreview.status)}
                  {filePreview.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploadState.isUploading}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {uploadState.isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadState.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={uploadState.isUploading || selectedFiles.length === 0}
            className="w-full"
          >
            {uploadState.isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      )}

      {/* Error Display */}
      {uploadState.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadState.error}</p>
        </div>
      )}
    </div>
  )
}