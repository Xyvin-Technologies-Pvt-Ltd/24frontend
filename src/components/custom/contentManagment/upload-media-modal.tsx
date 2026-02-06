import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { X, Upload, Image, Video, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useUpload } from "@/hooks/useUpload"
import { isImageFile, formatFileSize, bytesToMB } from "@/utils/imageCompression"

interface UploadMediaModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (urls: string[]) => void
  folder?: string
}

interface FilePreview {
  file: File
  url: string
  type: 'image' | 'video'
  status: 'pending' | 'compressing' | 'uploading' | 'success' | 'error'
  error?: string
  uploadResult?: any
}

export function UploadMediaModal({ 
  isOpen, 
  onClose, 
  onUpload,
  folder = 'media'
}: UploadMediaModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadState, uploadFiles, resetUploadState } = useUpload()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const newFiles: FilePreview[] = files.map(file => {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith('image/') ? 'image' : 'video'
      return { file, url, type, status: 'pending' }
    })
    
    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].url)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleUpload = async () => {
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
        onUpload(successfulUrls)
        // Auto-close modal after successful upload
        setTimeout(() => {
          handleClose()
        }, 1500)
      }

    } catch (error) {
      console.error('Upload failed:', error)
      setSelectedFiles(prev => prev.map(fp => ({
        ...fp,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      })))
    }
  }

  const handleClose = () => {
    // Clean up object URLs
    selectedFiles.forEach(fp => URL.revokeObjectURL(fp.url))
    setSelectedFiles([])
    resetUploadState()
    onClose()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    
    const newFiles: FilePreview[] = files.map(file => {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith('image/') ? 'image' : 'video'
      return { file, url, type, status: 'pending' }
    })
    
    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const getStatusIcon = (status: FilePreview['status']) => {
    switch (status) {
      case 'compressing':
      case 'uploading':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  const getFileStatusText = (filePreview: FilePreview) => {
    switch (filePreview.status) {
      case 'compressing':
        return 'Compressing...'
      case 'uploading':
        return 'Uploading...'
      case 'success':
        const result = filePreview.uploadResult
        if (result?.compressionInfo?.wasCompressed) {
          return `Compressed & uploaded`
        }
        return 'Uploaded'
      case 'error':
        return 'Failed'
      default:
        const sizeMB = bytesToMB(filePreview.file.size)
        if (isImageFile(filePreview.file) && sizeMB > 2) {
          return `${formatFileSize(filePreview.file.size)} - Will compress`
        }
        return formatFileSize(filePreview.file.size)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload Media</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-gray-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop files here, or</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadState.isUploading}
          >
            Browse Files
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Supports images and videos (JPG, PNG, MP4, etc.)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Images above 2MB will be automatically compressed
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* File Previews */}
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {selectedFiles.map((filePreview, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {filePreview.type === 'image' ? (
                      <img
                        src={filePreview.url}
                        alt={filePreview.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Overlay */}
                    {filePreview.status !== 'pending' && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        {getStatusIcon(filePreview.status)}
                      </div>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  {filePreview.status === 'pending' && (
                    <div className="absolute top-1 right-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* File Type Icon */}
                  <div className="absolute bottom-1 left-1">
                    {filePreview.type === 'image' ? (
                      <Image className="w-4 h-4 text-white drop-shadow" />
                    ) : (
                      <Video className="w-4 h-4 text-white drop-shadow" />
                    )}
                  </div>
                  
                  {/* Status Icon */}
                  {filePreview.status !== 'pending' && (
                    <div className="absolute bottom-1 right-1">
                      {getStatusIcon(filePreview.status)}
                    </div>
                  )}
                  
                  <div className="mt-1">
                    <p className="text-xs text-gray-600 truncate">
                      {filePreview.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getFileStatusText(filePreview)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadState.isUploading && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading files...</span>
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

        {/* Error Display */}
        {uploadState.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{uploadState.error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploadState.isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploadState.isUploading}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {uploadState.isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}