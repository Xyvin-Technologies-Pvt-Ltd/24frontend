/**
 * Image compression utility for reducing file size before upload
 * Compresses images above 2MB to approximately 1.3MB
 */

export interface CompressionOptions {
  maxSizeMB: number
  targetSizeMB: number
  maxWidthOrHeight?: number
  quality?: number
  fileType?: string
}

export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Default compression options
 */
const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 2,
  targetSizeMB: 1.3,
  maxWidthOrHeight: 1920,
  quality: 0.8,
  fileType: 'image/jpeg'
}

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

/**
 * Convert file size from bytes to MB
 */
export const bytesToMB = (bytes: number): number => {
  return bytes / (1024 * 1024)
}

/**
 * Convert MB to bytes
 */
export const mbToBytes = (mb: number): number => {
  return mb * 1024 * 1024
}

/**
 * Create a canvas element and get 2D context
 */
const createCanvas = (width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context')
  }
  
  return { canvas, ctx }
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidthOrHeight: number
): { width: number; height: number } => {
  if (originalWidth <= maxWidthOrHeight && originalHeight <= maxWidthOrHeight) {
    return { width: originalWidth, height: originalHeight }
  }

  const aspectRatio = originalWidth / originalHeight

  if (originalWidth > originalHeight) {
    return {
      width: maxWidthOrHeight,
      height: Math.round(maxWidthOrHeight / aspectRatio)
    }
  } else {
    return {
      width: Math.round(maxWidthOrHeight * aspectRatio),
      height: maxWidthOrHeight
    }
  }
}

/**
 * Load image from file
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Convert canvas to blob with specified quality
 */
const canvasToBlob = (canvas: HTMLCanvasElement, fileType: string, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      fileType,
      quality
    )
  })
}

/**
 * Compress image using canvas
 */
const compressImageWithCanvas = async (
  file: File,
  options: CompressionOptions
): Promise<File> => {
  const img = await loadImage(file)
  
  // Calculate new dimensions
  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    options.maxWidthOrHeight || DEFAULT_OPTIONS.maxWidthOrHeight!
  )
  
  // Create canvas and draw image
  const { canvas, ctx } = createCanvas(width, height)
  ctx.drawImage(img, 0, 0, width, height)
  
  // Clean up object URL
  URL.revokeObjectURL(img.src)
  
  // Convert to blob with compression
  const blob = await canvasToBlob(
    canvas,
    options.fileType || DEFAULT_OPTIONS.fileType!,
    options.quality || DEFAULT_OPTIONS.quality!
  )
  
  // Create new file
  const compressedFile = new File(
    [blob],
    file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to jpg for consistency
    {
      type: options.fileType || DEFAULT_OPTIONS.fileType!,
      lastModified: Date.now()
    }
  )
  
  return compressedFile
}

/**
 * Iteratively compress image to target size
 */
const compressToTargetSize = async (
  file: File,
  options: CompressionOptions
): Promise<File> => {
  let currentFile = file
  let quality = options.quality || DEFAULT_OPTIONS.quality!
  let attempts = 0
  const maxAttempts = 5
  
  while (attempts < maxAttempts) {
    const compressedFile = await compressImageWithCanvas(currentFile, {
      ...options,
      quality
    })
    
    const compressedSizeMB = bytesToMB(compressedFile.size)
    
    // If we've reached the target size or quality is too low, return
    if (compressedSizeMB <= options.targetSizeMB || quality <= 0.1) {
      return compressedFile
    }
    
    // Reduce quality for next iteration
    quality *= 0.8
    currentFile = compressedFile
    attempts++
  }
  
  return currentFile
}

/**
 * Main compression function
 * Compresses images above maxSizeMB to targetSizeMB
 */
export const compressImage = async (
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult> => {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options }
  
  // Check if file is an image
  if (!isImageFile(file)) {
    throw new Error('File is not an image')
  }
  
  const originalSizeMB = bytesToMB(file.size)
  
  // If file is already smaller than max size, return as is
  if (originalSizeMB <= finalOptions.maxSizeMB) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1
    }
  }
  
  try {
    const compressedFile = await compressToTargetSize(file, finalOptions)
    
    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: compressedFile.size / file.size
    }
  } catch (error) {
    console.error('Image compression failed:', error)
    throw new Error('Failed to compress image')
  }
}

/**
 * Batch compress multiple images
 */
export const compressImages = async (
  files: File[],
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult[]> => {
  const results: CompressionResult[] = []
  
  for (const file of files) {
    try {
      if (isImageFile(file)) {
        const result = await compressImage(file, options)
        results.push(result)
      } else {
        // For non-image files, return as is
        results.push({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 1
        })
      }
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error)
      // Return original file if compression fails
      results.push({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1
      })
    }
  }
  
  return results
}

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}