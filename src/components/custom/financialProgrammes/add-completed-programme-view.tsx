import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "../top-bar"
import { Loader2, Plus } from "lucide-react"
import type { FinancialProgrammeHousingProjectStatus } from "@/types/financial-programme"

interface AddCompletedProgrammeViewProps {
  programmeName?: string
  onBack: () => void
  isSaving?: boolean
  title?: string
  saveLabel?: string
  initialData?: {
    house_id: string
    location: string
    beneficiary: string
    status: FinancialProgrammeHousingProjectStatus
    imageUrl?: string
  }
  onSave?: (data: {
    house_id: string
    location: string
    beneficiary: string
    status: FinancialProgrammeHousingProjectStatus
    file?: File | null
  }) => Promise<void> | void
}

export function AddCompletedProgrammeView({
  programmeName = "1000 House Initiative",
  onBack,
  isSaving = false,
  title = "Add Completed Programmes",
  saveLabel = "Save",
  initialData,
  onSave,
}: AddCompletedProgrammeViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    house_id: initialData?.house_id ?? "",
    location: initialData?.location ?? "",
    beneficiary: initialData?.beneficiary ?? "",
    status:
      initialData?.status ?? ("Fund Allocated" as FinancialProgrammeHousingProjectStatus),
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSave = async () => {
    await onSave?.({
      ...formData,
      file: selectedFile,
    })
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      <div className="flex-1 overflow-y-auto bg-gray-50 p-8 pt-[100px]">
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <span>Financial Programmes</span>
          <span className="mx-2">{">"}</span>
          <span>{programmeName}</span>
          <span className="mx-2">{">"}</span>
          <span>Completed</span>
          <span className="mx-2">{">"}</span>
          <span className="font-medium text-gray-900">{title}</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">House ID</label>
              <Input
                value={formData.house_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, house_id: e.target.value }))
                }
                placeholder="Enter house ID"
                className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                  className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Beneficiary Name</label>
                <Input
                  value={formData.beneficiary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, beneficiary: e.target.value }))}
                  placeholder="Enter beneficiary"
                  className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Image</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-28 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8DEE8] bg-white text-center transition-colors hover:bg-gray-50"
              >
                <Plus className="mb-3 h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {selectedFile
                    ? selectedFile.name
                    : initialData?.imageUrl
                    ? "Change image"
                    : "Upload file"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              {initialData?.imageUrl && !selectedFile && (
                <div className="overflow-hidden rounded-2xl border border-[#D9E4F2]">
                  <img
                    src={initialData.imageUrl}
                    alt={formData.house_id || "Housing project"}
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Campaign Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as FinancialProgrammeHousingProjectStatus,
                  }))
                }
                className="h-11 w-full rounded-2xl border border-[#D9E4F2] bg-white px-4 text-sm text-[#6B89B3] outline-none"
              >
                <option value="Fund Allocated">Fund Allocated</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
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
              disabled={isSaving}
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
