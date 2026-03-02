import { useState, useRef, useCallback, useEffect } from "react"
import ReactCrop, { Crop, PixelCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"

interface ImageCropperProps {
  isOpen: boolean
  onClose: () => void
  onCropComplete: (croppedFile: File) => void
  imageFile: File
  aspectRatio?: number
  title?: string
}

export function ImageCropper({
  isOpen,
  onClose,
  onCropComplete,
  imageFile,
  aspectRatio,
  title = "Crop Image"
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [imageSrc, setImageSrc] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Load image when file changes
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = () => {
        setImageSrc(reader.result as string)
      }
      reader.readAsDataURL(imageFile)
    }
  }, [imageFile])

  // Handle image load to set proper initial crop
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    
    if (aspectRatio) {
      const imageAspectRatio = width / height
      
      // Check if image already matches the target aspect ratio (with small tolerance)
      const aspectRatioMatch = Math.abs(imageAspectRatio - aspectRatio) < 0.01
      
      if (aspectRatioMatch) {
        // Image already matches aspect ratio, use full image
        const newCrop: Crop = {
          unit: "%",
          width: 100,
          height: 100,
          x: 0,
          y: 0
        }
        setCrop(newCrop)
      } else {
        // Calculate crop to fit aspect ratio
        let cropWidth = 100
        let cropHeight = 100
        let x = 0
        let y = 0
        
        if (imageAspectRatio > aspectRatio) {
          // Image is wider than target aspect ratio
          cropWidth = (height * aspectRatio / width) * 100
          x = (100 - cropWidth) / 2
        } else {
          // Image is taller than target aspect ratio
          cropHeight = (width / aspectRatio / height) * 100
          y = (100 - cropHeight) / 2
        }
        
        const newCrop: Crop = {
          unit: "%",
          width: cropWidth,
          height: cropHeight,
          x,
          y
        }
        setCrop(newCrop)
      }
    } else {
      // No aspect ratio specified, use default crop
      setCrop({
        unit: "%",
        width: 90,
        height: 90,
        x: 5,
        y: 5
      })
    }
  }, [aspectRatio])

  const getCroppedImg = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement("canvas")
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      canvas.width = crop.width
      canvas.height = crop.height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("No 2d context")
      }

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      )

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas is empty"))
              return
            }
            resolve(blob)
          },
          imageFile.type,
          1
        )
      })
    },
    [imageFile]
  )

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return

    try {
      setIsProcessing(true)
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop)
      const croppedFile = new File([croppedBlob], imageFile.name, {
        type: imageFile.type
      })
      onCropComplete(croppedFile)
      onClose()
    } catch (error) {
      console.error("Error cropping image:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                className="max-w-full"
                onLoad={onImageLoad}
              />
            </ReactCrop>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropComplete}
            disabled={isProcessing || !completedCrop}
            className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Apply Crop"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
