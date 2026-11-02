import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MultilingualInput } from "@/components/ui/multilingual-input"
import { TopBar } from "@/components/custom/top-bar"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import { getApiErrorMessage } from "@/lib/utils"
import { uploadService } from "@/services/uploadService"
import {
  useCertificateDefaults,
  useCertificatePreview,
  useCreateInitiative,
  useUpdateInitiative,
} from "@/hooks/useInitiatives"
import type {
  CertificateLayout,
  CertificateTextElement,
  Initiative,
  InitiativeFormData,
} from "@/types/initiative"
import { CheckCircle, Eye, Loader2, RotateCcw, Upload, X } from "lucide-react"

interface InitiativeFormProps {
  initiative?: Initiative
  onBack: () => void
  onSave: (message: string) => void
}

const TEXT_ELEMENTS: { key: CertificateTextElement; label: string }[] = [
  { key: "name", label: "Participant Name" },
  { key: "campaign_name", label: "Campaign Name" },
  { key: "join_date", label: "Date of Joining" },
  { key: "certificate_id", label: "Certificate ID" },
]

const ACCEPTED_IMAGES = "image/jpeg,image/jpg,image/png"

// Errors from blob requests (certificate preview) arrive as a Blob; read the JSON message out of it
const readBlobError = async (error: unknown, fallback: string) => {
  const data = (error as { response?: { data?: unknown } })?.response?.data
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text())
      return getApiErrorMessage({ response: { data: parsed } }, fallback)
    } catch {
      return fallback
    }
  }
  return getApiErrorMessage(error, fallback)
}

const mergeLayout = (defaults: CertificateLayout, stored?: Partial<CertificateLayout>): CertificateLayout => {
  const layout = { ...defaults }
  ;(Object.keys(defaults) as (keyof CertificateLayout)[]).forEach((key) => {
    const overrides = Object.fromEntries(
      Object.entries(stored?.[key] || {}).filter(([, value]) => value !== undefined && value !== null)
    )
    layout[key] = { ...defaults[key], ...overrides } as never
  })
  return layout
}

export function InitiativeForm({ initiative, onBack, onSave }: InitiativeFormProps) {
  const isEdit = !!initiative
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast()
  const { data: defaultsResponse, isLoading: defaultsLoading } = useCertificateDefaults()
  const createMutation = useCreateInitiative()
  const updateMutation = useUpdateInitiative()
  const previewMutation = useCertificatePreview()

  const [formData, setFormData] = useState<InitiativeFormData>({
    title: initiative?.title || { en: "", ml: "" },
    description: initiative?.description || { en: "", ml: "" },
    pledge_text: {
      en: initiative?.pledge_text?.en || "",
      ml: initiative?.pledge_text?.ml || "",
    },
    banner_image: initiative?.banner_image || "",
    status: initiative?.status === "active" ? "active" : "inactive",
    certificate: {
      template_image: initiative?.certificate?.template_image || "",
      id_prefix: initiative?.certificate?.id_prefix || "",
      layout: {} as CertificateLayout,
    },
  })
  const [layoutReady, setLayoutReady] = useState(false)
  const [uploading, setUploading] = useState<{ banner: boolean; template: boolean }>({ banner: false, template: false })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sampleName, setSampleName] = useState("Participant Name")
  const [activeElement, setActiveElement] = useState<"photo" | CertificateTextElement>("photo")

  const defaultLayout = defaultsResponse?.data?.layout

  // Start from the built-in layout, overlaid with what's saved on this campaign
  useEffect(() => {
    if (defaultLayout && !layoutReady) {
      setFormData((prev) => ({
        ...prev,
        certificate: { ...prev.certificate, layout: mergeLayout(defaultLayout, initiative?.certificate?.layout) },
      }))
      setLayoutReady(true)
    }
  }, [defaultLayout, initiative, layoutReady])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleInputChange = <K extends keyof InitiativeFormData>(field: K, value: InitiativeFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateLayout = (element: keyof CertificateLayout, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      certificate: {
        ...prev.certificate,
        layout: {
          ...prev.certificate.layout,
          [element]: { ...prev.certificate.layout[element], [field]: value },
        },
      },
    }))
  }

  const handleImageUpload = async (kind: "banner" | "template", file: File) => {
    if (!ACCEPTED_IMAGES.split(",").includes(file.type)) {
      showError("Invalid File", "Please upload a JPG or PNG image")
      return
    }
    setUploading((prev) => ({ ...prev, [kind]: true }))
    try {
      // certificate templates keep full resolution
      const response = await uploadService.uploadFile(file, "initiatives", { compress: kind === "banner" })
      if (kind === "banner") {
        handleInputChange("banner_image", response.data.url)
      } else {
        setFormData((prev) => ({ ...prev, certificate: { ...prev.certificate, template_image: response.data.url } }))
        showSuccess("Template Uploaded", "Adjust the positions below and preview the certificate")
      }
    } catch (error) {
      showError("Upload Failed", getApiErrorMessage(error, "Failed to upload image. Please try again."))
    } finally {
      setUploading((prev) => ({ ...prev, [kind]: false }))
    }
  }

  const handlePreview = async () => {
    try {
      const blob = await previewMutation.mutateAsync({
        title: { en: formData.title.en || "Campaign Name" },
        full_name: sampleName || "Participant Name",
        certificate: {
          template_image: formData.certificate.template_image,
          id_prefix: formData.certificate.id_prefix || undefined,
          layout: formData.certificate.layout,
        },
      })
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (error) {
      showError("Preview Failed", await readBlobError(error, "Failed to render the certificate preview"))
    }
  }

  const resetLayout = () => {
    if (!defaultLayout) return
    setFormData((prev) => ({ ...prev, certificate: { ...prev.certificate, layout: mergeLayout(defaultLayout) } }))
  }

  const handleSave = async () => {
    if (!formData.title.en.trim() || !formData.title.ml.trim()) {
      showError("Validation Error", "Please enter the campaign title in English and Malayalam")
      return
    }
    if (!formData.description.en.trim() || !formData.description.ml.trim()) {
      showError("Validation Error", "Please enter the description in English and Malayalam")
      return
    }
    if (!formData.banner_image) {
      showError("Validation Error", "Please upload a campaign banner")
      return
    }
    if (formData.status === "active" && (!formData.pledge_text.en.trim() || !formData.pledge_text.ml.trim())) {
      showError("Validation Error", "Add the pledge text in English and Malayalam before turning the campaign on")
      return
    }

    const payload: InitiativeFormData = {
      ...formData,
      certificate: {
        ...formData.certificate,
        id_prefix: formData.certificate.id_prefix.trim().toUpperCase(),
      },
    }

    try {
      if (isEdit && initiative) {
        await updateMutation.mutateAsync({ id: initiative._id, data: payload })
        onSave("Campaign updated successfully")
      } else {
        await createMutation.mutateAsync(payload)
        onSave("Campaign created successfully")
      }
    } catch (error) {
      showError(
        isEdit ? "Failed to Update Campaign" : "Failed to Create Campaign",
        getApiErrorMessage(error, "Something went wrong. Please try again.")
      )
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending
  const layout = formData.certificate.layout

  const numberField = (element: keyof CertificateLayout, field: string, label: string, step = 0.1) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <Input
        type="number"
        step={step}
        value={(layout[element] as Record<string, unknown>)?.[field] as number ?? ""}
        onChange={(e) => updateLayout(element, field, e.target.value === "" ? undefined : Number(e.target.value))}
        className="w-full border-gray-300 rounded-lg"
      />
    </div>
  )

  const renderImageUpload = (kind: "banner" | "template", url: string, onRemove: () => void, hint: string) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      {uploading[kind] ? (
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
          <p className="text-sm text-gray-500">Uploading...</p>
        </div>
      ) : url ? (
        <div className="flex flex-col items-center">
          <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
          <img src={url} alt={`${kind} preview`} className="max-w-sm max-h-40 object-contain rounded mb-2" />
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Remove
          </button>
        </div>
      ) : (
        <>
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-1">{hint}</p>
          <input
            type="file"
            accept={ACCEPTED_IMAGES}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(kind, file)
              e.target.value = ""
            }}
            className="hidden"
            id={`${kind}-upload`}
          />
          <label htmlFor={`${kind}-upload`} className="cursor-pointer text-blue-500 hover:text-blue-600">
            Choose file
          </label>
        </>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />

      <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <button onClick={onBack} className="hover:text-gray-900">
            Content Management
          </button>
          <span className="mx-2">›</span>
          <button onClick={onBack} className="hover:text-gray-900">
            Initiatives
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{isEdit ? "Edit Campaign" : "Add Campaign"}</span>
        </div>

        <div className="bg-white rounded-2xl p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Campaign Details</h2>

          <MultilingualInput
            label="Campaign Title"
            value={formData.title}
            onChange={(value) => handleInputChange("title", value)}
            placeholder={{ en: "e.g. Clean Kerala, Green Kerala", ml: "Enter title in Malayalam" }}
            required
          />

          <MultilingualInput
            label="Description"
            value={formData.description}
            onChange={(value) => handleInputChange("description", value)}
            placeholder={{ en: "Short description shown on the campaign page", ml: "Enter description in Malayalam" }}
            type="textarea"
            required
          />

          <div>
            <MultilingualInput
              label="Pledge Text"
              value={formData.pledge_text}
              onChange={(value) => handleInputChange("pledge_text", value)}
              placeholder={{ en: "Pledge users accept before joining", ml: "Enter pledge in Malayalam" }}
              type="textarea"
            />
            <p className="text-xs text-gray-500 mt-1">Shown next to the pledge checkbox. Required before the campaign is turned on.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Banner <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">Image (JPG/PNG) - Recommended size: 1920x1080px (16:9)</p>
            {renderImageUpload("banner", formData.banner_image, () => handleInputChange("banner_image", ""), "Upload banner")}
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Campaign is {formData.status === "active" ? "On" : "Off"}</p>
              <p className="text-xs text-gray-500">When on, the campaign is shown in the app and users can join.</p>
            </div>
            <Switch
              checked={formData.status === "active"}
              onCheckedChange={(checked) => handleInputChange("status", checked ? "active" : "inactive")}
              className={formData.status === "active" ? "bg-green-500" : "bg-gray-300"}
            />
          </div>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-2xl p-8 space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Certificate</h2>
              <p className="text-xs text-gray-500">
                Positions are in % of the template. Changes apply to all certificates (they regenerate automatically).
              </p>
            </div>
            <Button variant="outline" onClick={resetLayout} className="rounded-full flex items-center gap-2" disabled={!defaultLayout}>
              <RotateCcw className="w-4 h-4" />
              Reset Positions
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Template</label>
              <p className="text-xs text-gray-500 mb-3">
                Full design without the variable fields (PNG/JPG, e.g. 2000x1414px). Leave empty to use the default design.
              </p>
              {renderImageUpload(
                "template",
                formData.certificate.template_image,
                () => setFormData((prev) => ({ ...prev, certificate: { ...prev.certificate, template_image: "" } })),
                "Upload template"
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificate ID Prefix</label>
              <Input
                placeholder="e.g. CKGK (auto from title if empty)"
                value={formData.certificate.id_prefix}
                maxLength={10}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    certificate: { ...prev.certificate, id_prefix: e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() },
                  }))
                }
                className="w-full border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Certificate IDs look like {formData.certificate.id_prefix || "CKGK"}-{new Date().getFullYear()}-000001
              </p>
            </div>
          </div>

          {defaultsLoading || !layoutReady ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading certificate layout...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* Element positions */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[{ key: "photo" as const, label: "Photo" }, ...TEXT_ELEMENTS].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveElement(key)}
                      className={`px-3 py-1.5 rounded-full text-sm border ${
                        activeElement === key ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {activeElement === "photo" ? (
                  <div className="grid grid-cols-2 gap-3">
                    {numberField("photo", "x", "Left (X %)")}
                    {numberField("photo", "y", "Top (Y %)")}
                    {numberField("photo", "width", "Width %")}
                    {numberField("photo", "height", "Height %")}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Shape</label>
                      <Select
                        value={layout.photo.shape}
                        onChange={(e) => updateLayout("photo", "shape", e.target.value)}
                        className="w-full border-gray-300 rounded-lg"
                      >
                        <option value="circle">Circle</option>
                        <option value="rounded">Rounded</option>
                        <option value="square">Square</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Border Color</label>
                      <Input
                        type="color"
                        value={layout.photo.border_color || "#166534"}
                        onChange={(e) => updateLayout("photo", "border_color", e.target.value)}
                        className="w-full h-10 border-gray-300 rounded-lg p-1"
                      />
                    </div>
                    {numberField("photo", "border_width", "Border Width %")}
                    <p className="col-span-2 text-xs text-gray-500">
                      The app crops photos to this frame's shape (currently{" "}
                      {(() => {
                        const size = initiative?.template_size || defaultsResponse?.data?.template_size
                        if (!size || !layout.photo.width || !layout.photo.height) return "-"
                        const ratio = (layout.photo.width * size.width) / (layout.photo.height * size.height)
                        return `${ratio.toFixed(2)} : 1`
                      })()}
                      , width : height). Save to update the ratio for a new template.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`${activeElement}-enabled`}
                        checked={layout[activeElement].enabled !== false}
                        onChange={(e) => updateLayout(activeElement, "enabled", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`${activeElement}-enabled`} className="text-sm text-gray-700">
                        Show on certificate
                      </label>
                    </div>
                    {numberField(activeElement, "x", "X %")}
                    {numberField(activeElement, "y", "Y % (text baseline)")}
                    {numberField(activeElement, "font_size", "Font Size (% of height)")}
                    {numberField(activeElement, "max_width", "Max Width %")}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Align</label>
                      <Select
                        value={layout[activeElement].align}
                        onChange={(e) => updateLayout(activeElement, "align", e.target.value)}
                        className="w-full border-gray-300 rounded-lg"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Font</label>
                      <Select
                        value={layout[activeElement].font}
                        onChange={(e) => updateLayout(activeElement, "font", e.target.value)}
                        className="w-full border-gray-300 rounded-lg"
                      >
                        <option value="serif">Serif</option>
                        <option value="sans">Sans</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                      <Input
                        type="color"
                        value={layout[activeElement].color || "#111827"}
                        onChange={(e) => updateLayout(activeElement, "color", e.target.value)}
                        className="w-full h-10 border-gray-300 rounded-lg p-1"
                      />
                    </div>
                    <div className="flex items-end gap-2 pb-2">
                      <input
                        type="checkbox"
                        id={`${activeElement}-bold`}
                        checked={!!layout[activeElement].bold}
                        onChange={(e) => updateLayout(activeElement, "bold", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`${activeElement}-bold`} className="text-sm text-gray-700">
                        Bold
                      </label>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Prefix (optional)</label>
                      <Input
                        placeholder='e.g. "Certificate ID: "'
                        value={layout[activeElement].prefix || ""}
                        onChange={(e) => updateLayout(activeElement, "prefix", e.target.value)}
                        className="w-full border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-3 pt-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sample Name</label>
                    <Input
                      value={sampleName}
                      onChange={(e) => setSampleName(e.target.value)}
                      className="w-full border-gray-300 rounded-lg"
                    />
                  </div>
                  <Button
                    onClick={handlePreview}
                    disabled={previewMutation.isPending}
                    className="bg-black hover:bg-gray-800 text-white rounded-full px-6 flex items-center gap-2"
                  >
                    {previewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    Preview
                  </Button>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center min-h-[280px] p-3">
                {previewUrl ? (
                  <img src={previewUrl} alt="Certificate preview" className="w-full h-auto rounded shadow" />
                ) : (
                  <p className="text-sm text-gray-500 text-center px-6">
                    Click Preview to see the certificate with a sample name and placeholder photo.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onBack} className="rounded-full px-8">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || uploading.banner || uploading.template}
            className="bg-black hover:bg-gray-800 text-white rounded-full px-8 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
