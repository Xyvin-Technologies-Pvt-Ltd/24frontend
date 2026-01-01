import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "@/components/custom/top-bar"
import { Upload, Calendar } from "lucide-react"

interface AddPromotionFormProps {
  onBack: () => void
  onSave: (promotionData: any) => void
}

export function AddPromotionForm({ onBack, onSave }: AddPromotionFormProps) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    bannerImage: null as File | null
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      bannerImage: file
    }))
  }

  const handleSave = () => {
    const promotionData = {
      ...formData
    }
    onSave(promotionData)
  }

  const handleCancel = () => {
    onBack()
  }

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
          <div className="space-y-8">
            {/* Start Date and End Date Row */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Start Date
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full border-gray-300 rounded-2xl pr-10 h-12"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  End Date
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="w-full border-gray-300 rounded-2xl pr-10 h-12"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
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
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full min-w-[120px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full min-w-[120px]"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}