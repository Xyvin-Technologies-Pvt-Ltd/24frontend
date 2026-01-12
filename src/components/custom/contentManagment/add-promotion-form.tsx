import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/custom/top-bar"
import { Calendar, Upload, Loader2 } from "lucide-react"
import { useCreatePromotion } from "@/hooks/usePromotions"
import { uploadService } from "@/services/uploadService"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { forwardRef } from "react";
interface AddPromotionFormProps {
  onBack: () => void
  onSave: (promotionData: any) => void
}

const DateInput = forwardRef(({ value, onClick }: any, ref: any) => (
  <div className="relative w-full">
    <input
      type="text"
      readOnly
      value={value}
      onClick={onClick}
      ref={ref}
      className="w-full border border-gray-300 rounded-2xl h-12 px-4 pr-10 text-gray-900 placeholder-gray-400 bg-gray-50 cursor-pointer"
    />
    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
  </div>
));
DateInput.displayName = "DateInput";
export function AddPromotionForm({ onBack, onSave }: AddPromotionFormProps) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    bannerImage: null as File | null
  })
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")

  const createPromotionMutation = useCreatePromotion()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleFileUpload = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      bannerImage: file
    }))
    // Clear error when user uploads file
    if (error) setError("")
  }

  const handleSave = async () => {
    try {
      setError("")
      
      // Validate required fields
      if (!formData.startDate || !formData.endDate || !formData.bannerImage) {
        setError("Please fill in all required fields and upload a banner image")
        return
      }

      // Validate date logic
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to compare dates only

      if (startDate < today) {
        setError("Start date cannot be in the past")
        return
      }

      if (endDate <= startDate) {
        setError("End date must be after start date")
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(formData.bannerImage.type)) {
        setError("Please upload a valid image file (JPG or PNG)")
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (formData.bannerImage.size > maxSize) {
        setError("Image file size must be less than 5MB")
        return
      }

      setIsUploading(true)

      // Upload the banner image first
      const uploadResponse = await uploadService.uploadFile(formData.bannerImage, 'promotions')
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || 'Failed to upload image')
      }

      // Create promotion data
      const promotionData = {
        type: 'poster' as const,
        start_date: formData.startDate, // Already in YYYY-MM-DD format from date input
        end_date: formData.endDate,     // Already in YYYY-MM-DD format from date input
        media: uploadResponse.data.url,
        status: 'published' as const
      }

      // Create the promotion
      await createPromotionMutation.mutateAsync(promotionData)
      
      console.log("Promotion created successfully!")
      onSave(promotionData)
      
    } catch (error: any) {
      console.error('Error creating promotion:', error)
      setError(error.message || "Failed to create promotion. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    onBack()
  }

  const isLoading = createPromotionMutation.isPending || isUploading

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-8">
          <button 
            onClick={onBack}
            className="hover:text-gray-900"
          >
            Content Management
          </button>
          <span className="mx-2">›</span>
          <span>Promotions</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Add Promotions</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 w-full">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8 mb-8 ">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Start Date
                </label>
                <DatePicker
                  selected={formData.startDate ? new Date(formData.startDate) : null}
                  onChange={(date: Date | null) =>
                    handleInputChange(
                      "startDate",
                      date ? date.toISOString().split("T")[0] : ""
                    )
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select"
                  customInput={<DateInput />}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  End Date
                </label>
                <DatePicker
                  selected={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={(date: Date | null) =>
                    handleInputChange(
                      "endDate",
                      date ? date.toISOString().split("T")[0] : ""
                    )
                  }
                  minDate={formData.startDate ? new Date(formData.startDate) : undefined}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select"
                  customInput={<DateInput />}
                />
              </div>
            </div>

            {/* Upload Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Banner Image
              </label>
              <p className="text-sm text-gray-500 mb-4">Image (JPG/PNG) - Recommended size: 1200x600px</p>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center bg-gray-50">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Upload file</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="cursor-pointer text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Choose file
                  </label>
                  {formData.bannerImage && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {formData.bannerImage.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full min-w-[120px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full min-w-[120px] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isUploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}