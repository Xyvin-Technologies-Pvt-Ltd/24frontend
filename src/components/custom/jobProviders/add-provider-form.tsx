import { useEffect, useState } from "react"
import { Loader2, Plus, Upload } from "lucide-react"
import { TopBar } from "@/components/custom/top-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

interface AddProviderFormProps {
  onBack: () => void
  onSave: (providerData: AddProviderFormData) => Promise<void> | void
  isEdit?: boolean
  initialData?: Partial<AddProviderFormData>
  currentLogoUrl?: string
}

export interface AddProviderFormData {
  providerName: string
  email: string
  mobileNumber: string
  websiteUrl: string
  location: string
  industryType: string
  companySize: string
  companyLogo: File | null
}

const defaultFormData: AddProviderFormData = {
  providerName: "",
  email: "",
  mobileNumber: "",
  websiteUrl: "",
  location: "",
  industryType: "",
  companySize: "",
  companyLogo: null,
}

export function AddProviderForm({
  onBack,
  onSave,
  isEdit = false,
  initialData,
  currentLogoUrl,
}: AddProviderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<AddProviderFormData>({
    ...defaultFormData,
    ...initialData,
  })

  useEffect(() => {
    setFormData({
      ...defaultFormData,
      ...initialData,
    })
  }, [initialData])

  const handleInputChange = (
    field: keyof AddProviderFormData,
    value: string | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmitProvider = async () => {
    try {
      setIsSubmitting(true)
      await onSave(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar />

      <div className="flex-1 overflow-y-auto bg-gray-50 pt-[100px] pr-8 pb-8 pl-0">
        <div className="mb-8 flex items-center text-sm text-gray-600">
          <button onClick={onBack} className="hover:text-gray-900">
            Jobs Providers
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{isEdit ? "Edit Provider" : "Add Provider"}</span>
        </div>

        <div className="rounded-2xl bg-white p-8">
          <h1 className="mb-6 text-[28px] font-medium text-[#161616]">
            {isEdit ? "Edit Provider" : "Add New Provider"}
          </h1>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#303030]">Provider Name</label>
              <Input
                placeholder="Enter Company Name"
                value={formData.providerName}
                onChange={(event) => handleInputChange("providerName", event.target.value)}
                className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm placeholder:text-[#9EAFCC]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#303030]">Email Address</label>
              <Input
                type="email"
                placeholder="Enter mail address"
                value={formData.email}
                onChange={(event) => handleInputChange("email", event.target.value)}
                className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm placeholder:text-[#9EAFCC]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#303030]">Mobile Number</label>
              <Input
                type="tel"
                placeholder="Enter mobile number"
                value={formData.mobileNumber}
                onChange={(event) => handleInputChange("mobileNumber", event.target.value)}
                className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm placeholder:text-[#9EAFCC]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#303030]">Website URL</label>
              <Input
                placeholder="https://example.com"
                value={formData.websiteUrl}
                onChange={(event) => handleInputChange("websiteUrl", event.target.value)}
                className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm placeholder:text-[#9EAFCC]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#303030]">Location</label>
              <Select
                value={formData.location}
                onChange={(event) => handleInputChange("location", event.target.value)}
                className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm text-[#303030]"
              >
                <option value="">Select</option>
                <option value="Kochi, Kerala">Kochi, Kerala</option>
                <option value="Kannur, Kerala">Kannur, Kerala</option>
                <option value="Trichi, Tamilnadu">Trichi, Tamilnadu</option>
                <option value="Chennai, Tamilnadu">Chennai, Tamilnadu</option>
                <option value="Bengaluru, Karnataka">Bengaluru, Karnataka</option>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#303030]">Industry Type</label>
              <Select
                value={formData.industryType}
                onChange={(event) => handleInputChange("industryType", event.target.value)}
                className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm text-[#303030]"
              >
                <option value="">Select</option>
                <option value="retail">Retail</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="hospitality">Hospitality</option>
                <option value="logistics">Logistics</option>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#303030]">Company Size</label>
              <Select
                value={formData.companySize}
                onChange={(event) => handleInputChange("companySize", event.target.value)}
                className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm text-[#303030]"
              >
                <option value="">Select</option>
                <option value="1-10">1 - 10 Employees</option>
                <option value="11-50">11 - 50 Employees</option>
                <option value="51-200">51 - 200 Employees</option>
                <option value="200+">200+ Employees</option>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#303030]">Company Logo</label>
              <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#D9DFEA] bg-white px-6 py-8 text-center transition-colors hover:bg-[#FAFBFD]">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(event) =>
                    handleInputChange("companyLogo", event.target.files?.[0] ?? null)
                  }
                />

                {formData.companyLogo ? (
                  <div className="flex flex-col items-center">
                    <Upload className="mb-2 h-6 w-6 text-[#718EBF]" />
                    <p className="text-sm font-medium text-[#303030]">{formData.companyLogo.name}</p>
                    <p className="mt-1 text-xs text-[#9A9A9A]">Logo selected</p>
                  </div>
                ) : currentLogoUrl ? (
                  <div className="flex flex-col items-center">
                    <Upload className="mb-2 h-6 w-6 text-[#718EBF]" />
                    <p className="text-sm font-medium text-[#303030]">Current logo available</p>
                    <a
                      href={currentLogoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 text-xs text-[#718EBF] underline"
                    >
                      View current logo
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Plus className="mb-3 h-5 w-5 text-[#8C8C8C]" />
                    <p className="text-sm text-[#8C8C8C]">Drag and Drop your file here</p>
                    <p className="mt-1 text-xs text-[#B0B0B0]">PNG, JPG up to 4 mb</p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="h-12 min-w-[120px] rounded-full border-none bg-[#F1F1F1] px-8 text-[#303030] hover:bg-[#E7E7E7]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitProvider}
                disabled={isSubmitting}
                className="h-12 min-w-[140px] rounded-full bg-[#161616] px-8 text-white hover:bg-black"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  isEdit ? "Save Changes" : "Create Provider"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
