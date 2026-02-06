/**
 * Example usage of the image compression upload functionality
 * This shows how to integrate the upload service with compression into your forms
 */

import React, { useState } from 'react'
import { useUpload } from '@/hooks/useUpload'
import { UploadWithCompression } from '@/components/custom/upload-with-compression'
import { Button } from '@/components/ui/button'

// Example 1: Simple upload with compression
export const SimpleUploadExample: React.FC = () => {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  const handleUploadComplete = (urls: string[]) => {
    setUploadedUrls(urls)
    console.log('Uploaded files:', urls)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Simple Upload Example</h2>
      
      <UploadWithCompression
        onUploadComplete={handleUploadComplete}
        folder="examples"
        multiple={true}
        maxFiles={3}
      />

      {uploadedUrls.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Uploaded Files:</h3>
          <ul className="text-sm text-gray-600">
            {uploadedUrls.map((url, index) => (
              <li key={index} className="truncate">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Example 2: Form integration with manual upload control
export const FormUploadExample: React.FC = () => {
  const { uploadState, uploadFile } = useUpload()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      const result = await uploadFile(selectedFile, 'form-uploads')
      if (result.success) {
        setUploadedUrl(result.data.url)
        
        // Show compression info if available
        if (result.compressionInfo?.wasCompressed) {
          console.log('Image was compressed:', result.compressionInfo)
        }
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Form Upload Example</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Image or Document
          </label>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {selectedFile && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              {selectedFile.type.startsWith('image/') && selectedFile.size > 2 * 1024 * 1024 && (
                <span className="text-orange-600"> - Will be compressed</span>
              )}
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadState.isUploading}
          className="w-full"
        >
          {uploadState.isUploading ? 'Uploading...' : 'Upload File'}
        </Button>

        {uploadState.isUploading && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
            <p className="text-sm text-center text-gray-600">
              {uploadState.progress}% complete
            </p>
          </div>
        )}

        {uploadedUrl && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">Upload successful!</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline break-all"
            >
              {uploadedUrl}
            </a>
          </div>
        )}

        {uploadState.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{uploadState.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Example 3: Batch upload with compression preview
export const BatchUploadExample: React.FC = () => {
  const { compressImages } = useUpload()
  const [files, setFiles] = useState<File[]>([])
  const [compressionResults, setCompressionResults] = useState<any[]>([])
  const [isCompressing, setIsCompressing] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
    setCompressionResults([])
  }

  const handlePreviewCompression = async () => {
    if (files.length === 0) return

    setIsCompressing(true)
    try {
      const results = await compressImages(files)
      setCompressionResults(results)
    } catch (error) {
      console.error('Compression preview failed:', error)
    } finally {
      setIsCompressing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Batch Upload with Compression Preview</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Multiple Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {files.length > 0 && (
          <Button
            onClick={handlePreviewCompression}
            disabled={isCompressing}
            variant="outline"
          >
            {isCompressing ? 'Compressing...' : 'Preview Compression'}
          </Button>
        )}

        {compressionResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Compression Results:</h3>
            {compressionResults.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <p className="text-sm font-medium">{result.file.name}</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Original: {(result.originalSize / (1024 * 1024)).toFixed(2)} MB</p>
                  <p>Compressed: {(result.compressedSize / (1024 * 1024)).toFixed(2)} MB</p>
                  <p>Reduction: {Math.round((1 - result.compressionRatio) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}