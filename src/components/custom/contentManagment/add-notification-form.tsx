import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { ToastContainer } from "@/components/ui/toast"
import { NotificationUserPicker } from "@/components/custom/contentManagment/notification-user-picker"
import {
  useCreateNotification,
  useUpdateNotification,
  useNotification,
  useNotificationAudienceSummary,
} from "@/hooks/useNotifications"
import { useToast } from "@/hooks/useToast"
import { getApiErrorMessage } from "@/lib/utils"
import { uploadService } from "@/services/uploadService"
import type { AudienceUser, CreateNotificationData } from "@/types/notification"
import { CheckCircle, Loader2, Mail, Smartphone, Upload, X } from "lucide-react"

interface AddNotificationFormProps {
  onBack: () => void
  onSave: (notificationData: any) => void
  notificationId?: string
  mode?: 'create' | 'edit'
}

type AudienceMode = "all" | "selected" | "profession"
type Channel = "in-app" | "email"

const ACCEPTED_IMAGES = ["image/jpeg", "image/jpg", "image/png"]

const CHANNEL_OPTIONS: { value: Channel; label: string; hint: string; icon: typeof Mail }[] = [
  { value: "in-app", label: "In-App", hint: "Phone notification bar + app notification list", icon: Smartphone },
  { value: "email", label: "Email", hint: "Sent to users with an email address", icon: Mail },
]

export function AddNotificationForm({ onBack, onSave, notificationId, mode = 'create' }: AddNotificationFormProps) {
  const { toasts, removeToast, error: showError } = useToast()
  const [formData, setFormData] = useState({
    notificationTitle: "",
    addContent: "",
    targetProfession: "",
    link: "",
  })
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("all")
  const [selectedUsers, setSelectedUsers] = useState<AudienceUser[]>([])
  const [channels, setChannels] = useState<Channel[]>(["in-app"])
  const [image, setImage] = useState("")
  const [imageUploading, setImageUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Profession options matching the user management form
  const professionOptions = [
    'Student',
    'Employed (Private Sector)',
    'Employed (Government/Public Sector)',
    'Self-Employed',
    'Business Owner / Entrepreneur',
    'Freelancer / Consultant',
    'Professional (Doctor / Engineer / Lawyer / CA, etc.)',
    'Teacher / Professor / Academic',
    'IT / Software Professional',
    'Healthcare Professional',
    'Homemaker',
    'Retired',
    'Intern / Trainee',
    'Researcher / Scholar',
    'Artist / Designer / Creative Professional',
    'Sales / Marketing Professional',
    'Finance / Banking Professional',
    'Agriculture / Farmer',
    'Skilled Worker / Technician',
    'Unemployed',
    'Other'
  ]

  const createNotificationMutation = useCreateNotification()
  const updateNotificationMutation = useUpdateNotification()
  const { data: summaryResponse } = useNotificationAudienceSummary()
  const { data: notificationResponse, isLoading: isLoadingNotification } = useNotification(notificationId || '', {
    enabled: mode === 'edit' && !!notificationId
  })

  const summary = summaryResponse?.data

  // Load notification data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && notificationResponse?.data) {
      const notification = notificationResponse.data
      setFormData({
        notificationTitle: notification.subject,
        addContent: notification.content,
        targetProfession: notification.target_profession || "",
        link: notification.link || "",
      })
      setAudienceMode(notification.is_all ? "all" : notification.target_profession ? "profession" : "selected")
      setSelectedUsers(notification.selected_users || [])
      setChannels(notification.type.filter((type): type is Channel => type === "in-app" || type === "email"))
      setImage(notification.image || "")
    }
  }, [mode, notificationResponse])

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    clearError(field)
  }

  const toggleChannel = (channel: Channel) => {
    setChannels((prev) => (prev.includes(channel) ? prev.filter((value) => value !== channel) : [...prev, channel]))
    clearError("channels")
  }

  const handleImageUpload = async (file: File) => {
    if (!ACCEPTED_IMAGES.includes(file.type)) {
      showError("Invalid File", "Please upload a JPG or PNG image")
      return
    }
    setImageUploading(true)
    try {
      const response = await uploadService.uploadFile(file, "notifications")
      setImage(response.data.url)
    } catch (error) {
      showError("Upload Failed", getApiErrorMessage(error, "Failed to upload image. Please try again."))
    } finally {
      setImageUploading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (audienceMode === "selected" && selectedUsers.length === 0) {
      newErrors.audience = "Select at least one user"
    }

    if (audienceMode === "profession" && !formData.targetProfession) {
      newErrors.audience = "Select a profession"
    }

    if (!formData.notificationTitle.trim()) {
      newErrors.notificationTitle = "Notification title is required"
    }

    if (!formData.addContent.trim()) {
      newErrors.addContent = "Content is required"
    }

    if (formData.link.trim()) {
      try {
        const url = new URL(formData.link.trim())
        if (!["http:", "https:"].includes(url.protocol)) throw new Error()
      } catch {
        newErrors.link = "Link must be a valid URL starting with http:// or https://"
      }
    }

    if (channels.length === 0) {
      newErrors.channels = "Select at least one notification type"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      const notificationData: CreateNotificationData = {
        type: channels,
        subject: formData.notificationTitle.trim(),
        content: formData.addContent.trim(),
        image: image || "",
        link: formData.link.trim(),
        is_all: audienceMode === "all",
        target_profession: audienceMode === "profession" ? formData.targetProfession : "",
      }
      if (audienceMode === "selected") {
        notificationData.users = selectedUsers.map((user) => user._id)
      }

      if (mode === 'edit' && notificationId) {
        await updateNotificationMutation.mutateAsync({
          id: notificationId,
          notificationData
        })
      } else {
        await createNotificationMutation.mutateAsync(notificationData)
      }

      onSave(notificationData)
    } catch (error) {
      console.error(`Failed to ${mode} notification:`, error)
      showError(
        mode === 'edit' ? "Failed to Update Notification" : "Failed to Create Notification",
        getApiErrorMessage(error, "Something went wrong. Please try again.")
      )
    }
  }

  const handleCancel = () => {
    onBack()
  }

  if (mode === 'edit' && isLoadingNotification) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 pt-[100px] p-8 bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  const audienceOptions: { value: AudienceMode; label: string; hint: string }[] = [
    {
      value: "all",
      label: "All Users",
      hint: summary ? `${summary.total_users} active users` : "Every active app user",
    },
    { value: "selected", label: "Selected Users", hint: "Pick one or more users" },
    { value: "profession", label: "By Profession", hint: "Users with a profession" },
  ]

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />

      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
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
          <span className="text-gray-900">{mode === 'edit' ? 'Edit' : 'Add'} Notification</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 w-full">
          <div className="space-y-8">
            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {audienceOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer ${
                      audienceMode === option.value ? "border-black bg-gray-50" : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="audience-mode"
                      checked={audienceMode === option.value}
                      onChange={() => {
                        setAudienceMode(option.value)
                        clearError("audience")
                      }}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.hint}</p>
                    </div>
                  </label>
                ))}
              </div>

              {audienceMode === "selected" && (
                <NotificationUserPicker
                  selectedUsers={selectedUsers}
                  onChange={(users) => {
                    setSelectedUsers(users)
                    clearError("audience")
                  }}
                  hasError={!!errors.audience}
                />
              )}

              {audienceMode === "profession" && (
                <Select
                  value={formData.targetProfession}
                  onChange={(e) => {
                    handleInputChange("targetProfession", e.target.value)
                    clearError("audience")
                  }}
                  className={`w-full rounded-lg h-12 ${errors.audience ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select profession</option>
                  {professionOptions.map((profession) => (
                    <option key={profession} value={profession}>
                      {profession}
                    </option>
                  ))}
                </Select>
              )}

              {errors.audience && (
                <p className="text-red-500 text-xs mt-1">{errors.audience}</p>
              )}
            </div>

            {/* Notification Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Notification Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter Title"
                value={formData.notificationTitle}
                onChange={(e) => handleInputChange("notificationTitle", e.target.value)}
                className={`w-full rounded-lg h-12 ${errors.notificationTitle ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.notificationTitle && (
                <p className="text-red-500 text-xs mt-1">{errors.notificationTitle}</p>
              )}
            </div>

            {/* Add Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Add Content <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Add Description in less than 500 words"
                value={formData.addContent}
                onChange={(e) => handleInputChange("addContent", e.target.value)}
                className={`w-full border rounded-lg p-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.addContent ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.addContent && (
                <p className="text-red-500 text-xs mt-1">{errors.addContent}</p>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Image</label>
              <p className="text-xs text-gray-500 mb-3">Optional · JPG/PNG · Shown in the phone notification and email</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {imageUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : image ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                    <img src={image} alt="Notification" className="max-w-xs max-h-40 object-contain rounded mb-2" />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-1">Upload image</p>
                    <input
                      type="file"
                      accept={ACCEPTED_IMAGES.join(",")}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                        e.target.value = ""
                      }}
                      className="hidden"
                      id="notification-image-upload"
                    />
                    <label htmlFor="notification-image-upload" className="cursor-pointer text-blue-500 hover:text-blue-600">
                      Choose file
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Link</label>
              <Input
                type="text"
                placeholder="https://example.com"
                value={formData.link}
                onChange={(e) => handleInputChange("link", e.target.value)}
                className={`w-full rounded-lg h-12 ${errors.link ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.link && (
                <p className="text-red-500 text-xs mt-1">{errors.link}</p>
              )}
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Notification Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {CHANNEL_OPTIONS.map(({ value, label, hint, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer flex-1 ${
                      channels.includes(value) ? "border-black bg-gray-50" : errors.channels ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={channels.includes(value)}
                      onChange={() => toggleChannel(value)}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Icon className="w-4 h-4" />
                        {label}
                      </div>
                      <p className="text-xs text-gray-500">{hint}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.channels && (
                <p className="text-red-500 text-xs mt-1">{errors.channels}</p>
              )}
              {channels.includes("email") && audienceMode === "all" && summary && (
                <p className="text-xs text-gray-500 mt-2">{summary.users_with_email} of {summary.total_users} users have an email address.</p>
              )}
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
                disabled={createNotificationMutation.isPending || updateNotificationMutation.isPending || imageUploading}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full min-w-[120px]"
              >
                {createNotificationMutation.isPending || updateNotificationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  mode === 'edit' ? 'Update' : 'Preview'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
