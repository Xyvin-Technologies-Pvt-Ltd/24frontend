import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { useUpdateUser } from "@/hooks/useUsers"
import type { User, UpdateUserData } from "@/types/user"
import { Loader2 } from "lucide-react"

interface EditMemberFormProps {
  user: User
  onBack: () => void
  onSave: () => void
}

export function EditMemberForm({ user, onBack, onSave }: EditMemberFormProps) {
  const [formData, setFormData] = useState({
    fullName: user.name || "",
    dateOfBirth: user.dob ? user.dob.split('T')[0] : "",
    gender: user.gender || "",
    email: user.email || "",
    mobileNumber: user.phone || "",
    status: user.status || "active"
  })

  const updateUserMutation = useUpdateUser()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      const userData: UpdateUserData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.mobileNumber,
        gender: formData.gender as 'male' | 'female' | 'other',
        dob: formData.dateOfBirth,
        status: formData.status as any
      }

      await updateUserMutation.mutateAsync({
        id: user._id,
        userData
      })
      onSave()
    } catch (error) {
      console.error('Failed to update user:', error)
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
            Member Management
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Edit Member</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 width-full">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
              />
            </div>

            {/* Date of Birth and Gender Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of birth
                </label>
                <Input
                  type="date"
                  placeholder="dd/mm/yyyy"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  placeholder="Select"
                  className="w-full border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            {/* Email and Mobile Number Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter mail address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateUserMutation.isPending}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateUserMutation.isPending}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}