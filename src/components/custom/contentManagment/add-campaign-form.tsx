import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "@/components/custom/top-bar"
import { ToastContainer } from "@/components/ui/toast"
import { Plus, Loader2 } from "lucide-react"
import { useCreateCampaign, useUpdateCampaign } from "@/hooks/useCampaigns"
import { useToast } from "@/hooks/useToast"
import { uploadService } from "@/services/uploadService"
import type { Campaign } from "@/types/campaign"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar } from "lucide-react"


interface AddCampaignFormProps {
  onBack: () => void
  onSave: (campaignData: any) => void
  editCampaign?: Campaign | null
  isEdit?: boolean
}

export function AddCampaignForm({ onBack, onSave, editCampaign, isEdit = false }: AddCampaignFormProps) {
  const { toasts, removeToast, success, error } = useToast()
  
  const [formData, setFormData] = useState({
    title: editCampaign?.title || "",
    organized_by: editCampaign?.organized_by || "",
    description: editCampaign?.description || "",
    start_date: editCampaign?.start_date ? new Date(editCampaign.start_date).toISOString().split('T')[0] : "",
    target_date: editCampaign?.target_date ? new Date(editCampaign.target_date).toISOString().split('T')[0] : "",
    target_amount: editCampaign?.target_amount?.toString() || "",
    cover_image: editCampaign?.cover_image || "", // Will be populated after upload
    tag: editCampaign?.tag || "",
    status: editCampaign?.status || "pending"
  })

  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  const createCampaignMutation = useCreateCampaign()
  const updateCampaignMutation = useUpdateCampaign()

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (mediaFile) {
        URL.revokeObjectURL(URL.createObjectURL(mediaFile))
      }
    }
  }, [mediaFile])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (file: File | null) => {
    setMediaFile(file)
  }

  const handleSave = async () => {
    // Validation
    if (!formData.title || !formData.organized_by || !formData.description || !formData.target_amount) {
      error('Validation Error', 'Please fill in all required fields')
      return
    }

    if (!formData.start_date || !formData.target_date) {
      error('Validation Error', 'Please select start date and target date')
      return
    }

    if (new Date(formData.start_date) >= new Date(formData.target_date)) {
      error('Validation Error', 'Target date must be after start date')
      return
    }

    // For new campaigns, require cover image
    if (!isEdit && !mediaFile) {
      error('Validation Error', 'Please upload a cover image')
      return
    }

    setIsSubmitting(true)
    setUploadProgress("Preparing...")
    
    try {
      let coverImageUrl = formData.cover_image // Existing image for edit mode
      
      // Upload new image if provided
      if (mediaFile) {
        setUploadProgress("Uploading cover image...")
        const uploadResponse = await uploadService.uploadFile(mediaFile, "campaigns")
        coverImageUrl = uploadResponse.data.url
        setUploadProgress("")
      }

      // Validate that we have a cover image URL
      if (!coverImageUrl) {
        throw new Error('Cover image upload failed')
      }

      const campaignData = {
        title: formData.title,
        organized_by: formData.organized_by,
        description: formData.description,
        start_date: formData.start_date,
        target_date: formData.target_date,
        target_amount: parseInt(formData.target_amount),
        tag: formData.tag,
        cover_image: coverImageUrl
      }

      if (isEdit && editCampaign) {
        await updateCampaignMutation.mutateAsync({
          id: editCampaign._id,
          data: {
            ...campaignData,
            status: formData.status as any
          }
        })
        success('Success', 'Campaign updated successfully')
      } else {
        await createCampaignMutation.mutateAsync(campaignData)
        success('Success', 'Campaign created successfully')
      }

      onSave(campaignData)
    } catch (error: any) {
      console.error('Failed to save campaign:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to save campaign. Please try again.'
      error('Error', errorMessage)
    } finally {
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }

  const handleCancel = () => {
    // Clean up object URLs
    if (mediaFile) {
      URL.revokeObjectURL(URL.createObjectURL(mediaFile))
    }
    onBack()
  }

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
          <span>Campaigns</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{isEdit ? "Edit Campaign" : "Add Campaigns"}</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 w-full">
          <div className="space-y-6">
            {/* Campaign Name and Organized By Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <Input
                  placeholder="Enter campaign name"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full border-gray-300 rounded-lg h-12"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organized By *
                </label>
                <Input
                  placeholder="Enter name of the organiser"
                  value={formData.organized_by}
                  onChange={(e) => handleInputChange("organized_by", e.target.value)}
                  className="w-full border-gray-300 rounded-lg h-12"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                placeholder="Add a brief overview of the campaign..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Start Date and Target Amount Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="relative w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>

                <DatePicker
                  selected={formData.start_date ? new Date(formData.start_date) : null}
                  onChange={(date: Date | null) =>
                    handleInputChange("start_date", date ? date.toISOString().split("T")[0] : "")
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  wrapperClassName="w-full"
                  className="w-full h-12 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm pl-3 pr-10
               focus:outline-none focus:ring-0 focus:border-gray-900 hover:border-gray-400"
                  popperClassName="z-50"
                />

                <button
                  type="button"
                  onClick={() => document.querySelector<HTMLInputElement>(".react-datepicker-wrapper input")?.focus()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  <Calendar className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount *
                </label>
                <Input
                  type="number"
                  placeholder="Enter target amount"
                  value={formData.target_amount}
                  onChange={(e) => handleInputChange("target_amount", e.target.value)}
                  className="w-full border-gray-300 rounded-lg h-12"
                  required
                />
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image * (Required)
              </label>
              {mediaFile || (isEdit && editCampaign?.cover_image) ? (
                <div className="mb-4">
                  <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={mediaFile ? URL.createObjectURL(mediaFile) : editCampaign?.cover_image || "/placeholder-image.jpg"} 
                      alt="Campaign cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setMediaFile(null)
                        if (mediaFile) URL.revokeObjectURL(URL.createObjectURL(mediaFile))
                      }}
                      className="text-red-500 hover:text-red-600 text-sm mt-2"
                    >
                      Remove image
                    </button>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">Upload cover image (JPG, PNG) - Max 10MB</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="cursor-pointer text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Choose file
                    </label>
                  </div>
                </div>
              )}
              
              {/* Upload Progress */}
              {uploadProgress && (
                <div className="mt-2 flex items-center text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {uploadProgress}
                </div>
              )}
              
              {/* Add Button */}
              <div className="flex justify-start mt-4">
                <Button
                  type="button"
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                  variant="ghost"
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Target Date and Tag Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="relative w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date
                </label>

                <DatePicker
                  selected={formData.target_date ? new Date(formData.target_date) : null}
                  onChange={(date: Date | null) =>
                    handleInputChange("target_date", date ? date.toISOString().split("T")[0] : "")
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  wrapperClassName="w-full"
                  className="w-full h-12 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm pl-3 pr-10
                 focus:outline-none focus:ring-0 focus:border-gray-900 hover:border-gray-400"
                  popperClassName="z-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    document.querySelector<HTMLInputElement>(
                      ".react-datepicker-wrapper input"
                    )?.focus()
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  <Calendar className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag
                </label>
                <select
                  value={formData.tag}
                  onChange={(e) => handleInputChange("tag", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg h-12 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="health">Health</option>
                  <option value="education">Education</option>
                  <option value="environment">Environment</option>
                  <option value="social">Social</option>
                  <option value="medical">Medical</option>
                </select>
              </div>
            </div>

            {/* Status (only show in edit mode) */}
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg h-12 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full min-w-[120px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full min-w-[120px] disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (isEdit ? "Save Changes" : "Add Campaign")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}