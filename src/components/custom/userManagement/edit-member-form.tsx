import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { ToastContainer } from "@/components/ui/toast"
import { useUpdateUser } from "@/hooks/useUsers"
import { useAllCampuses } from "@/hooks/useCampuses"
import { useSimpleDistricts } from "@/hooks/useDistricts"
import { useToast } from "@/hooks/useToast"
import type { User, UpdateUserData } from "@/types/user"
import { Loader2, Calendar, Plus, Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Globe } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface EditMemberFormProps {
  user: User
  onBack: () => void
  onSave: () => void
}

export function EditMemberForm({ user, onBack, onSave }: EditMemberFormProps) {
  const { toasts, removeToast, success, error: showError } = useToast()

  const [formData, setFormData] = useState({
    fullName: user.name || "",
    dateOfBirth: user.dob ? user.dob.split('T')[0] : "",
    gender: user.gender || "",
    email: user.email || "",
    mobileNumber: user.phone || "",
    campus: user.campus?._id || "",
    district: user.district?._id || "",
    profession: user.profession || "",
    bio: user.bio || "",
    status: user.status || "active"
  })

  const [socialMedia, setSocialMedia] = useState<Array<{ name: string; url: string }>>(
    user.social_media && user.social_media.length > 0
      ? user.social_media
      : [{ name: "", url: "" }]
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateUserMutation = useUpdateUser()

  // Fetch districts first
  const { data: districtsResponse, isLoading: districtsLoading } = useSimpleDistricts({ status: 'active' })

  // Fetch campuses filtered by selected district
  const { data: campusesResponse, isLoading: campusesLoading } = useAllCampuses({
    status: 'listed',
    district: formData.district || undefined
  })

  const districts = districtsResponse?.data || []
  const campuses = campusesResponse?.data || []

  // Social media icon mapping
  const getSocialMediaIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook':
        return <Facebook className="w-4 h-4" />
      case 'X':
        return <Twitter className="w-4 h-4" />
      case 'Instagram':
        return <Instagram className="w-4 h-4" />
      case 'LinkedIn':
        return <Linkedin className="w-4 h-4" />
      case 'YouTube':
        return <Youtube className="w-4 h-4" />
      case 'GitHub':
        return <Github className="w-4 h-4" />
      case 'Website':
        return <Globe className="w-4 h-4" />
      default:
        return null
    }
  }

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters long"
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = "Name cannot exceed 100 characters"
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required"
    } else {
      const dob = new Date(formData.dateOfBirth)
      if (dob > new Date()) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future"
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required"
    } else if (!['male', 'female', 'other'].includes(formData.gender)) {
      newErrors.gender = "Gender must be male, female, or other"
    }

    // Email is optional
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please provide a valid email address"
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Phone number is required"
    } else {
      // Remove all non-digit characters except leading +
      const cleanedNumber = formData.mobileNumber.replace(/[^\d+]/g, '')
      const digitsOnly = cleanedNumber.replace(/\+/g, '')
      
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        newErrors.mobileNumber = "Phone number must be 10-15 digits"
      }
    }

    if (!formData.profession.trim()) {
      newErrors.profession = "Profession is required"
    } else if (formData.profession.trim().length > 100) {
      newErrors.profession = "Profession cannot exceed 100 characters"
    }

    if (!formData.district) {
      newErrors.district = "District is required"
    }

    // Campus is required only for Students
    if (formData.profession === 'Student' && !formData.campus) {
      newErrors.campus = "Campus is required for students"
    }

    // Optional fields validation
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = "Bio cannot exceed 1000 characters"
    }

    // Social media URL validation
    socialMedia.forEach((social, index) => {
      if (social.url && social.url.trim() !== "") {
        try {
          new URL(social.url)
        } catch {
          newErrors[`socialMedia_${index}`] = "Please provide a valid URL"
        }
      }
    })

    setErrors(newErrors)
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSave = async () => {
    const { isValid, errors: validationErrors } = validateForm()
    if (!isValid) {
      const firstError = Object.values(validationErrors)[0]
      if (firstError) {
        showError("Validation Error", firstError)
      }
      return
    }

    try {
      // Filter out empty social media entries
      const validSocialMedia = socialMedia.filter(
        sm => sm.name.trim() !== "" && sm.url.trim() !== ""
      )

      // Clean phone number - remove all non-digits except leading +
      const cleanedPhone = formData.mobileNumber.replace(/[^\d+]/g, '')

      const userData: UpdateUserData = {
        name: formData.fullName,
        phone: cleanedPhone,
        gender: formData.gender as 'male' | 'female' | 'other' | undefined,
        dob: formData.dateOfBirth || undefined,
        campus: formData.campus || undefined,
        district: formData.district || undefined,
        profession: formData.profession || undefined,
        bio: formData.bio || undefined,
        social_media: validSocialMedia.length > 0 ? validSocialMedia : undefined,
        status: formData.status as any
      }

      // Add email only if provided
      if (formData.email.trim()) {
        userData.email = formData.email
      }

      await updateUserMutation.mutateAsync({
        id: user._id,
        userData
      })
      success("Member updated successfully")
      onSave()
    } catch (error: any) {
      console.error('Failed to update user:', error)
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update member. Please try again."
      showError("Update Failed", apiMessage)
    }
  }

  const handleCancel = () => {
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
                  Date of birth <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
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
                    wrapperClassName="w-full"
                    className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className={`w-full border-gray-300 rounded-lg ${errors.gender ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                )}
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
                  placeholder="+91 9876543210"
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
                District <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                className={`w-full border-gray-300 rounded-lg ${errors.district ? 'border-red-500' : ''}`}
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
              {errors.district && (
                <p className="text-red-500 text-xs mt-1">{errors.district}</p>
              )}
            </div>

            {/* Campus - Only show for Students */}
            {formData.profession === 'Student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campus <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.campus}
                  onChange={(e) => handleInputChange("campus", e.target.value)}
                  className={`w-full border-gray-300 rounded-lg ${errors.campus ? 'border-red-500' : ''}`}
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
                {errors.campus && (
                  <p className="text-red-500 text-xs mt-1">{errors.campus}</p>
                )}
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
                maxLength={1000}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.bio ? 'border-red-500' : ''}`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && (
                  <p className="text-red-500 text-xs">{errors.bio}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.bio.length}/1000 characters
                </p>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Links
              </label>
              <div className="space-y-3">
                {socialMedia.map((social, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              const dropdown = document.getElementById(`social-dropdown-${index}`)
                              if (dropdown) {
                                dropdown.classList.toggle('hidden')
                              }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {social.name ? (
                              <>
                                {getSocialMediaIcon(social.name)}
                                <span className="text-gray-900">{social.name}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">Select Platform</span>
                            )}
                          </button>
                          <div
                            id={`social-dropdown-${index}`}
                            className="hidden absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleSocialMediaChange(index, 'name', '')
                                document.getElementById(`social-dropdown-${index}`)?.classList.add('hidden')
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left text-gray-400"
                            >
                              Select Platform
                            </button>
                            {['Facebook', 'X', 'Instagram', 'LinkedIn', 'YouTube', 'GitHub', 'Website'].map((platform) => (
                              <button
                                key={platform}
                                type="button"
                                onClick={() => {
                                  handleSocialMediaChange(index, 'name', platform)
                                  document.getElementById(`social-dropdown-${index}`)?.classList.add('hidden')
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left text-gray-900"
                              >
                                {getSocialMediaIcon(platform)}
                                <span>{platform}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Enter URL"
                          value={social.url}
                          onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                          className={`w-full border-gray-300 rounded-lg ${errors[`socialMedia_${index}`] ? 'border-red-500' : ''}`}
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
                    {errors[`socialMedia_${index}`] && (
                      <p className="text-red-500 text-xs ml-1">{errors[`socialMedia_${index}`]}</p>
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
