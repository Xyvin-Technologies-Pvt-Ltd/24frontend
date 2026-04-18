import { useMemo, useRef, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { TopBar } from "../top-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageCropper } from "@/components/ui/image-cropper"
import { Switch } from "@/components/ui/switch"
import type { FinancialProgrammeCampaignBankDetailsStatus } from "@/types/financial-programme"

type ImageFieldKey = "cover" | "qr"

interface ImageFieldState {
  file: File | null
  existingUrl: string
  error: string
}

export interface MedicalCampaignFormData {
  campaign_name: string
  short_description: string
  description: string
  beneficiary_name: string
  beneficiary_location: string
  account_holder_name: string
  account_number: string
  ifsc_code: string
  branch_name: string
  bank_details_status: FinancialProgrammeCampaignBankDetailsStatus
  campaign_status: "Fund Allocated" | "In Progress" | "Completed"
  amount_raised: string
  file?: File | null
  qrFile?: File | null
  imageUrl?: string
  qrCodeImageUrl?: string
}

interface AddMedicalCampaignViewProps {
  programmeName?: string
  onBack: () => void
  isSaving?: boolean
  title?: string
  saveLabel?: string
  initialData?: Omit<MedicalCampaignFormData, "file" | "qrFile"> & {
    imageUrl?: string
    qrCodeImageUrl?: string
  }
  onSave?: (data: MedicalCampaignFormData) => Promise<void> | void
}

const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"]

const IMAGE_FIELD_COPY: Record<
  ImageFieldKey,
  {
    label: string
    cropTitle: string
    recommendation: string
    aspectRatio?: number
    alt: string
    uploadLabel: string
    changeLabel: string
  }
> = {
  cover: {
    label: "Campaign Image",
    cropTitle: "Crop Campaign Image",
    recommendation: "Image (JPG/PNG) - Recommended size: 1920x1080px (16:9)",
    aspectRatio: 16 / 9,
    alt: "Campaign preview",
    uploadLabel: "Upload campaign image",
    changeLabel: "Change campaign image",
  },
  qr: {
    label: "QR Code Image",
    cropTitle: "Crop QR Code Image",
    recommendation: "Image (JPG/PNG) - Use a clear square QR code for payments",
    aspectRatio: 1,
    alt: "QR code preview",
    uploadLabel: "Upload QR code image",
    changeLabel: "Change QR code image",
  },
}

export function AddMedicalCampaignView({
  programmeName = "Medical Programme",
  onBack,
  isSaving = false,
  title = "Add Campaign",
  saveLabel = "Save",
  initialData,
  onSave,
}: AddMedicalCampaignViewProps) {
  const fileInputRefs = useRef<Record<ImageFieldKey, HTMLInputElement | null>>({
    cover: null,
    qr: null,
  })
  const [formData, setFormData] = useState({
    campaign_name: initialData?.campaign_name ?? "",
    short_description: initialData?.short_description ?? "",
    description: initialData?.description ?? "",
    beneficiary_name: initialData?.beneficiary_name ?? "",
    beneficiary_location: initialData?.beneficiary_location ?? "",
    account_holder_name: initialData?.account_holder_name ?? "",
    account_number: initialData?.account_number ?? "",
    ifsc_code: initialData?.ifsc_code ?? "",
    branch_name: initialData?.branch_name ?? "",
    bank_details_status: initialData?.bank_details_status ?? "active",
    campaign_status:
      initialData?.campaign_status ??
      ("Fund Allocated" as MedicalCampaignFormData["campaign_status"]),
    amount_raised: initialData?.amount_raised ?? "",
  })
  const [imageFields, setImageFields] = useState<Record<ImageFieldKey, ImageFieldState>>({
    cover: {
      file: null,
      existingUrl: initialData?.imageUrl ?? "",
      error: "",
    },
    qr: {
      file: null,
      existingUrl: initialData?.qrCodeImageUrl ?? "",
      error: "",
    },
  })
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean
    imageFile: File | null
    target: ImageFieldKey
  }>({
    isOpen: false,
    imageFile: null,
    target: "cover",
  })

  const previewUrls = {
    cover: useMemo(() => {
      if (imageFields.cover.file) {
        return URL.createObjectURL(imageFields.cover.file)
      }

      return imageFields.cover.existingUrl
    }, [imageFields.cover.existingUrl, imageFields.cover.file]),
    qr: useMemo(() => {
      if (imageFields.qr.file) {
        return URL.createObjectURL(imageFields.qr.file)
      }

      return imageFields.qr.existingUrl
    }, [imageFields.qr.existingUrl, imageFields.qr.file]),
  }

  const hasCoverImage = Boolean(imageFields.cover.file || imageFields.cover.existingUrl)

  const canSubmit =
    Boolean(formData.campaign_name.trim()) &&
    Boolean(formData.short_description.trim()) &&
    Boolean(formData.description.trim()) &&
    Boolean(formData.beneficiary_name.trim()) &&
    Boolean(formData.beneficiary_location.trim()) &&
    Boolean(formData.account_holder_name.trim()) &&
    Boolean(formData.account_number.trim()) &&
    Boolean(formData.ifsc_code.trim()) &&
    Boolean(formData.branch_name.trim()) &&
    Boolean(formData.amount_raised.trim()) &&
    hasCoverImage &&
    !isSaving

  const handleImageSelect = (target: ImageFieldKey, file?: File | null) => {
    if (!file) {
      return
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageFields((prev) => ({
        ...prev,
        [target]: {
          ...prev[target],
          error: "Only JPG and PNG images are allowed.",
        },
      }))
      return
    }

    if (file.size > IMAGE_MAX_SIZE_BYTES) {
      setImageFields((prev) => ({
        ...prev,
        [target]: {
          ...prev[target],
          error: "Image size must be 5 MB or less.",
        },
      }))
      return
    }

    setImageFields((prev) => ({
      ...prev,
      [target]: {
        ...prev[target],
        error: "",
      },
    }))
    setCropperState({
      isOpen: true,
      imageFile: file,
      target,
    })
  }

  const handleRemoveImage = (target: ImageFieldKey) => {
    setImageFields((prev) => ({
      ...prev,
      [target]: {
        ...prev[target],
        file: null,
        existingUrl: "",
        error: "",
      },
    }))
  }

  const handleSave = async () => {
    if (!canSubmit) {
      return
    }

    await onSave?.({
      ...formData,
      campaign_name: formData.campaign_name.trim(),
      short_description: formData.short_description.trim(),
      description: formData.description.trim(),
      beneficiary_name: formData.beneficiary_name.trim(),
      beneficiary_location: formData.beneficiary_location.trim(),
      account_holder_name: formData.account_holder_name.trim(),
      account_number: formData.account_number.trim(),
      ifsc_code: formData.ifsc_code.trim().toUpperCase(),
      branch_name: formData.branch_name.trim(),
      amount_raised: formData.amount_raised.trim(),
      file: imageFields.cover.file,
      qrFile: imageFields.qr.file,
      imageUrl: imageFields.cover.existingUrl,
      qrCodeImageUrl: imageFields.qr.existingUrl,
    })
  }

  const renderImageUploadField = (target: ImageFieldKey, required = false) => {
    const config = IMAGE_FIELD_COPY[target]
    const fieldState = imageFields[target]
    const previewUrl = previewUrls[target]

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">
          {config.label} {required && <span className="text-red-500">*</span>}
        </label>
        <p className="text-xs text-gray-500">{config.recommendation}</p>
        <button
          type="button"
          onClick={() => fileInputRefs.current[target]?.click()}
          className="flex h-32 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8DEE8] bg-white text-center transition-colors hover:bg-gray-50"
        >
          <Plus className="mb-3 h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-400">
            {fieldState.file
              ? fieldState.file.name
              : previewUrl
              ? config.changeLabel
              : config.uploadLabel}
          </span>
        </button>
        <input
          ref={(node) => {
            fileInputRefs.current[target] = node
          }}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png"
          onChange={(e) => {
            handleImageSelect(target, e.target.files?.[0] || null)
            e.target.value = ""
          }}
        />
        {previewUrl && (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#D9E4F2] p-4">
            <img
              src={previewUrl}
              alt={config.alt}
              className={`rounded-xl border border-gray-100 object-cover ${
                target === "qr" ? "h-40 w-40" : "h-28 w-auto"
              }`}
            />
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                {fieldState.file?.name ||
                  (target === "qr" ? "Uploaded QR code image" : "Uploaded image")}
              </p>
              <button
                type="button"
                onClick={() => handleRemoveImage(target)}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        {fieldState.error && <p className="text-sm text-red-500">{fieldState.error}</p>}
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar />

      {cropperState.imageFile && (
        <ImageCropper
          isOpen={cropperState.isOpen}
          onClose={() =>
            setCropperState((prev) => ({ ...prev, isOpen: false, imageFile: null }))
          }
          onCropComplete={(croppedFile) => {
            setImageFields((prev) => ({
              ...prev,
              [cropperState.target]: {
                ...prev[cropperState.target],
                file: croppedFile,
                error: "",
              },
            }))
          }}
          imageFile={cropperState.imageFile}
          aspectRatio={IMAGE_FIELD_COPY[cropperState.target].aspectRatio}
          title={IMAGE_FIELD_COPY[cropperState.target].cropTitle}
        />
      )}

      <div className="flex-1 overflow-y-auto bg-gray-50 p-8 pt-[100px]">
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <button type="button" onClick={onBack} className="hover:text-gray-900">
            Financial Programmes
          </button>
          <span className="mx-2">{">"}</span>
          <button type="button" onClick={onBack} className="hover:text-gray-900">
            {programmeName}
          </button>
          <span className="mx-2">{">"}</span>
          <button type="button" onClick={onBack} className="hover:text-gray-900">
            Campaigns
          </button>
          <span className="mx-2">{">"}</span>
          <span className="font-medium text-gray-900">{title}</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.campaign_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, campaign_name: e.target.value }))
                }
                placeholder="Enter campaign name"
                className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    short_description: e.target.value,
                  }))
                }
                placeholder="Enter description"
                className="min-h-24 w-full rounded-2xl border border-[#D9E4F2] px-4 py-3 text-sm text-[#6B89B3] outline-none placeholder:text-[#88A3C6]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter description"
                className="min-h-28 w-full rounded-2xl border border-[#D9E4F2] px-4 py-3 text-sm text-[#6B89B3] outline-none placeholder:text-[#88A3C6]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Beneficiary Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.beneficiary_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      beneficiary_name: e.target.value,
                    }))
                  }
                  placeholder="Enter beneficiary name"
                  className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Beneficiary Location <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.beneficiary_location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      beneficiary_location: e.target.value,
                    }))
                  }
                  placeholder="Enter beneficiary location"
                  className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
                />
              </div>
            </div>

            {renderImageUploadField("cover", true)}

            <div className="space-y-4 rounded-2xl border border-gray-200 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Beneficiary Bank Account Details
                  </h3>
                  <p className="text-sm text-gray-500">
                    Toggle this section inactive to hide bank details and QR code in
                    the campaign view.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-full bg-gray-100 px-4 py-2">
                  <span className="text-sm font-medium text-gray-600">Active</span>
                  <Switch
                    checked={formData.bank_details_status === "inactive"}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        bank_details_status: checked ? "inactive" : "active",
                      }))
                    }
                    aria-label="Hide bank details"
                  />
                  <span
                    className={`text-sm font-medium ${
                      formData.bank_details_status === "inactive"
                        ? "text-red-500"
                        : "text-gray-600"
                    }`}
                  >
                    Inactive
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.account_holder_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        account_holder_name: e.target.value,
                      }))
                    }
                    placeholder="Enter account holder name"
                    className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.account_number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        account_number: e.target.value,
                      }))
                    }
                    placeholder="Enter account number"
                    className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    IFSC <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.ifsc_code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ifsc_code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Enter IFSC code"
                    className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.branch_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        branch_name: e.target.value,
                      }))
                    }
                    placeholder="Enter branch name"
                    className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
                  />
                </div>
              </div>

              {renderImageUploadField("qr")}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Campaign Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.campaign_status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      campaign_status:
                        e.target.value as MedicalCampaignFormData["campaign_status"],
                    }))
                  }
                  className="h-11 w-full rounded-2xl border border-[#D9E4F2] bg-white px-4 text-sm text-[#6B89B3] outline-none"
                >
                  <option value="Fund Allocated">Fund Allocated</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Enter Amount Raised <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.amount_raised}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount_raised: e.target.value }))
                  }
                  placeholder="Amount raised"
                  className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 p-6">
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
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                saveLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
