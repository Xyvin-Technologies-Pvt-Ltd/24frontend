import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { Loader2 } from "lucide-react"
import { useCreateResource } from "@/hooks/useResources"

interface AddResourceFormProps {
  onBack: () => void
  onSave: (resourceData: any) => void
}

export function AddResourceForm({ onBack, onSave }: AddResourceFormProps) {
  const [formData, setFormData] = useState({
    contentName: "",
    category: "",
    content: ""
  })
  const [error, setError] = useState<string>("")

  const createResourceMutation = useCreateResource()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSave = async () => {
    try {
      setError("")
      
      // Validate required fields
      if (!formData.contentName.trim() || !formData.category || !formData.content.trim()) {
        setError("Please fill in all required fields")
        return
      }

      // Transform data to match API expectations
      const resourceData = {
        content_name: formData.contentName.trim(),
        category: formData.category,
        content: formData.content.trim()
      }

      // Create the resource using the API
      await createResourceMutation.mutateAsync(resourceData)
      
      console.log("Resource created successfully!")
      onSave(resourceData)
      
    } catch (error: any) {
      console.error('Error creating resource:', error)
      setError(error.message || "Failed to create resource. Please try again.")
    }
  }

  const handleCancel = () => {
    onBack()
  }

  const isLoading = createResourceMutation.isPending

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
          <span>Resources</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Add Resources</span>
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
            {/* Content Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content Name
              </label>
              <Input
                type="text"
                placeholder="Enter Content name"
                value={formData.contentName}
                onChange={(e) => handleInputChange("contentName", e.target.value)}
                className="w-full border-gray-300 rounded-lg h-12"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="Select"
                className="w-full border-gray-300 rounded-lg h-12"
              >
                <option value="">Select</option>
                <option value="Documents">Documents</option>
                <option value="Learning Materials">Learning Materials</option>
                <option value="Event Highlights">Event Highlights</option>
                <option value="Multimedia">Multimedia</option>
                <option value="Guidelines">Guidelines</option>
              </Select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content
              </label>
              <textarea
                placeholder="Add Content resources"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                    Saving...
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