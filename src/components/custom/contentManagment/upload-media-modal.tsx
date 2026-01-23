import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { X, Upload, Image, Video, Trash2 } from "lucide-react"

interface UploadMediaModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: File[]) => void
  isLoading?: boolean
}

interface FilePreview {
  file: File
  url: string
  type: 'image' | 'video'
}

export function UploadMediaModal({ 
  isOpen, 
  onClose, 
  onUpload,
  isLoading = false 
}: UploadMediaModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const newFiles: FilePreview[] = files.map(file => {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith('image/') ? 'image' : 'video'
      return { file, url, type }
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

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      const files = selectedFiles.map(fp => fp.file)
      onUpload(files)
    }
  }

  const handleClose = () => {
    // Clean up object URLs
    selectedFiles.forEach(fp => URL.revokeObjectURL(fp.url))
    setSelectedFiles([])
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
      return { file, url, type }
    })
    
    setSelectedFiles(prev => [...prev, ...newFiles])
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
            disabled={isLoading}
          >
            Browse Files
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Supports images and videos (JPG, PNG, MP4, etc.)
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
                  </div>
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
                  <div className="absolute bottom-1 left-1">
                    {filePreview.type === 'image' ? (
                      <Image className="w-4 h-4 text-white drop-shadow" />
                    ) : (
                      <Video className="w-4 h-4 text-white drop-shadow" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {filePreview.file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isLoading}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {isLoading ? "Uploading..." : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}