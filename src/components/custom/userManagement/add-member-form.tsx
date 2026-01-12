import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { useCreateUser } from "@/hooks/useUsers"
import type { CreateUserData } from "@/types/user"
import { Loader2 } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"


interface AddMemberFormProps {
  onBack: () => void
  onSave: (memberData: any) => void
}

export function AddMemberForm({ onBack, onSave }: AddMemberFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    mobileNumber: "",
    campus: "",
    district: "",
    role: ""
  })

  const createUserMutation = useCreateUser()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      const userData: CreateUserData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.mobileNumber,
        gender: formData.gender as 'male' | 'female' | 'other',
        dob: formData.dateOfBirth,
        status: 'pending'
      }

      await createUserMutation.mutateAsync(userData)
      onSave(formData)
    } catch (error) {
      console.error('Failed to create user:', error)
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
          <span className="text-gray-900">Add Member</span>
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
                <DatePicker
                  selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                  onChange={(date: Date | null) =>
                    handleInputChange(
                      "dateOfBirth",
                      date ? date.toISOString().split("T")[0] : ""
                    )
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select"
                  maxDate={new Date()}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            {/* Campus and District Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campus
                </label>
                <Select
                  value={formData.campus}
                  onChange={(e) => handleInputChange("campus", e.target.value)}
                  placeholder="Select"
                  className="w-full border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="St. Xaviers">St. Xaviers</option>
                  <option value="Greenwood School">Greenwood School</option>
                  <option value="Riverside High">Riverside High</option>
                  <option value="Westview High">Westview High</option>
                  <option value="Central Academy">Central Academy</option>
                  <option value="Sunnydale Academy">Sunnydale Academy</option>
                  <option value="Maple Leaf School">Maple Leaf School</option>
                  <option value="Hilltop High">Hilltop High</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <Select
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  placeholder="Select"
                  className="w-full border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="Ernakulam">Ernakulam</option>
                  <option value="Thrissur">Thrissur</option>
                  <option value="Denver">Denver</option>
                  <option value="New York">New York</option>
                  <option value="Austin">Austin</option>
                  <option value="Chicago">Chicago</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="Seattle">Seattle</option>
                  <option value="Los Angeles">Los Angeles</option>
                </Select>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <Input
                placeholder="Enter your title"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={createUserMutation.isPending}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createUserMutation.isPending}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full"
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
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