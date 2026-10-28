import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { JobRequest } from "@/types/job-provider"

interface ViewJobRequestModalProps {
  isOpen: boolean
  onClose: () => void
  jobRequest: JobRequest | null
}

export function ViewJobRequestModal({ isOpen, onClose, jobRequest }: ViewJobRequestModalProps) {
  if (!isOpen || !jobRequest) return null

  const formatDateTime = (value?: string) => {
    if (!value) return "N/A"

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "N/A"

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const company = jobRequest.provider
    ? {
        name: jobRequest.provider.provider_name,
        email: jobRequest.provider.email,
        phone: jobRequest.provider.mobile_number,
        location: jobRequest.provider.location,
        website: undefined as string | undefined,
        industry: undefined as string | undefined,
      }
    : {
        name: jobRequest.company_details?.provider_name,
        email: jobRequest.company_details?.email,
        phone: jobRequest.company_details?.mobile_number,
        location: jobRequest.company_details?.location,
        website: jobRequest.company_details?.website_url,
        industry: jobRequest.company_details?.industry_type,
      }

  const detailRow = (label: string, value?: string | null) => (
    <div>
      <span className="font-medium text-gray-800">{label}:</span>{" "}
      {value || "N/A"}
    </div>
  )

  const textBlock = (label: string, value?: string) =>
    value ? (
      <div>
        <h3 className="text-sm font-medium text-gray-800 mb-1">{label}</h3>
        <p className="text-sm text-gray-600 whitespace-pre-line">{value}</p>
      </div>
    ) : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">View Job Request</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8 hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{jobRequest.title}</h3>
            <p className="text-sm text-gray-500 capitalize">
              {jobRequest.job_type} · {jobRequest.work_mode} · {jobRequest.location}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {detailRow("Salary", jobRequest.salary_range)}
            {detailRow("Contact Email", jobRequest.email)}
            {detailRow("Requested By", jobRequest.requested_by?.name)}
            {detailRow("Requester Phone", jobRequest.requested_by?.phone)}
            {detailRow("Requested On", formatDateTime(jobRequest.createdAt))}
            {jobRequest.status === "rejected" && detailRow("Reject Reason", jobRequest.reject_reason)}
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Company {jobRequest.provider ? "(existing provider)" : "(new provider)"}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              {detailRow("Name", company.name)}
              {detailRow("Email", company.email)}
              {detailRow("Phone", company.phone)}
              {detailRow("Location", company.location)}
              {!jobRequest.provider && detailRow("Website", company.website)}
              {!jobRequest.provider && detailRow("Industry", company.industry)}
            </div>
          </div>

          {textBlock("About the Role", jobRequest.about_role)}
          {textBlock("Responsibilities", jobRequest.responsibilities)}
          {textBlock("Requirements", jobRequest.requirements)}
          {textBlock("Benefits", jobRequest.benefits)}

          {jobRequest.skills?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {jobRequest.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
