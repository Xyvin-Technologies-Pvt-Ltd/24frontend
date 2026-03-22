import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { FinancialProgrammeHousingProject } from "@/types/financial-programme"

interface HousingProjectViewProps {
  data: FinancialProgrammeHousingProject
  onClose: () => void
}

export function HousingProjectView({ data, onClose }: HousingProjectViewProps) {
  const photos = data.photos ?? []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">View Completed Programme</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main Photo */}
          {photos.length > 0 && (
            <div className="w-full h-56 bg-gray-200 rounded-2xl overflow-hidden mb-6">
              <img
                src={photos[0]}
                alt={data.house_id}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-gray-900">{data.house_id}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600 font-medium">Location :</p>
                <p className="text-sm text-gray-900">{data.location}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium">Beneficiary :</p>
                <p className="text-sm text-gray-900">{data.beneficiary}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Status :</p>
                <p className="text-sm text-gray-900">{data.status || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Description :</p>
                <p className="text-sm text-gray-900">{data.description || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-2xl"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
