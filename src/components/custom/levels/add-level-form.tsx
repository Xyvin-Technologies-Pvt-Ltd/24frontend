import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { BulkUploadModal } from "@/components/custom/levels/bulk-upload-modal"
import { Upload } from "lucide-react"

interface AddLevelFormProps {
  onBack: () => void
  onSave: (levelData: any) => void
  onBulkUpload?: (data: any[]) => Promise<void>
  levelType: "district" | "campus"
  districts?: { id: string, name: string }[]
  isBulkUploading?: boolean
}

export function AddLevelForm({ onBack, onSave, onBulkUpload, levelType, districts = [], isBulkUploading = false }: AddLevelFormProps) {
  const [formData, setFormData] = useState({
    levelName: "",
    district: ""
  })
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // Validate form data here if needed
    if (formData.levelName.trim()) {
      if (levelType === "campus" && !formData.district) return

      onSave({
        ...formData,
        type: levelType,
        // id: Date.now().toString(), // Generate a simple ID - Handled by backend now or levels.tsx
        // dateCreated: new Date().toLocaleDateString('en-GB'),
        // totalMembers: 0,
        ...(levelType === "district" ? { totalCampuses: 0 } : { district: formData.district })
      })
    }
  }

  const handleCancel = () => {
    onBack()
  }

  const getPlaceholder = () => {
    return levelType === "district" ? "Enter district name" : "Enter campus name"
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb and Bulk Upload Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center text-sm text-gray-600">
            <button
              onClick={onBack}
              className="hover:text-gray-900"
            >
              Levels
            </button>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Add Level</span>
          </div>

          {/* Bulk Upload Button - Only for Campus */}
          {levelType === "campus" && onBulkUpload && (
            <Button
              onClick={() => setIsBulkUploadModalOpen(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white rounded-full"
              disabled={isBulkUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          )}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 w-full">
          <div className="space-y-8">

            {/* Level Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Level Name
              </label>
              <Input
                placeholder={getPlaceholder()}
                value={formData.levelName}
                onChange={(e) => handleInputChange("levelName", e.target.value)}
                className="w-full border-gray-300 rounded-2xl h-12"
              />
            </div>

            {/* District Field for Campus */}
            {levelType === "campus" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  District
                </label>
                <Select
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  placeholder="Select District"
                  className="w-full border-gray-300 rounded-2xl h-12"
                >
                  <option value="" disabled>Select District</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </Select>
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
                disabled={!formData.levelName.trim() || (levelType === "campus" && !formData.district)}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {levelType === "campus" && onBulkUpload && (
        <BulkUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => setIsBulkUploadModalOpen(false)}
          onUpload={async (data) => {
            await onBulkUpload(data)
            setIsBulkUploadModalOpen(false)
          }}
          isLoading={isBulkUploading}
        />
      )}
    </div>
  )
}