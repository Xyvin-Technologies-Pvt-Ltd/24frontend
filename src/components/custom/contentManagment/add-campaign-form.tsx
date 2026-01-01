import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { Plus, Calendar } from "lucide-react"

interface Campaign {
  id: number
  name: string
  organizedBy: string
  description: string
  endDate: string
  targetAmount: string
  media: File | null
  tag: string
  targetAmountType: string
  status?: string
  targetDate?: string
}

interface AddCampaignFormProps {
  onBack: () => void
  onSave: (campaignData: any) => void
  editCampaign?: Campaign | null
  isEdit?: boolean
}

export function AddCampaignForm({ onBack, onSave, editCampaign, isEdit = false }: AddCampaignFormProps) {
  const [formData, setFormData] = useState({
    campaignName: editCampaign?.name || "",
    organizedBy: editCampaign?.organizedBy || "",
    description: editCampaign?.description || "",
    endDate: editCampaign?.endDate || "",
    targetAmount: editCampaign?.targetAmount || "",
    media: editCampaign?.media || null as File | null,
    tag: editCampaign?.tag || "",
    targetAmountType: editCampaign?.targetAmountType || "",
    status: editCampaign?.status || "Active",
    targetDate: editCampaign?.targetDate || ""
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
      media: file
    }))
  }

  const handleSave = () => {
    const campaignData = {
      ...formData
    }
    onSave(campaignData)
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
                  Campaign Name
                </label>
                <Input
                  placeholder="Enter event name"
                  value={formData.campaignName}
                  onChange={(e) => handleInputChange("campaignName", e.target.value)}
                  className="w-full border-gray-300 rounded-lg h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organized By
                </label>
                <Input
                  placeholder="Enter Name of the organiser"
                  value={formData.organizedBy}
                  onChange={(e) => handleInputChange("organizedBy", e.target.value)}
                  className="w-full border-gray-300 rounded-lg h-12"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Add a brief overview of the event..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date and Target Amount Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="w-full border-gray-300 rounded-lg pr-10 h-12"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount
                </label>
                <Select
                  value={formData.targetAmount}
                  onChange={(e) => handleInputChange("targetAmount", e.target.value)}
                  placeholder="Select"
                  className="w-full border-gray-300 rounded-lg h-12"
                >
                  <option value="50000">₹50,000</option>
                  <option value="100000">₹1,00,000</option>
                  <option value="200000">₹2,00,000</option>
                  <option value="500000">₹5,00,000</option>
                  <option value="1000000">₹10,00,000</option>
                </Select>
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media
              </label>
              {formData.media || (isEdit && editCampaign?.media) ? (
                <div className="mb-4">
                  <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={formData.media ? URL.createObjectURL(formData.media) : "/placeholder-image.jpg"} 
                      alt="Campaign media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">Upload file</p>
                    <input
                      type="file"
                      accept="image/*,video/*"
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
              
              {/* Add Button */}
              <div className="flex justify-start mt-4">
                <Button
                  type="button"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                  variant="ghost"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Status and Tag Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full border-gray-300 rounded-lg h-12"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                  <option value="Paused">Paused</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag
                </label>
                <Select
                  value={formData.tag}
                  onChange={(e) => handleInputChange("tag", e.target.value)}
                  placeholder="Select"
                  className="w-full border-gray-300 rounded-lg h-12"
                >
                  <option value="health">#Health</option>
                  <option value="education">#Education</option>
                  <option value="environment">#Environment</option>
                  <option value="social">#Social</option>
                  <option value="medical">#Medical</option>
                </Select>
              </div>
            </div>

            {/* Target Date and Target Amount Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formData.targetDate}
                    onChange={(e) => handleInputChange("targetDate", e.target.value)}
                    className="w-full border-gray-300 rounded-lg pr-10 h-12"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount
                </label>
                <Select
                  value={formData.targetAmountType}
                  onChange={(e) => handleInputChange("targetAmountType", e.target.value)}
                  placeholder="Select"
                  className="w-full border-gray-300 rounded-lg h-12"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="flexible">Flexible Amount</option>
                  <option value="milestone">Milestone Based</option>
                </Select>
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
                {isEdit ? "Save" : "Add Campaign"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}