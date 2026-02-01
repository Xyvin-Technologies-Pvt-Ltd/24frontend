import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/custom/top-bar"
import { Calendar, Upload, Loader2, X, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCreatePromotion, useUpdatePromotion } from "@/hooks/usePromotions"
import { uploadService } from "@/services/uploadService"
import type { Promotion } from "@/types/promotion";
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { forwardRef } from "react";
interface AddPromotionFormProps {
  onBack: () => void
  onSave: (promotionData: any) => void
  initialData?: Promotion | null
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
const formatDateLocal = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDateLocal = (dateStr: string) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function AddPromotionForm({ onBack, onSave, initialData }: AddPromotionFormProps) {
  const isEditMode = Boolean(initialData)

  const [formData, setFormData] = useState({
    startDate: initialData?.start_date
      ? formatDateLocal(new Date(initialData.start_date))
      : "",
    endDate: initialData?.end_date
      ? formatDateLocal(new Date(initialData.end_date))
      : "",
    bannerImage: null as File | null,
    link: initialData?.link || ""
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState(initialData?.media || "");

  const createPromotionMutation = useCreatePromotion()
  const updatePromotionMutation = useUpdatePromotion()

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

    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl("")
    }

    // Clear error when user uploads file
    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.startDate || !formData.endDate) {
      setError("Please fill in all required fields")
      return false
    }
    // Require image only when creating
    if (!isEditMode && !formData.bannerImage) {
      setError("Please upload a banner image")
      return false
    }

    // Validate date logic
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to compare dates only

    if (startDate < today) {
      setError("Start date cannot be in the past")
      return false
    }

    if (endDate <= startDate) {
      setError("End date must be after start date")
      return false
    }

    // Validate image only if user selected one
    if (formData.bannerImage) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(formData.bannerImage.type)) {
        setError("Please upload a valid image file (JPG, PNG, or WebP)")
        return false
      }

      const maxSize = 10 * 1024 * 1024
      if (formData.bannerImage.size > maxSize) {
        setError("Image file size must be less than 10MB")
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    try {
      setError("")

      if (!validateForm()) {
        return
      }

      setIsUploading(true)
      setUploadProgress("Uploading image...")

      let mediaUrl = initialData?.media || "";

      if (formData.bannerImage) {
        setUploadProgress("Uploading image...");
        const uploadResponse = await uploadService.uploadFile(
          formData.bannerImage,
          "promotions"
        )
        mediaUrl = uploadResponse.data.url
      }

      setUploadProgress(isEditMode ? "Updating promotion..." : "Creating promotion...")
      const promotionData = {
        type: "poster" as const,
        start_date: formData.startDate,
        end_date: formData.endDate,
        media: mediaUrl,
        status: "published" as const,
        ...(formData.link && { link: formData.link })
      }

      if (isEditMode && initialData?._id) {
        await updatePromotionMutation.mutateAsync({
          id: initialData._id,
          promotionData
        })
      } else {
        await createPromotionMutation.mutateAsync(promotionData)
      }

      setUploadProgress(isEditMode ? "Updating promotion..." : "Creating promotion...")

      if (previewUrl && formData.bannerImage) {
        URL.revokeObjectURL(previewUrl)
      }

      setTimeout(() => {
        onSave(promotionData)
      }, 1000)

    } catch (error: any) {
      console.error('Error creating promotion:', error)

      // Handle specific error types
      let errorMessage = "Failed to create promotion. Please try again."

      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid data provided"
      } else if (error.response?.status === 413) {
        errorMessage = "File size too large. Please use a smaller image."
      } else if (error.response?.status === 415) {
        errorMessage = "Unsupported file type. Please use JPG, PNG, or WebP."
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress("")
    }
  }

  const handleCancel = () => {
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    onBack()
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, bannerImage: null }))
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl("")
    }
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
          <span className="text-gray-900">
            {isEditMode ? "Edit Promotion" : "Add Promotion"}
          </span>

        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 w-full max-w-4xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                {uploadProgress.includes("successfully") ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <Loader2 className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
                )}
                <p className="text-blue-700 text-sm">{uploadProgress}</p>
              </div>
            </div>
          )}

          <div className="space-y-8">

            {/* Start Date and End Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={parseDateLocal(formData.startDate)}
                  onChange={(date: Date | null) =>
                    handleInputChange(
                      "startDate",
                      date ? formatDateLocal(date) : ""
                    )
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select"
                  customInput={<DateInput />}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  End Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={parseDateLocal(formData.endDate)}
                  onChange={(date: Date | null) =>
                    handleInputChange(
                      "endDate",
                      date ? formatDateLocal(date) : ""
                    )
                  }
                  minDate={parseDateLocal(formData.startDate) || undefined}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select"
                  customInput={<DateInput />}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}

                />
              </div>
            </div>

            {/* Optional Link Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Link (Optional)
              </label>
              <div className="relative">
                <Input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                  placeholder="https://example.com"
                  className="w-full border-gray-300 rounded-2xl h-12"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">Add a link that users can click when viewing the promotion</p>
            </div>

            {/* Upload Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Banner Image <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Image (JPG/PNG/WebP) - Recommended size: 1200x600px, Max size: 10MB
              </p>

              {!formData.bannerImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
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
                      className="cursor-pointer text-blue-500 hover:text-blue-600 font-medium px-4 py-2 border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Choose file
                    </label>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-gray-200 rounded-2xl p-4 bg-gray-50">
                  <div className="flex items-start gap-4">
                    {previewUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-32 h-20 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {formData.bannerImage.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(formData.bannerImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-sm text-gray-500">
                        {formData.bannerImage.type}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      className="flex-shrink-0 p-1 h-8 w-8 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
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
                    {uploadProgress ? 'Processing...' : 'Saving...'}
                  </>
                ) : (
                  isEditMode ? "Update" : "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}