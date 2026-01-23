import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "@/components/custom/top-bar"
import { ToastContainer } from "@/components/ui/toast"
import { useFolder, useAddFilesToFolder } from "@/hooks/useFolders"
import { useToast } from "@/hooks/useToast"
import { uploadService } from "@/services/uploadService"
import { 
  Search, 
  Plus,
  Play,
  Loader2,
  Upload,
  X,
  Video
} from "lucide-react"

interface MediaFolderViewProps {
  onBack: () => void
  folderId: string
  folderName: string
  eventName?: string
}

export function MediaFolderView({ onBack, folderId, folderName, eventName }: MediaFolderViewProps) {
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // TanStack Query hooks
  const { data: folderResponse, isLoading: folderLoading, error: folderError } = useFolder(folderId)
  const addFilesToFolderMutation = useAddFilesToFolder()

  // Handle error toast messages
  useEffect(() => {
    if (folderError) {
      const isAuthError = (folderError as any)?.response?.status === 401
      const isPermissionError = (folderError as any)?.response?.status === 403
      
      if (isAuthError) {
        showError('Your session has expired. Please refresh the page to log in again.')
      } else if (isPermissionError) {
        showError("You don't have permission to view this folder.")
      } else {
        showError('Error loading folder contents. Please try again.')
      }
    }
  }, [folderError, showError])

  const folder = folderResponse?.data
  const mediaItems = folder?.files || []

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    // Validate file types - currently backend only supports images
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/') && 
                     (file.type === 'image/png' || 
                      file.type === 'image/jpg' || 
                      file.type === 'image/jpeg')
      return isImage
    })
    
    if (validFiles.length !== files.length) {
      const skippedCount = files.length - validFiles.length
      showError(`${skippedCount} file(s) were skipped. Currently only PNG, JPG, and JPEG images are supported.`)
    }
    
    setSelectedFiles(validFiles)
  }

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleClearSelection = () => {
    setSelectedFiles([])
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    
    // Validate file types - currently backend only supports images
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/') && 
                     (file.type === 'image/png' || 
                      file.type === 'image/jpg' || 
                      file.type === 'image/jpeg')
      return isImage
    })
    
    if (validFiles.length !== files.length) {
      const skippedCount = files.length - validFiles.length
      showError(`${skippedCount} file(s) were skipped. Currently only PNG, JPG, and JPEG images are supported.`)
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      showError('Please select files to upload')
      return
    }

    setIsUploading(true)
    try {
      console.log('Starting upload for files:', selectedFiles.map(f => f.name))
      
      // Upload files to server first
      const uploadPromises = selectedFiles.map(file => 
        uploadService.uploadFile(file, 'events')
      )
      
      const uploadResults = await Promise.all(uploadPromises)
      console.log('Upload results:', uploadResults)
      
      // Check if all uploads were successful
      const failedUploads = uploadResults.filter(result => !result.success)
      if (failedUploads.length > 0) {
        console.error('Failed uploads:', failedUploads)
        throw new Error(`${failedUploads.length} file(s) failed to upload`)
      }
      
      // Prepare files data for adding to folder
      const uploadedFiles = uploadResults.map((result) => {
        // For now, all uploaded files are images since backend only supports images
        return {
          type: 'image' as const,
          url: result.data.url
        }
      })

      console.log('Adding files to folder:', { folderId, uploadedFiles })

      // Add uploaded files to the folder
      await addFilesToFolderMutation.mutateAsync({
        id: folderId,
        filesData: { files: uploadedFiles }
      })

      showSuccess(`${selectedFiles.length} file(s) uploaded successfully!`)
      setSelectedFiles([])
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showError(`Failed to upload files: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  const filteredMediaItems = mediaItems.filter(item =>
    item.url?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (folderLoading) {
    return (
      <div className="flex flex-col h-screen">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <TopBar />
        <div className="flex-1 pt-[100px] p-8 bg-gray-50 flex items-center justify-center">
          <div className="flex items-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading folder contents...
          </div>
        </div>
      </div>
    )
  }

  if (folderError || !folder) {
    const isAuthError = (folderError as any)?.response?.status === 401
    const isPermissionError = (folderError as any)?.response?.status === 403
    
    return (
      <div className="flex flex-col h-screen">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <TopBar />
        <div className="flex-1 pt-[100px] p-8 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              {isAuthError 
                ? "Your session has expired. Please refresh the page to log in again." 
                : isPermissionError
                ? "You don't have permission to view this folder."
                : "Error loading folder contents"}
            </p>
            <div className="space-x-4">
              <Button onClick={onBack} variant="outline">Go Back</Button>
              {isAuthError && (
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] bg-[#F8F9FA] overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6 px-6">
          <button 
            onClick={onBack}
            className="hover:text-gray-700"
          >
            Content Management
          </button>
          <span className="mx-2">›</span>
          <button 
            onClick={onBack}
            className="hover:text-gray-700"
          >
            Events
          </button>
          <span className="mx-2">›</span>
          <button 
            onClick={onBack}
            className="hover:text-gray-700"
          >
            {eventName || 'Event Details'}
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">{folderName}</span>
        </div>

        <div className="bg-white mx-6 rounded-lg shadow-sm">
          {/* Header with Search and Actions */}
          <div className="flex items-center justify-end p-6">
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search media"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-gray-400 rounded-full h-10"
                />
              </div>
              
              {/* File Upload Input */}
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/png,image/jpg,image/jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="bg-gray-900 hover:bg-gray-200 text-gray-100 hover:text-gray-900 rounded-full px-6 h-10"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Media
              </Button>
              
              {selectedFiles.length > 0 && (
                <>
                  <Button 
                    onClick={handleClearSelection}
                    variant="outline"
                    className="border-gray-300 hover:border-gray-400 text-gray-700 rounded-full px-4 h-10"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear ({selectedFiles.length})
                  </Button>
                  <Button 
                    onClick={handleUploadFiles}
                    className="bg-black hover:bg-gray-800 text-white rounded-full px-6 h-10"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="grid grid-cols-6 gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveSelectedFile(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isUploading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Grid */}
          <div 
            className="p-6 pt-0"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {filteredMediaItems.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {filteredMediaItems.map((item) => (
                  <div 
                    key={item._id} 
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                  >
                    <img 
                      src={item.url} 
                      alt={`Media item ${item._id}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).src = "/sk.png"
                      }}
                    />
                    
                    {/* Video Play Button Overlay */}
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                        <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-800 ml-1" />
                        </div>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Upload className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'No files match your search criteria.' : 'This folder is empty. Upload some images to get started.'}
                </p>
                {!searchTerm && (
                  <div className="space-y-3">
                    <Button 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Images
                    </Button>
                    <p className="text-sm text-gray-400">
                      Supports PNG, JPG, and JPEG files. Drag and drop files anywhere on this area.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}