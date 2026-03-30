import { TopBar } from "../top-bar"
import type { FinancialProgrammeCampaign } from "@/types/financial-programme"

interface CampaignDetailViewProps {
  data: FinancialProgrammeCampaign
  programmeName?: string
  onBack: () => void
}

const formatDate = (value?: string) => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB")
}

const getStatusLabel = (status?: string) => {
  if (status === "Completed") {
    return "Completed"
  }

  return "Ongoing"
}

export function CampaignDetailView({
  data,
  programmeName = "Financial Programme",
  onBack,
}: CampaignDetailViewProps) {
  return (
    <div className="flex h-screen flex-col">
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
            <span className="font-medium text-gray-900">Detail view page</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                {data.campaign_name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-6 text-sm text-gray-700">
                <div>
                  <span className="font-medium text-gray-900">Start Date</span>
                  <span className="ml-2">{formatDate(data.start_date)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">End Date</span>
                  <span className="ml-2">{formatDate(data.end_date)}</span>
                </div>
              </div>
            </div>

            <span className="inline-flex rounded-full bg-orange-100 px-4 py-1.5 text-xs font-medium text-orange-600">
              {getStatusLabel(data.status)}
            </span>
          </div>

          <div className="space-y-8">
            <div>
              <p className="mb-3 text-sm font-medium text-gray-900">Image</p>
              <div className="overflow-hidden rounded-2xl bg-gray-100">
                {data.cover_image ? (
                  <img
                    src={data.cover_image}
                    alt={data.campaign_name}
                    className="h-[360px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[360px] items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <p className="mb-4 text-sm font-medium text-gray-900">Description</p>
              <p className="text-sm leading-relaxed text-gray-700">
                {data.description}
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <p className="mb-4 text-sm font-medium text-gray-900">
                Short Description
              </p>
              <p className="text-sm leading-relaxed text-gray-700">
                {data.short_description}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="border-b border-gray-200 pb-4">
                <p className="mb-4 text-sm font-medium text-gray-900">
                  Beneficiary name
                </p>
                <p className="text-sm text-gray-700">{data.beneficiary_name}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="mb-4 text-sm font-medium text-gray-900">
                  Beneficiary Location
                </p>
                <p className="text-sm text-gray-700">
                  {data.beneficiary_location}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="mb-4 text-sm font-medium text-gray-900">
                  Amount Raised
                </p>
                <p className="text-sm text-gray-700">
                  ₹{Number(data.amount_raised || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
