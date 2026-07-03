import { useState, useEffect, forwardRef } from "react"
import { TopBar } from "@/components/custom/top-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToastContainer } from "@/components/ui/toast"
import { ImageCropper } from "@/components/ui/image-cropper"
import { Modal } from "@/components/ui/modal"
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  QrCode,
  Printer,
  Copy,
  Download,
  Loader2,
  Eye
} from "lucide-react"
import { VotersListModal } from "@/components/custom/contentManagment/voters-list-modal"
import {
  useVotings,
  useCreateVoting,
  useUpdateVoting,
  useDeleteVoting,
  useContestants,
  useCreateContestant,
  useUpdateContestant,
  useDeleteContestant,
  useVotingStats
} from "@/hooks/useVoting"
import { useToast } from "@/hooks/useToast"
import { uploadService } from "@/services/uploadService"
import axios from "axios"
import type { Voting, Contestant, CreateVotingData, CreateContestantData } from "@/types/voting"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

// ==========================================
// DATE HELPER UTILS
// ==========================================
const formatLocalDateTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const parseLocalDateTime = (value: string): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid Date"
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  const hoursStr = String(hours).padStart(2, "0")

  return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`
}


const DateInput = forwardRef(({ value, onClick, placeholder }: any, ref: any) => (
  <div className="relative w-full">
    <input
      type="text"
      readOnly
      value={value}
      placeholder={placeholder || "Select date"}
      onClick={onClick}
      ref={ref}
      className="w-full h-12 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm pl-3 pr-10
                 focus:outline-none focus:ring-0 focus:border-gray-900 hover:border-gray-400"
    />
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
    >
      <Calendar className="w-5 h-5 text-gray-400" />
    </button>
  </div>
))
DateInput.displayName = "DateInput"

// ==========================================
// ADD/EDIT VOTING FORM COMPONENT
// ==========================================
interface VotingFormProps {
  onBack: () => void
  onSave: () => void
  editVoting?: Voting | null
}

function AddVotingForm({ onBack, onSave, editVoting }: VotingFormProps) {
  const isEdit = !!editVoting
  const { toasts, removeToast, success, error: showError } = useToast()

  const [formData, setFormData] = useState({
    title_en: editVoting?.title?.en || "",
    title_ml: editVoting?.title?.ml || "",
    description_en: editVoting?.description?.en || "",
    description_ml: editVoting?.description?.ml || "",
    rules_en: editVoting?.rules?.en || "",
    rules_ml: editVoting?.rules?.ml || "",
    start_date: editVoting?.start_date ? formatLocalDateTime(new Date(editVoting.start_date)) : "",
    end_date: editVoting?.end_date ? formatLocalDateTime(new Date(editVoting.end_date)) : "",
    banner: editVoting?.banner || "",
    is_active: editVoting?.is_active ?? true,
    show_leaderboard: editVoting?.show_leaderboard ?? true
  })

  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  const [cropperOpen, setCropperOpen] = useState(false)
  const [cropperFile, setCropperFile] = useState<File | null>(null)

  const createVotingMutation = useCreateVoting()
  const updateVotingMutation = useUpdateVoting()

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setCropperFile(file)
      setCropperOpen(true)
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    setMediaFile(croppedFile)
  }

  const handleSave = async () => {
    if (!formData.title_en || !formData.title_ml || !formData.start_date || !formData.end_date) {
      showError("Validation Error", "Please fill in all required fields")
      return
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      showError("Validation Error", "End date must be after start date")
      return
    }

    if (!isEdit && !mediaFile) {
      showError("Validation Error", "Please upload a banner image")
      return
    }

    setIsSubmitting(true)
    setUploadProgress("Preparing...")

    try {
      let bannerUrl = formData.banner

      if (mediaFile) {
        setUploadProgress("Uploading banner...")
        const uploadResponse = await uploadService.uploadFile(mediaFile, "voting")
        bannerUrl = uploadResponse.data.url
      }

      const votingData: CreateVotingData = {
        title: {
          en: formData.title_en,
          ml: formData.title_ml
        },
        description: {
          en: formData.description_en,
          ml: formData.description_ml
        },
        rules: {
          en: formData.rules_en,
          ml: formData.rules_ml
        },
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        banner: bannerUrl,
        is_active: formData.is_active,
        show_leaderboard: formData.show_leaderboard
      }

      if (isEdit && editVoting) {
        await updateVotingMutation.mutateAsync({
          id: editVoting._id,
          data: votingData
        })
        success("Success", "Voting campaign updated successfully")
      } else {
        await createVotingMutation.mutateAsync(votingData)
        success("Success", "Voting campaign created successfully")
      }

      onSave()
    } catch (err: any) {
      console.error(err)
      showError("Error", err?.response?.data?.message || "Failed to save voting session")
    } finally {
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />

      {cropperFile && (
        <ImageCropper
          isOpen={cropperOpen}
          onClose={() => {
            setCropperOpen(false)
            setCropperFile(null)
          }}
          onCropComplete={handleCropComplete}
          imageFile={cropperFile}
          aspectRatio={16 / 9}
          title="Crop Banner Image"
        />
      )}

      <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
        <div className="flex items-center text-sm text-gray-600 mb-8">
          <button onClick={onBack} className="hover:text-gray-900">
            Voting Management
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{isEdit ? "Edit Voting Session" : "Add Voting Session"}</span>
        </div>

        <div className="bg-white rounded-2xl p-8 w-full">
          <h2 className="text-xl font-semibold mb-6">{isEdit ? "Edit Voting Campaign" : "Create New Voting Campaign"}</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title (English) *</label>
                <Input
                  placeholder="Enter title in English"
                  value={formData.title_en}
                  onChange={(e) => handleInputChange("title_en", e.target.value)}
                  className="w-full h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title (Malayalam) *</label>
                <Input
                  placeholder="Enter title in Malayalam"
                  value={formData.title_ml}
                  onChange={(e) => handleInputChange("title_ml", e.target.value)}
                  className="w-full h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
                <textarea
                  placeholder="Enter description in English"
                  value={formData.description_en}
                  onChange={(e) => handleInputChange("description_en", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Malayalam)</label>
                <textarea
                  placeholder="Enter description in Malayalam"
                  value={formData.description_ml}
                  onChange={(e) => handleInputChange("description_ml", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rules (English)</label>
                <textarea
                  placeholder="Enter rules/terms in English"
                  value={formData.rules_en}
                  onChange={(e) => handleInputChange("rules_en", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rules (Malayalam)</label>
                <textarea
                  placeholder="Enter rules/terms in Malayalam"
                  value={formData.rules_ml}
                  onChange={(e) => handleInputChange("rules_ml", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
                <DatePicker
                  selected={parseLocalDateTime(formData.start_date)}
                  onChange={(date: Date | null) => handleInputChange("start_date", date ? formatLocalDateTime(date) : "")}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  dateFormat="dd/MM/yyyy h:mm aa"
                  timeCaption="Time"
                  placeholderText="Select start date & time"
                  customInput={<DateInput placeholder="Select start date & time" />}
                  wrapperClassName="w-full"
                  showYearDropdown
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
                <DatePicker
                  selected={parseLocalDateTime(formData.end_date)}
                  onChange={(date: Date | null) => handleInputChange("end_date", date ? formatLocalDateTime(date) : "")}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  dateFormat="dd/MM/yyyy h:mm aa"
                  timeCaption="Time"
                  placeholderText="Select end date & time"
                  customInput={<DateInput placeholder="Select end date & time" />}
                  minDate={parseLocalDateTime(formData.start_date) || undefined}
                  wrapperClassName="w-full"
                  showYearDropdown
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image *</label>
              <p className="text-xs text-gray-500 mb-3">Recommended size: 16:9 ratio (e.g. 1920x1080px)</p>
              {mediaFile || formData.banner ? (
                <div className="mb-4">
                  <div className="w-64 h-36 bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={mediaFile ? URL.createObjectURL(mediaFile) : formData.banner}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFile(null)
                      handleInputChange("banner", "")
                    }}
                    className="text-red-500 hover:text-red-600 text-sm mt-2"
                  >
                    Remove banner image
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="banner-upload"
                  className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer max-w-lg transition-colors"
                >
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                    className="hidden"
                    id="banner-upload"
                  />
                  <span className="text-blue-500 hover:text-blue-600 font-medium text-sm">
                    Upload Banner Image
                  </span>
                </label>
              )}
              {uploadProgress && (
                <div className="mt-2 flex items-center text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {uploadProgress}
                </div>
              )}
            </div>

            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange("is_active", e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_leaderboard}
                  onChange={(e) => handleInputChange("show_leaderboard", e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">Show Leaderboard to Users</span>
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="rounded-full px-6">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting} className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
                {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Session"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// ADD/EDIT CONTESTANT FORM COMPONENT
// ==========================================
interface ContestantFormProps {
  votingId: string
  onBack: () => void
  onSave: () => void
  editContestant?: Contestant | null
}

function AddContestantForm({ votingId, onBack, onSave, editContestant }: ContestantFormProps) {
  const isEdit = !!editContestant
  const { toasts, removeToast, success, error: showError } = useToast()

  const [formData, setFormData] = useState({
    name_en: editContestant?.name?.en || "",
    name_ml: editContestant?.name?.ml || "",
    contestant_no: editContestant?.contestant_no || "",
    bio_en: editContestant?.bio?.en || "",
    bio_ml: editContestant?.bio?.ml || "",
    image: editContestant?.image || "",
    is_active: editContestant?.is_active ?? true,
    start_date: editContestant?.start_date ? formatLocalDateTime(new Date(editContestant.start_date)) : "",
    end_date: editContestant?.end_date ? formatLocalDateTime(new Date(editContestant.end_date)) : ""
  })

  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  const [cropperOpen, setCropperOpen] = useState(false)
  const [cropperFile, setCropperFile] = useState<File | null>(null)

  const createContestantMutation = useCreateContestant()
  const updateContestantMutation = useUpdateContestant()

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setCropperFile(file)
      setCropperOpen(true)
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    setMediaFile(croppedFile)
  }

  const handleSave = async () => {
    if (!formData.name_en || !formData.name_ml || !formData.contestant_no) {
      showError("Validation Error", "Please fill in all required fields")
      return
    }

    if (!formData.start_date || !formData.end_date) {
      showError("Validation Error", "Please specify the active time period (start and end date)")
      return
    }

    if (!isEdit && !mediaFile) {
      showError("Validation Error", "Please upload a contestant image")
      return
    }

    setIsSubmitting(true)
    setUploadProgress("Preparing...")

    try {
      let imageUrl = formData.image

      if (mediaFile) {
        setUploadProgress("Uploading contestant image...")
        const uploadResponse = await uploadService.uploadFile(mediaFile, "contestants")
        imageUrl = uploadResponse.data.url
      }

      const contestantData: CreateContestantData = {
        voting_id: votingId,
        name: {
          en: formData.name_en,
          ml: formData.name_ml
        },
        contestant_no: formData.contestant_no,
        bio: {
          en: formData.bio_en,
          ml: formData.bio_ml
        },
        image: imageUrl,
        is_active: formData.is_active,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined
      }

      if (isEdit && editContestant) {
        await updateContestantMutation.mutateAsync({
          id: editContestant._id,
          data: contestantData
        })
        success("Success", "Contestant updated successfully")
      } else {
        await createContestantMutation.mutateAsync(contestantData)
        success("Success", "Contestant created successfully")
      }

      onSave()
    } catch (err: any) {
      console.error(err)
      showError("Error", err?.response?.data?.message || "Failed to save contestant")
    } finally {
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />

      {cropperFile && (
        <ImageCropper
          isOpen={cropperOpen}
          onClose={() => {
            setCropperOpen(false)
            setCropperFile(null)
          }}
          onCropComplete={handleCropComplete}
          imageFile={cropperFile}
          aspectRatio={1}
          title="Crop Contestant Avatar (1:1)"
        />
      )}

      <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
        <div className="flex items-center text-sm text-gray-600 mb-8">
          <button onClick={onBack} className="hover:text-gray-900">
            Contestants List
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{isEdit ? "Edit Contestant" : "Add Contestant"}</span>
        </div>

        <div className="bg-white rounded-2xl p-8 w-full">
          <h2 className="text-xl font-semibold mb-6">{isEdit ? "Edit Contestant" : "Create New Contestant"}</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contestant Name (English) *</label>
                <Input
                  placeholder="Enter name in English"
                  value={formData.name_en}
                  onChange={(e) => handleInputChange("name_en", e.target.value)}
                  className="w-full h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contestant Name (Malayalam) *</label>
                <Input
                  placeholder="Enter name in Malayalam"
                  value={formData.name_ml}
                  onChange={(e) => handleInputChange("name_ml", e.target.value)}
                  className="w-full h-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contestant Number / Code *</label>
              <Input
                placeholder="e.g. 101, 102"
                value={formData.contestant_no}
                onChange={(e) => handleInputChange("contestant_no", e.target.value)}
                className="w-full h-12 max-w-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contestant Bio (English)</label>
                <textarea
                  placeholder="Enter biography in English"
                  value={formData.bio_en}
                  onChange={(e) => handleInputChange("bio_en", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 h-28 resize-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contestant Bio (Malayalam)</label>
                <textarea
                  placeholder="Enter biography in Malayalam"
                  value={formData.bio_ml}
                  onChange={(e) => handleInputChange("bio_ml", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 h-28 resize-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contestant Image *</label>
              <p className="text-xs text-gray-500 mb-3">Square aspect ratio (1:1)</p>
              {mediaFile || formData.image ? (
                <div className="mb-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={mediaFile ? URL.createObjectURL(mediaFile) : formData.image}
                      alt="Contestant Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFile(null)
                      handleInputChange("image", "")
                    }}
                    className="text-red-500 hover:text-red-600 text-sm mt-2"
                  >
                    Remove avatar image
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="avatar-upload"
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer w-48 h-48 flex flex-col justify-center items-center transition-colors"
                >
                  <Plus className="w-8 h-8 text-gray-400 mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <span className="text-blue-500 hover:text-blue-600 font-medium text-sm">
                    Upload Avatar
                  </span>
                </label>
              )}
              {uploadProgress && (
                <div className="mt-2 flex items-center text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {uploadProgress}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contestant Start Date & Time *</label>
                <DatePicker
                  selected={parseLocalDateTime(formData.start_date)}
                  onChange={(date: Date | null) => handleInputChange("start_date", date ? formatLocalDateTime(date) : "")}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  dateFormat="dd/MM/yyyy h:mm aa"
                  timeCaption="Time"
                  placeholderText="Select start date & time"
                  customInput={<DateInput placeholder="Select start date & time" />}
                  wrapperClassName="w-full"
                  showYearDropdown
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contestant End Date & Time *</label>
                <DatePicker
                  selected={parseLocalDateTime(formData.end_date)}
                  onChange={(date: Date | null) => handleInputChange("end_date", date ? formatLocalDateTime(date) : "")}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  dateFormat="dd/MM/yyyy h:mm aa"
                  timeCaption="Time"
                  placeholderText="Select end date & time"
                  customInput={<DateInput placeholder="Select end date & time" />}
                  minDate={parseLocalDateTime(formData.start_date) || undefined}
                  wrapperClassName="w-full"
                  showYearDropdown
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="rounded-full px-6">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting} className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
                {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Contestant"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// MAIN VOTING DASHBOARD COMPONENT
// ==========================================
export function VotingPage() {
  const { toasts, removeToast, success, error: showError } = useToast()

  const [activeTab, setActiveTab] = useState<"sessions" | "contestants" | "statistics">("sessions")
  const [selectedVotingId, setSelectedVotingId] = useState<string>("")

  // Form states
  const [showVotingForm, setShowVotingForm] = useState(false)
  const [showContestantForm, setShowContestantForm] = useState(false)
  const [editingVoting, setEditingVoting] = useState<Voting | null>(null)
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null)

  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrModalContestant, setQrModalContestant] = useState<Contestant | null>(null)

  // Voters List Modal state
  const [votersModalOpen, setVotersModalOpen] = useState(false)
  const [votersModalContestant, setVotersModalContestant] = useState<Contestant | null>(null)

  // Pagination states for Voting Sessions
  const [sessionsPage, setSessionsPage] = useState(1)
  const [sessionsLimit] = useState(10)

  // Search states
  const [sessionSearch, setSessionSearch] = useState("")
  const [contestantSearch, setContestantSearch] = useState("")

  // Fetching data
  const { data: votingsResponse, isLoading: loadingVotings } = useVotings()
  const { data: contestantsResponse, isLoading: loadingContestants } = useContestants(selectedVotingId)
  const { data: statsResponse, isLoading: loadingStats } = useVotingStats(selectedVotingId)

  const deleteVotingMutation = useDeleteVoting()
  const deleteContestantMutation = useDeleteContestant()

  const votingSessions = votingsResponse?.data || []
  const contestants = contestantsResponse?.data || []
  const statistics = statsResponse?.data

  // Sync selectedVotingId with first campaign if empty
  useEffect(() => {
    if (votingSessions.length > 0 && !selectedVotingId) {
      setSelectedVotingId(votingSessions[0]._id)
    }
  }, [votingSessions, selectedVotingId])

  // Filter sessions
  const filteredSessions = votingSessions.filter(v =>
    v.title.en.toLowerCase().includes(sessionSearch.toLowerCase()) ||
    v.title.ml.toLowerCase().includes(sessionSearch.toLowerCase())
  )

  const totalSessionsCount = filteredSessions.length
  const paginatedSessions = filteredSessions.slice(
    (sessionsPage - 1) * sessionsLimit,
    sessionsPage * sessionsLimit
  )

  // Filter contestants
  const filteredContestants = contestants.filter(c =>
    c.name.en.toLowerCase().includes(contestantSearch.toLowerCase()) ||
    c.name.ml.toLowerCase().includes(contestantSearch.toLowerCase()) ||
    c.contestant_no.includes(contestantSearch)
  )

  // Actions for Voting Sessions
  const handleCreateVoting = () => {
    setEditingVoting(null)
    setShowVotingForm(true)
  }

  const handleEditVoting = (voting: Voting) => {
    setEditingVoting(voting)
    setShowVotingForm(true)
  }

  const handleDeleteVoting = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this voting campaign? This will delete all its contestants and votes!")) {
      try {
        await deleteVotingMutation.mutateAsync(id)
        success("Success", "Voting campaign deleted successfully")
        if (selectedVotingId === id) {
          setSelectedVotingId("")
        }
      } catch (err: any) {
        showError("Error", "Failed to delete voting campaign")
      }
    }
  }

  // Actions for Contestants
  const handleCreateContestant = () => {
    if (!selectedVotingId) {
      showError("Error", "Please select or create a voting campaign first")
      return
    }
    setEditingContestant(null)
    setShowContestantForm(true)
  }

  const handleEditContestant = (contestant: Contestant) => {
    setEditingContestant(contestant)
    setShowContestantForm(true)
  }

  const handleDeleteContestant = async (contestant: Contestant) => {
    if (window.confirm(`Are you sure you want to delete contestant ${contestant.name.en}?`)) {
      try {
        await deleteContestantMutation.mutateAsync({ id: contestant._id, votingId: selectedVotingId })
        success("Success", "Contestant deleted successfully")
      } catch (err) {
        showError("Error", "Failed to delete contestant")
      }
    }
  }

  // QR Modal Actions
  const handleOpenQRModal = (contestant: Contestant) => {
    setQrModalContestant(contestant)
    setQrModalOpen(true)
  }

  const handleCopyLink = (deeplink?: string) => {
    if (!deeplink) {
      showError("Error", "No link available to copy")
      return
    }

    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.top = "0"
      textArea.style.left = "0"
      textArea.style.position = "fixed"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          success("Success", "Deep link copied to clipboard")
        } else {
          showError("Error", "Failed to copy link")
        }
      } catch (err) {
        console.error("Fallback copy failed", err)
        showError("Error", "Failed to copy link")
      }
      document.body.removeChild(textArea)
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(deeplink)
        .then(() => {
          success("Success", "Deep link copied to clipboard")
        })
        .catch((err) => {
          console.error("Clipboard write failed, using fallback:", err)
          fallbackCopy(deeplink)
        })
    } else {
      fallbackCopy(deeplink)
    }
  }

  const handleDownloadQR = async (contestant: Contestant) => {
    if (!contestant?.qr_url) {
      showError("Error", "QR code URL not found")
      return
    }

    const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3003"
    let fullUrl = contestant.qr_url
    if (fullUrl.startsWith("/")) {
      fullUrl = `${API_BASE_URL}${fullUrl}`
    }

    const fileName = `${contestant.slug || "contestant"}-qr.png`

    const downloadBlob = (blob: Blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      success("Success", "QR code downloaded to physical storage")
    }

    try {
      const res = await axios.get(fullUrl, { responseType: "blob" })
      if (res.data) {
        downloadBlob(new Blob([res.data]))
        return
      }
    } catch (err) {
      console.warn("Axios fetch failed, trying direct fetch...", err)
    }

    try {
      const res = await fetch(fullUrl)
      if (res.ok) {
        const blob = await res.blob()
        downloadBlob(blob)
        return
      }
    } catch (err) {
      showError("Direct download failed due to CORS or network error: " + err)

      window.open(fullUrl, "_blank")
    }
  }

  const handlePrintQR = (qrUrl: string) => {
    const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3003"
    let fullUrl = qrUrl
    if (fullUrl && fullUrl.startsWith("/")) {
      fullUrl = `${API_BASE_URL}${fullUrl}`
    }
    const win = window.open("")
    if (win) {
      win.document.write(`<div style="display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${fullUrl}" style="max-width:100%;max-height:100%;" onload="window.print();window.close()"/></div>`)
      win.focus()
    } else {
      showError("Error", "Unable to open printing window. Please check popup blockers.")
    }
  }

  if (showVotingForm) {
    return (
      <AddVotingForm
        editVoting={editingVoting}
        onBack={() => setShowVotingForm(false)}
        onSave={() => setShowVotingForm(false)}
      />
    )
  }

  if (showContestantForm) {
    return (
      <AddContestantForm
        votingId={selectedVotingId}
        editContestant={editingContestant}
        onBack={() => setShowContestantForm(false)}
        onSave={() => setShowContestantForm(false)}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />

      {/* QR MODAL */}
      {qrModalContestant && (
        <Modal
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false)
            setQrModalContestant(null)
          }}
          title={`QR Code - ${qrModalContestant.name.en}`}
          className="max-w-md"
        >
          <div className="flex flex-col items-center gap-6 p-4">
            <div className="w-64 h-64 border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2">
              <img src={qrModalContestant.qr_url} alt="QR Code" className="w-full h-full object-contain" />
            </div>
            
            <p className="text-xs text-gray-500 text-center select-all bg-gray-100 p-2 rounded w-full break-all border font-mono">
              {qrModalContestant.deeplink}
            </p>

            <div className="grid grid-cols-3 gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => handleCopyLink(qrModalContestant.deeplink)}
                className="flex flex-col gap-1 items-center justify-center py-4 h-auto border-gray-300 rounded-xl"
              >
                <Copy className="w-5 h-5 text-gray-600" />
                <span className="text-xs font-semibold">Copy Link</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownloadQR(qrModalContestant)}
                className="flex flex-col gap-1 items-center justify-center py-4 h-auto border-gray-300 rounded-xl"
              >
                <Download className="w-5 h-5 text-gray-600" />
                <span className="text-xs font-semibold">Download</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePrintQR(qrModalContestant.qr_url)}
                className="flex flex-col gap-1 items-center justify-center py-4 h-auto border-gray-300 rounded-xl"
              >
                <Printer className="w-5 h-5 text-gray-600" />
                <span className="text-xs font-semibold">Print QR</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* VOTERS LIST MODAL */}
      <VotersListModal
        isOpen={votersModalOpen}
        onClose={() => {
          setVotersModalOpen(false)
          setVotersModalContestant(null)
        }}
        contestant={votersModalContestant}
      />

      {/* Main Content Area */}
      <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span>Content Management</span>
              <span className="mx-2">›</span>
              <span className="text-gray-900 font-medium">Contestant Voting</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeTab === "sessions" && (
              <Button onClick={handleCreateVoting} className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Session
              </Button>
            )}
            {activeTab === "contestants" && selectedVotingId && (
              <Button onClick={handleCreateContestant} className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Contestant
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
              activeTab === "sessions" ? "text-red-500 border-red-500" : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Voting Sessions
          </button>
          <button
            onClick={() => setActiveTab("contestants")}
            className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
              activeTab === "contestants" ? "text-red-500 border-red-500" : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Contestant Management
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
              activeTab === "statistics" ? "text-red-500 border-red-500" : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Leaderboard & Stats
          </button>
        </div>

        {/* Campaign dropdown for Contestants & Stats */}
        {activeTab !== "sessions" && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Select Campaign:</span>
            <select
              value={selectedVotingId}
              onChange={(e) => setSelectedVotingId(e.target.value)}
              className="border border-gray-300 rounded-lg h-10 px-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              {votingSessions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title.en}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* TAB 1: VOTING SESSIONS */}
        {activeTab === "sessions" && (
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-end">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search sessions"
                  value={sessionSearch}
                  onChange={(e) => {
                    setSessionSearch(e.target.value)
                    setSessionsPage(1)
                  }}
                  className="pl-10 rounded-full"
                />
              </div>
            </div>

            {loadingVotings ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Session Title</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Start Date</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">End Date</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Leaderboard Visible</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSessions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-gray-500">
                            No voting sessions found
                          </td>
                        </tr>
                      ) : (
                        paginatedSessions.map((session, index) => (
                          <tr
                            key={session._id}
                            className={`border-b hover:bg-gray-50 ${index % 2 === 1 ? "bg-gray-50/30" : "bg-white"}`}
                          >
                            <td className="py-4 px-6 font-medium text-gray-900 text-sm">{session.title.en}</td>
                            <td className="py-4 px-6 text-sm">
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                  session.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {session.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-600 text-sm">
                              {formatDisplayDate(session.start_date)}
                            </td>
                            <td className="py-4 px-6 text-gray-600 text-sm">
                              {formatDisplayDate(session.end_date)}
                            </td>
                            <td className="py-4 px-6 text-sm">
                              {session.show_leaderboard ? "Yes" : "No"}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditVoting(session)}
                                  className="p-1 h-8 w-8 hover:bg-gray-100 rounded-full"
                                >
                                  <Edit className="w-4 h-4 text-gray-600" />
                                </Button>
                                <DropdownMenu
                                  trigger={
                                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8 hover:bg-gray-100 rounded-full">
                                      <MoreHorizontal className="w-4 h-4 text-gray-600" />
                                    </Button>
                                  }
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedVotingId(session._id)
                                      setActiveTab("contestants")
                                    }}
                                    className="px-4 py-2"
                                  >
                                    Manage Contestants
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedVotingId(session._id)
                                      setActiveTab("statistics")
                                    }}
                                    className="px-4 py-2"
                                  >
                                    View Leaderboard
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteVoting(session._id)}
                                    className="px-4 py-2 text-red-600 hover:text-red-700"
                                  >
                                    Delete Campaign
                                  </DropdownMenuItem>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalSessionsCount > sessionsLimit && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      Showing {((sessionsPage - 1) * sessionsLimit) + 1}-
                      {Math.min(sessionsPage * sessionsLimit, totalSessionsCount)} of {totalSessionsCount}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSessionsPage((prev) => Math.max(1, prev - 1))}
                        disabled={sessionsPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSessionsPage((prev) => prev + 1)}
                        disabled={sessionsPage * sessionsLimit >= totalSessionsCount}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: CONTESTANT MANAGEMENT */}
        {activeTab === "contestants" && (
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-end">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contestants"
                  value={contestantSearch}
                  onChange={(e) => setContestantSearch(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>
            </div>

            {loadingContestants ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Image</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">No.</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Name</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">QR Code</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContestants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-500">
                          No contestants found. Click 'Add Contestant' above to register one.
                        </td>
                      </tr>
                    ) : (
                      filteredContestants.map((c, index) => (
                        <tr
                          key={c._id}
                          className={`border-b hover:bg-gray-50 ${index % 2 === 1 ? "bg-gray-50/30" : "bg-white"}`}
                        >
                          <td className="py-4 px-6">
                            <div className="w-10 h-10 rounded-full overflow-hidden border">
                              <img src={c.image} alt={c.name.en} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-gray-800">#{c.contestant_no}</td>
                          <td className="py-4 px-6 text-sm">
                            <div className="font-semibold text-gray-900">{c.name.en}</div>
                            <div className="text-xs text-gray-500">{c.name.ml}</div>
                          </td>
                          <td className="py-4 px-6 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              c.is_active 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {c.is_active ? "Active" : "Inactive"}
                            </span>
                            {c.start_date && c.end_date && (
                              <div className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                                {formatDisplayDate(c.start_date)} - {formatDisplayDate(c.end_date)}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                onClick={() => handleOpenQRModal(c)}
                                className="border-gray-300 hover:border-gray-400 text-xs px-3 h-8 rounded-full flex items-center gap-1.5"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                View QR
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleDownloadQR(c)}
                                className="border-gray-300 hover:border-gray-400 text-xs p-0 h-8 w-8 rounded-full flex items-center justify-center"
                                title="Download QR"
                              >
                                <Download className="w-3.5 h-3.5 text-gray-600" />
                              </Button>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditContestant(c)}
                                className="p-1 h-8 w-8 hover:bg-gray-100 rounded-full"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteContestant(c)}
                                className="p-1 h-8 w-8 hover:bg-gray-100 rounded-full text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEADERBOARD & STATISTICS */}
        {activeTab === "statistics" && (
          <div className="space-y-6">
            {loadingStats ? (
              <div className="flex items-center justify-center py-12 bg-white rounded-2xl border">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            ) : !statistics ? (
              <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border">
                No statistical data available.
              </div>
            ) : (
              <>
                {/* Stat summary cards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#EDEEFC] rounded-2xl p-6 border border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Total Votes Polled</p>
                      <p className="text-4xl font-bold text-gray-900">{statistics.total_votes.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-[#E6F1FD] rounded-2xl p-6 border border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Total Contestants</p>
                      <p className="text-4xl font-bold text-gray-900">{statistics.total_contestants}</p>
                    </div>
                  </div>
                </div>

                {/* Daily Votes Chart */}
                <div className="bg-white rounded-2xl border p-6">
                  <h3 className="text-md font-semibold text-blue-600 mb-6">Daily Votes Polled</h3>
                  {statistics.daily_votes.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      No votes recorded yet
                    </div>
                  ) : (
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statistics.daily_votes} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={36} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Leaderboard list */}
                <div className="bg-white rounded-2xl border p-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-6">Live Leaderboard & Contestant Rankings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50 text-left">
                          <th className="py-3 px-4 font-semibold text-sm text-gray-600">Rank</th>
                          <th className="py-3 px-4 font-semibold text-sm text-gray-600">Contestant</th>
                          <th className="py-3 px-4 font-semibold text-sm text-gray-600 text-right">Votes</th>
                          <th className="py-3 px-4 font-semibold text-sm text-gray-600 text-right">Percentage</th>
                          <th className="py-3 px-4 font-semibold text-sm text-gray-600 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statistics.rankings.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-6 text-gray-400">
                              No contestants registered
                            </td>
                          </tr>
                        ) : (
                          statistics.rankings.map((c, index) => {
                            const percent = statistics.total_votes > 0 ? ((c.vote_count || 0) / statistics.total_votes) * 100 : 0
                            return (
                              <tr key={c._id} className="border-b hover:bg-gray-50/50">
                                <td className="py-4 px-4">
                                  <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center font-bold text-sm ${
                                    index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-gray-100 text-gray-700" : index === 2 ? "bg-orange-100 text-orange-700" : "text-gray-400"
                                  }`}>
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border">
                                      <img src={c.image} alt={c.name.en} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {c.name.en} <span className="text-xs text-gray-400 ml-1">#{c.contestant_no}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-right font-semibold text-gray-900">
                                  {(c.vote_count || 0).toLocaleString()}
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="text-sm font-medium text-gray-500">{percent.toFixed(1)}%</div>
                                  <div className="w-24 bg-gray-100 rounded-full h-1.5 ml-auto mt-1 overflow-hidden border">
                                    <div className="bg-indigo-600 h-1.5" style={{ width: `${percent}%` }}></div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setVotersModalContestant(c)
                                      setVotersModalOpen(true)
                                    }}
                                    className="rounded-full text-xs font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                    Voters
                                  </Button>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
