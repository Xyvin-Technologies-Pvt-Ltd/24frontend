import { Download } from "lucide-react"
import { TopBar } from "../top-bar"
import type { FinancialProgrammeDonation } from "@/types/financial-programme"

interface DonationDetailViewProps {
  data: FinancialProgrammeDonation
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

export function DonationDetailView({
  data,
  programmeName = "Financial Programme",
  onBack,
}: DonationDetailViewProps) {
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
            <span className="font-medium text-gray-900">Donation view</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{data.name}</h1>
              <p className="mt-2 text-sm text-gray-500">
                {data.campaign_name || "Donation"}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border-b border-gray-200 pb-4">
                <p className="mb-4 text-sm font-medium text-gray-900">Phone Number</p>
                <p className="text-sm text-gray-700">{data.phone_number || "-"}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="mb-4 text-sm font-medium text-gray-900">Date</p>
                <p className="text-sm text-gray-700">{formatDate(data.createdAt)}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="mb-4 text-sm font-medium text-gray-900">Donated Amount</p>
                <p className="text-sm text-gray-700">
                  {data.donated_amount != null
                    ? `${data.currency || "INR"} ${Number(data.donated_amount).toLocaleString("en-IN")}`
                    : "-"}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="mb-4 text-sm font-medium text-gray-900">Status</p>
                <p className="text-sm text-gray-700">{data.status || "-"}</p>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <p className="mb-4 text-sm font-medium text-gray-900">Message</p>
              <p className="text-sm leading-relaxed text-gray-700">{data.message || "-"}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-gray-900">Receipt</p>
                {data.receipt && (
                  <a
                    href={data.receipt}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Download receipt"
                    title="Download receipt"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>

              {data.receipt ? (
                <div className="overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={data.receipt}
                    alt={`${data.name} donation receipt`}
                    className="max-h-[420px] w-full object-contain"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500">No receipt available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
