import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { useCreateUser } from "@/hooks/useUsers"
import { useAllCampuses } from "@/hooks/useCampuses"
import { useSimpleDistricts } from "@/hooks/useDistricts"
import type { CreateUserData } from "@/types/user"
import { Loader2, Calendar, Plus } from "lucide-react"
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
    profession: "",
    bio: ""
  })

  const [socialMedia, setSocialMedia] = useState<Array<{ name: string; url: string }>>([
    { name: "", url: "" }
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const createUserMutation = useCreateUser()

  // Fetch districts first
  const { data: districtsResponse, isLoading: districtsLoading } = useSimpleDistricts({ status: 'active' })

  // Fetch campuses filtered by selected district
  const { data: campusesResponse, isLoading: campusesLoading } = useAllCampuses({
    status: 'listed',
    district: formData.district || undefined
  } as { status: string; district?: string })

  const districts = districtsResponse?.data || []
  const campuses = campusesResponse?.data || []

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear campus when district changes
    if (field === 'district') {
      setFormData(prev => ({
        ...prev,
        district: value,
        campus: '' // Reset campus when district changes
      }))
    }

    // Clear campus when profession changes from Student to something else
    if (field === 'profession' && value !== 'Student') {
      setFormData(prev => ({
        ...prev,
        profession: value,
        campus: '' // Reset campus when profession is not Student
      }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAddSocialMedia = () => {
    setSocialMedia([...socialMedia, { name: "", url: "" }])
  }

  const handleRemoveSocialMedia = (index: number) => {
    if (socialMedia.length > 1) {
      const updated = socialMedia.filter((_, i) => i !== index)
      setSocialMedia(updated)
    }
  }

  const handleSocialMediaChange = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...socialMedia]
    updated[index][field] = value
    setSocialMedia(updated)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters long"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please provide a valid email address"
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required"
    } else if (!/^[0-9]{10,15}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Phone number must be 10-15 digits"
    }

    if (!formData.profession.trim()) {
      newErrors.profession = "Profession is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      // Filter out empty social media entries
      const validSocialMedia = socialMedia.filter(
        sm => sm.name.trim() !== "" && sm.url.trim() !== ""
      )

      const userData: CreateUserData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.mobileNumber,
        profession: formData.profession,
        status: 'pending'
      }

      // Add optional fields
      if (formData.gender) {
        userData.gender = formData.gender as 'male' | 'female' | 'other'
      }
      if (formData.dateOfBirth) {
        userData.dob = formData.dateOfBirth
      }
      if (formData.campus) {
        userData.campus = formData.campus
      }
      if (formData.district) {
        userData.district = formData.district
      }
      if (formData.bio) {
        userData.bio = formData.bio
      }
      if (validSocialMedia.length > 0) {
        userData.social_media = validSocialMedia
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
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={`w-full border-gray-300 rounded-lg ${errors.fullName ? 'border-red-500' : ''}`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Date of Birth and Gender Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of birth
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                    onChange={(date: Date | null) =>
                      handleInputChange(
                        "dateOfBirth",
                        date ? date.toISOString().split("T")[0] : ""
                      )
                    }
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    maxDate={new Date()}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
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
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="Enter mail address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full border-gray-300 rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  className={`w-full border-gray-300 rounded-lg ${errors.mobileNumber ? 'border-red-500' : ''}`}
                />
                {errors.mobileNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
                )}
              </div>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profession <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.profession}
                onChange={(e) => handleInputChange("profession", e.target.value)}
                className={`w-full border-gray-300 rounded-lg ${errors.profession ? 'border-red-500' : ''}`}
              >
                <option value="Student">Student</option>
                <option value="Employed (Private Sector)">Employed (Private Sector)</option>
                <option value="Employed (Government/Public Sector)">Employed (Government/Public Sector)</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business Owner / Entrepreneur">Business Owner / Entrepreneur</option>
                <option value="Freelancer / Consultant">Freelancer / Consultant</option>
                <option value="Professional (Doctor / Engineer / Lawyer / CA, etc.)">Professional (Doctor / Engineer / Lawyer / CA, etc.)</option>
                <option value="Teacher / Professor / Academic">Teacher / Professor / Academic</option>
                <option value="IT / Software Professional">IT / Software Professional</option>
                <option value="Healthcare Professional">Healthcare Professional</option>
                <option value="Homemaker">Homemaker</option>
                <option value="Retired">Retired</option>
                <option value="Intern / Trainee">Intern / Trainee</option>
                <option value="Researcher / Scholar">Researcher / Scholar</option>
                <option value="Artist / Designer / Creative Professional">Artist / Designer / Creative Professional</option>
                <option value="Sales / Marketing Professional">Sales / Marketing Professional</option>
                <option value="Finance / Banking Professional">Finance / Banking Professional</option>
                <option value="Agriculture / Farmer">Agriculture / Farmer</option>
                <option value="Skilled Worker / Technician">Skilled Worker / Technician</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Other">Other</option>
              </Select>
              {errors.profession && (
                <p className="text-red-500 text-xs mt-1">{errors.profession}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <Select
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
                disabled={districtsLoading}
              >
                {districtsLoading ? (
                  <option disabled>Loading districts...</option>
                ) : (
                  districts.map((district: any) => (
                    <option key={district._id} value={district._id}>
                      {district.name}
                    </option>
                  ))
                )}
              </Select>
            </div>

            {/* Campus - Only show for Students */}
            {formData.profession === 'Student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campus
                </label>
                <Select
                  value={formData.campus}
                  onChange={(e) => handleInputChange("campus", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                  disabled={!formData.district || campusesLoading}
                >
                  <option value="">
                    {!formData.district ? 'Select District First' : 'Select Campus'}
                  </option>
                  {campusesLoading ? (
                    <option disabled>Loading campuses...</option>
                  ) : campuses.length === 0 && formData.district ? (
                    <option disabled>No campuses available</option>
                  ) : (
                    campuses.map((campus: any) => (
                      <option key={campus._id} value={campus._id}>
                        {campus.name}
                      </option>
                    ))
                  )}
                </Select>
              </div>
            )}

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                placeholder="Enter bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Social Media Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Links
              </label>
              <div className="space-y-3">
                {socialMedia.map((social, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Platform name (e.g., LinkedIn, Twitter)"
                        value={social.name}
                        onChange={(e) => handleSocialMediaChange(index, 'name', e.target.value)}
                        className="w-full border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="URL (e.g., https://linkedin.com/in/username)"
                        value={social.url}
                        onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                        className="w-full border-gray-300 rounded-lg"
                      />
                    </div>
                    {socialMedia.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveSocialMedia(index)}
                        className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSocialMedia}
                className="mt-3 px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Social Media
              </Button>
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