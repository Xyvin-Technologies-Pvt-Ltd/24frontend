import { TopBar } from "../top-bar"
import type { FinancialProgrammeRequest } from "@/types/financial-programme"

interface RequestDetailViewProps {
  data: FinancialProgrammeRequest
  programmeName?: string
  onBack: () => void
}

const formatDate = (value?: string) => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const renderBoolean = (value?: boolean) => {
  if (value === undefined) {
    return "-"
  }

  return value ? "Yes" : "No"
}

export function RequestDetailView({
  data,
  programmeName = "Financial Programme",
  onBack,
}: RequestDetailViewProps) {
  const photos = data.supporting_photos ?? []

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      <div className="flex-1 overflow-y-auto bg-gray-50 p-8 pt-[100px]">
        <div className="mb-8">
          <div className="mb-4 flex items-center text-sm text-gray-600">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-gray-900"
            >
              Financial Programmes
            </button>
            <span className="mx-2">{">"}</span>
            <button
              type="button"
              onClick={onBack}
              className="hover:text-gray-900"
            >
              {programmeName}
            </button>
            <span className="mx-2">{">"}</span>
            <span className="text-gray-900 font-medium">Request Detail</span>
          </div>
        </div>

        <div className="space-y-8 rounded-2xl border border-gray-200 bg-white p-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{data.name}</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">Date of Birth</p>
              <p className="text-base text-gray-900">{formatDate(data.date_of_birth)}</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">Gender</p>
              <p className="text-base text-gray-900">{data.gender || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">Current District</p>
              <p className="text-base text-gray-900">{data.current_district || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">Current Address</p>
              <p className="text-base text-gray-900">{data.current_address}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">Phone Number</p>
              <p className="text-base text-gray-900">{data.phone_number}</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">On LIFE Mission</p>
              <p className="text-base text-gray-900">
                {renderBoolean(data.is_on_life_mission)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">Family Members</p>
              <p className="text-base text-gray-900">{data.family_members ?? "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">
                Shelter Situation
              </p>
              <p className="text-base text-gray-900">
                {data.current_shelter_situation || "-"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">Monthly Income</p>
              <p className="text-base text-gray-900">{data.monthly_income || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">Employment Status</p>
              <p className="text-base text-gray-900">{data.employment_status || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">Owns Land</p>
              <p className="text-base text-gray-900">
                {renderBoolean(data.owns_land_for_house)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">Land Area</p>
              <p className="text-base text-gray-900">{data.land_area || "-"}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">
              Details of Situation
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              {data.details_of_situation}
            </p>
          </div>

          {photos.length > 0 && (
            <div className="border-t border-gray-200 pt-8">
              <h4 className="mb-4 text-sm font-medium text-gray-600">
                Supporting Photos
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                {photos.map((photo, index) => (
                  <div
                    key={`${photo}-${index}`}
                    className="h-48 overflow-hidden rounded-2xl bg-gray-100"
                  >
                    <img
                      src={photo}
                      alt={`Supporting photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
