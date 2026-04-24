import { useRef, useState } from "react"
import { ImagePlus, Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageCropper } from "@/components/ui/image-cropper"
import { useUpload } from "@/hooks/useUpload"
import type { FinancialProgrammeFormData } from "@/types/financial-programme"
import { TopBar } from "../top-bar"

interface AddProgrammeViewProps {
  onBack: () => void
  initialData?: FinancialProgrammeFormData
  title?: string
  saveLabel?: string
  onSave?: (data: FinancialProgrammeFormData) => Promise<void> | void
}

export function AddProgrammeView({
  onBack,
  initialData,
  title = "Add Programmes",
  saveLabel = "Save",
  onSave,
}: AddProgrammeViewProps) {
  const BANNER_MAX_SIZE_BYTES = 5 * 1024 * 1024
  const ALLOWED_BANNER_TYPES = ["image/jpeg", "image/png"]
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { uploadFile, uploadState, resetUploadState } = useUpload()
  const [formData, setFormData] = useState<FinancialProgrammeFormData>({
    programme: initialData?.programme ?? "",
    type: initialData?.type ?? "medical",
    goal: initialData?.goal ?? "",
    progress: initialData?.progress ?? 0,
    tag: initialData?.tag ?? "",
    subtitle: initialData?.subtitle ?? "",
    banner: initialData?.banner ?? "",
    description: initialData?.description ?? "",
    status: initialData?.status ?? "active",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [bannerError, setBannerError] = useState("")
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean
    imageFile: File | null
  }>({
    isOpen: false,
    imageFile: null,
  })
  const isHousingProgramme = formData.type === "housing"

  const handleSave = async () => {
    const trimmedTag = formData.tag?.trim() ?? ""
    const trimmedGoal = formData.goal.trim()

    if (
      !formData.programme.trim() ||
      (isHousingProgramme && !trimmedGoal) ||
      !formData.banner ||
      !isTagValid(trimmedTag)
    ) {
      return
    }

    try {
      setIsSaving(true)
      await onSave?.({
        ...formData,
        programme: formData.programme.trim(),
        goal: trimmedGoal,
        tag: trimmedTag,
        subtitle: formData.subtitle?.trim() ?? "",
        description: formData.description?.trim() ?? "",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const isProgrammeValid = Boolean(formData.programme.trim())
  const isGoalValid = !isHousingProgramme || Boolean(formData.goal.trim())
  const isBannerValid = Boolean(formData.banner)
  const trimmedTag = formData.tag?.trim() ?? ""
  const isTagValid = (value: string) =>
    value.length === 0 || /^[A-Za-z]+(?:\s+[A-Za-z]+){0,2}$/.test(value)
  const showTagError = trimmedTag.length > 0 && !isTagValid(trimmedTag)
  const canSubmit =
    isProgrammeValid &&
    isGoalValid &&
    isBannerValid &&
    !showTagError &&
    !isSaving &&
    !uploadState.isUploading

  const handleBannerUpload = async (file?: File | null) => {
    if (!file) {
      return
    }

    if (!ALLOWED_BANNER_TYPES.includes(file.type)) {
      setBannerError("Only JPG and PNG images are allowed.")
      return
    }

    if (file.size > BANNER_MAX_SIZE_BYTES) {
      setBannerError("Image size must be 5 MB or less.")
      return
    }

    setBannerError("")
    setCropperState({
      isOpen: true,
      imageFile: file,
    })
  }

  const handleCroppedBannerUpload = async (croppedFile: File) => {
    try {
      const uploadResult = await uploadFile(croppedFile, "financial-programmes")
      setFormData((prev) => ({ ...prev, banner: uploadResult.data.url }))
    } catch {
      // Upload hook manages the visible error state.
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      {cropperState.imageFile && (
        <ImageCropper
          isOpen={cropperState.isOpen}
          onClose={() => setCropperState({ isOpen: false, imageFile: null })}
          onCropComplete={handleCroppedBannerUpload}
          imageFile={cropperState.imageFile}
          aspectRatio={16 / 9}
          title="Crop Banner Image"
        />
      )}

      <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-gray-900"
          >
            Financial Programmes
          </button>
          <span className="mx-2">{">"}</span>
          <span className="font-medium text-gray-900">{title}</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="grid gap-4 border-b border-gray-100 p-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Programme <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.programme}
                onChange={(e) => setFormData((prev) => ({ ...prev, programme: e.target.value }))}
                placeholder="Enter programme"
                className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as FinancialProgrammeFormData["type"],
                  }))
                }
                className="h-11 w-full rounded-2xl border border-[#D9E4F2] px-3 text-[#6B89B3] focus:outline-none"
              >
                <option value="medical">Medical</option>
                <option value="housing">Housing</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Goal
                {isHousingProgramme ? (
                  <span className="text-red-500"> *</span>
                ) : null}
              </label>
              <Input
                value={formData.goal}
                onChange={(e) => setFormData((prev) => ({ ...prev, goal: e.target.value }))}
                placeholder={
                  isHousingProgramme ? "Enter goal" : "Enter goal (optional)"
                }
                className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Tag</label>
              <Input
                value={formData.tag}
                onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                placeholder="Enter tag"
                className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
              />
              {showTagError && (
                <p className="text-sm text-red-500">
                  Tag can contain letters only and a maximum of three words.
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-900">Subtitle</label>
              <Input
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="Enter subtitle"
                className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-900">
                Banner <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">
                Image (JPG/PNG) - Recommended size: 1920x1080px (16:9), max 5 MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  void handleBannerUpload(e.target.files?.[0] ?? null)
                  e.target.value = ""
                }}
              />

              {formData.banner ? (
                <div className="overflow-hidden rounded-2xl border border-[#D9E4F2]">
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={formData.banner}
                      alt="Programme banner preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, banner: "" }))
                        resetUploadState()
                      }}
                      className="absolute right-3 top-3 h-8 w-8 rounded-full p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4">
                    <p className="text-sm text-gray-600 break-all">{formData.banner}</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Banner
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#D9E4F2] bg-[#F8FBFF] px-4 py-8 text-center"
                >
                  {uploadState.isUploading ? (
                    <>
                      <Loader2 className="mb-3 h-6 w-6 animate-spin text-[#6B89B3]" />
                      <p className="text-sm font-medium text-[#426A9B]">
                        Uploading banner...
                      </p>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="mb-3 h-6 w-6 text-[#6B89B3]" />
                      <p className="text-sm font-medium text-[#426A9B]">
                        Upload programme banner
                      </p>
                      <p className="mt-1 text-xs text-[#6B89B3]">
                        JPG or PNG up to 5 MB
                      </p>
                    </>
                  )}
                </button>
              )}

              {bannerError && (
                <p className="text-sm text-red-500">{bannerError}</p>
              )}
              {uploadState.error && (
                <p className="text-sm text-red-500">{uploadState.error}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-900">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter description"
                rows={5}
                className="w-full rounded-2xl border border-[#D9E4F2] px-4 py-3 text-[#6B89B3] placeholder:text-[#88A3C6] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              className="h-11 min-w-40 rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!canSubmit}
              className="h-11 min-w-40 rounded-full bg-black text-white hover:bg-gray-800"
            >
              {isSaving ? "Saving..." : saveLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
