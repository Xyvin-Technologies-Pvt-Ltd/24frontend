import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { useCreateNotification } from "@/hooks/useNotifications"
import type { CreateNotificationData } from "@/types/notification"
import { Smartphone } from "lucide-react"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"

interface AddNotificationFormProps {
  onBack: () => void
  onSave: (notificationData: any) => void
}

export function AddNotificationForm({ onBack, onSave }: AddNotificationFormProps) {
  const [formData, setFormData] = useState({
    notificationTitle: "",
    addContent: "",
    targetAudience: "",
    appNotification: false,
    whatsappNotification: false
  })

  const createNotificationMutation = useCreateNotification()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      const types: ('in-app' | 'whatsapp')[] = []
      if (formData.appNotification) types.push('in-app')
      if (formData.whatsappNotification) types.push('whatsapp')

      const notificationData: CreateNotificationData = {
        type: types,
        subject: formData.notificationTitle.trim(),
        content: formData.addContent.trim(),
        is_all: true 
      }

      console.log('Sending notification data:', notificationData)
      await createNotificationMutation.mutateAsync(notificationData)
      onSave(notificationData)
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
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
          <span>Notification</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Add Notification</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 w-full">
          <div className="space-y-8">
            {/* Notification Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Notification Title
              </label>
              <Input
                type="text"
                placeholder="Enter Title"
                value={formData.notificationTitle}
                onChange={(e) => handleInputChange("notificationTitle", e.target.value)}
                className="w-full border-gray-300 rounded-lg h-12"
              />
            </div>

            {/* Add Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Add Content
              </label>
              <textarea
                placeholder="Add Description in less than 500 words"
                value={formData.addContent}
                onChange={(e) => handleInputChange("addContent", e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Audience
              </label>
              <Select
                value={formData.targetAudience}
                onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                placeholder="Select"
                className="w-full border-gray-300 rounded-lg h-12"
              >
                <option value="">Select</option>
                <option value="All Users">All Users</option>
                <option value="Students">Students</option>
                <option value="Faculty">Faculty</option>
                <option value="Alumni">Alumni</option>
                <option value="Staff">Staff</option>
              </Select>
            </div>

            {/* Notification Channel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Notification Channel
              </label>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  
                  <input
                    type="checkbox"
                    checked={formData.appNotification}
                    onChange={(e) => handleInputChange("appNotification", e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Smartphone className="w-5 h-5 text-black" />
                  <span className="text-sm text-gray-700">App Notification</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  
                  <input
                    type="checkbox"
                    checked={formData.whatsappNotification}
                    onChange={(e) => handleInputChange("whatsappNotification", e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <WhatsAppIcon className="w-5 h-5 text-black" />
                  <span className="text-sm text-gray-700">WhatsApp Notification</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full min-w-[120px]"
              >
                Discard
              </Button>
              <Button
                onClick={handleSave}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full min-w-[120px]"
              >
                Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}