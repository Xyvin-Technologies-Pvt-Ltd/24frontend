import { useState, useRef, useEffect } from "react"
import { X, Upload, Loader2, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MultilingualInput } from "@/components/ui/multilingual-input"
import { useUpload } from "@/hooks/useUpload"
import type {
  Association,
  AssociationFormData,
  AssociationStatus,
  MultilingualField,
} from "@/types/association"

interface AddAssociationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AssociationFormData) => Promise<void>
  initialData?: Association | null
  isEditing?: boolean
}

const CATEGORIES = [
  "Residents' Association",
  "Arts & Culture",
  "Environment & Sustainability",
  "Pravasi Association",
  "Charitable Trust",
  "Alumni",
  "Professional",
  "Youth & Sports",
  "Cultural",
  "Literature & Discussion",
  "Other",
]

export function AddAssociationModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: AddAssociationModalProps) {
  const { uploadFile, uploadState } = useUpload()
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const bannerInputRef = useRef<HTMLInputElement | null>(null)
  const certInputRef = useRef<HTMLInputElement | null>(null)

  const [formData, setFormData] = useState<AssociationFormData>({
    name: { en: "", ml: "" },
    category: "Residents' Association",
    about: { en: "", ml: "" },
    location: "",
    district_name: "",
    ward: "",
    established_year: null,
    registration_number: "",
    certificate_url: "",
    banner_image: "",
    logo_image: "",
    monogram: "",
    gradient_start: "#34C0CB",
    gradient_end: "#1A78A3",
    badge_color: "#1A78A3",
    contact_person: {
      name: "",
      phone: "",
      email: "",
      role: "Secretary",
    },
    social_links: [""],
    is_verified: true,
    status: "active" as AssociationStatus,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: {
          en: initialData.name?.en || "",
          ml: initialData.name?.ml || "",
        },
        category: initialData.category || "Residents' Association",
        about: {
          en: initialData.about?.en || "",
          ml: initialData.about?.ml || "",
        },
        location: initialData.location || "",
        district_name: initialData.district_name || "",
        ward: initialData.ward || "",
        established_year: initialData.established_year ?? null,
        registration_number: initialData.registration_number || "",
        certificate_url: initialData.certificate_url || "",
        banner_image: initialData.banner_image || "",
        logo_image: initialData.logo_image || "",
        monogram: initialData.monogram || "",
        gradient_start: initialData.gradient_start || "#34C0CB",
        gradient_end: initialData.gradient_end || "#1A78A3",
        badge_color: initialData.badge_color || "#1A78A3",
        contact_person: {
          name: initialData.contact_person?.name || "",
          phone: initialData.contact_person?.phone || "",
          email: initialData.contact_person?.email || "",
          role: initialData.contact_person?.role || "Secretary",
        },
        social_links: initialData.social_links?.length
          ? initialData.social_links
          : [""],
        is_verified: initialData.is_verified ?? true,
        status: initialData.status || "active",
      })
    } else {
      setFormData({
        name: { en: "", ml: "" },
        category: "Residents' Association",
        about: { en: "", ml: "" },
        location: "",
        district_name: "",
        ward: "",
        established_year: null,
        registration_number: "",
        certificate_url: "",
        banner_image: "",
        logo_image: "",
        monogram: "",
        gradient_start: "#34C0CB",
        gradient_end: "#1A78A3",
        badge_color: "#1A78A3",
        contact_person: {
          name: "",
          phone: "",
          email: "",
          role: "Secretary",
        },
        social_links: [""],
        is_verified: true,
        status: "active" as AssociationStatus,
      })
    }
    setErrorMsg("")
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadFile(file, "associations/logos")
      if (res?.data?.url) {
        setFormData((prev) => ({ ...prev, logo_image: res.data.url }))
      }
    } catch (err: any) {
      setErrorMsg("Failed to upload association logo")
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadFile(file, "associations")
      if (res?.data?.url) {
        setFormData((prev) => ({ ...prev, banner_image: res.data.url }))
      }
    } catch (err: any) {
      setErrorMsg("Failed to upload cover banner")
    }
  }

  const handleCertificateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadFile(file, "associations/certificates")
      if (res?.data?.url) {
        setFormData((prev) => ({ ...prev, certificate_url: res.data.url }))
      }
    } catch (err: any) {
      setErrorMsg("Failed to upload certificate document")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.en.trim()) {
      setErrorMsg("Association name in English is required")
      return
    }

    try {
      setIsSaving(true)
      setErrorMsg("")
      await onSave(formData)
      onClose()
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || "Failed to save association"
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "Edit Association" : "Add New Association"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter association details in English and Malayalam
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* 1. Multilingual Name */}
          <MultilingualInput
            label="Association Name"
            required
            value={formData.name}
            onChange={(name: MultilingualField) =>
              setFormData((prev) => ({ ...prev, name }))
            }
            placeholder={{
              en: "e.g. Kochi Residents Welfare Forum",
              ml: "e.g. കൊച്ചി റെസിഡൻ്റ്സ് വെൽഫെയർ ഫോറം",
            }}
          />

          {/* 2. Category & Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as AssociationStatus,
                  }))
                }
                className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-900"
              >
                <option value="active">Active (Approved)</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* 3. Location, District & Ward */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location / Area
              </label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="e.g. Kadavanthra"
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District / City
              </label>
              <Input
                value={formData.district_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    district_name: e.target.value,
                  }))
                }
                placeholder="e.g. Ernakulam / Kochi"
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ward
              </label>
              <Input
                value={formData.ward}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ward: e.target.value }))
                }
                placeholder="e.g. Ward 54"
                className="h-11"
              />
            </div>
          </div>

          {/* 4. Established Year & Registration Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Established Year
              </label>
              <Input
                type="number"
                value={formData.established_year ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    established_year: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                placeholder="e.g. 2009"
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <Input
                value={formData.registration_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    registration_number: e.target.value,
                  }))
                }
                placeholder="e.g. EKM/TC/2009/48"
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monogram Tag
              </label>
              <Input
                value={formData.monogram}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    monogram: e.target.value.toUpperCase().slice(0, 3),
                  }))
                }
                placeholder="e.g. KR"
                maxLength={3}
                className="h-11 uppercase"
              />
            </div>
          </div>

          {/* 5. Multilingual About */}
          <MultilingualInput
            label="About / Description"
            type="textarea"
            value={formData.about || { en: "", ml: "" }}
            onChange={(about: MultilingualField) =>
              setFormData((prev) => ({ ...prev, about }))
            }
            placeholder={{
              en: "Describe the association's mission, colonies covered, and community activities...",
              ml: "അസോസിയേഷൻ്റെ ലക്ഷ്യങ്ങളും കമ്മ്യൂണിറ്റി പ്രവർത്തനങ്ങളും വിവരിക്കുക...",
            }}
          />

          {/* 6. Document / Certificate Upload */}
          <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/60">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Government Registration Certificate
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Upload PDF or image proof of official association registration
            </p>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={certInputRef}
                onChange={handleCertificateUpload}
                accept=".pdf,image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => certInputRef.current?.click()}
                disabled={uploadState.isUploading}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {formData.certificate_url ? "Replace File" : "Choose Certificate"}
              </Button>
              {formData.certificate_url && (
                <a
                  href={formData.certificate_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate max-w-xs"
                >
                  View uploaded certificate
                </a>
              )}
            </div>
          </div>

          {/* 7. Media Uploads: Logo & Cover Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logo */}
            <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/60">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Association Logo (Square / Circular)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Displayed as circular emblem on home, cards & profile
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadState.isUploading}
                  className="gap-2"
                >
                  <ImagePlus className="w-4 h-4" />
                  {formData.logo_image ? "Change Logo" : "Upload Logo"}
                </Button>
                {formData.logo_image && (
                  <div className="relative group">
                    <img
                      src={formData.logo_image}
                      alt="Logo preview"
                      className="w-11 h-11 object-cover rounded-full border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, logo_image: "" }))
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition-colors"
                      title="Remove logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Banner */}
            <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/60">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Banner Image
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Header cover banner for detail and card backgrounds
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={handleBannerUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadState.isUploading}
                  className="gap-2"
                >
                  <ImagePlus className="w-4 h-4" />
                  {formData.banner_image ? "Change Banner" : "Upload Banner"}
                </Button>
                {formData.banner_image && (
                  <div className="relative group">
                    <img
                      src={formData.banner_image}
                      alt="Banner preview"
                      className="w-16 h-10 object-cover rounded border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, banner_image: "" }))
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition-colors"
                      title="Remove banner"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 8. Contact Person */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Primary Office Bearer / Coordinator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Full Name
                </label>
                <Input
                  value={formData.contact_person?.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contact_person: {
                        ...(prev.contact_person || {
                          name: "",
                          phone: "",
                          email: "",
                          role: "",
                        }),
                        name: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. Emmanuel"
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Phone Number
                </label>
                <Input
                  value={formData.contact_person?.phone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contact_person: {
                        ...(prev.contact_person || {
                          name: "",
                          phone: "",
                          email: "",
                          role: "",
                        }),
                        phone: e.target.value,
                      },
                    }))
                  }
                  placeholder="+91 98765 43210"
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Designation / Role
                </label>
                <Input
                  value={formData.contact_person?.role || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contact_person: {
                        ...(prev.contact_person || {
                          name: "",
                          phone: "",
                          email: "",
                          role: "",
                        }),
                        role: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. Secretary / President"
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* 9. Verified Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_verified"
              checked={formData.is_verified}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_verified: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="is_verified" className="text-sm font-medium text-gray-700">
              Verified Association (Show verified badge on profile)
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving || uploadState.isUploading}
            className="bg-gray-900 hover:bg-black text-white gap-2 min-w-[120px]"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Association"}
          </Button>
        </div>
      </div>
    </div>
  )
}
