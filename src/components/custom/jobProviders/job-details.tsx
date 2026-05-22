import { useMemo, useState } from "react"
import {
  Download,
  FileText,
  Globe,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Search,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react"
import { TopBar } from "@/components/custom/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Modal } from "@/components/ui/modal"
import { useJob, useJobApplications } from "@/hooks/useJobProviders"
import type { JobApplication } from "@/types/job-provider"

interface JobDetailsProps {
  jobId: string
  onBack: () => void
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.message === "string"
  ) {
    return (error as any).response.data.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function JobDetails({ jobId, onBack }: JobDetailsProps) {
  const [viewedApplicant, setViewedApplicant] = useState<JobApplication | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const applicationParams = useMemo(
    () => ({
      page_no: currentPage,
      limit: rowsPerPage,
      ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
    }),
    [currentPage, rowsPerPage, searchTerm]
  )

  const { data: jobResponse, isLoading: isJobLoading, error: jobError } = useJob(jobId)
  const {
    data: applicationsResponse,
    isLoading: isApplicationsLoading,
    error: applicationsError,
  } = useJobApplications(jobId, applicationParams)

  const job = jobResponse?.data
  const provider = job?.provider_details
  const applicants = applicationsResponse?.data || []
  const totalCount = applicationsResponse?.total_count || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex-1 overflow-y-auto bg-gray-50 pt-[100px] pr-8 pb-8 pl-0">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <button onClick={onBack} className="hover:text-gray-900">Job Providers</button>
            <span className="mx-2">/</span>
            <button onClick={onBack} className="hover:text-gray-900">
              {provider?.provider_name || "Provider"}
            </button>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900">{job?.title || "Job"}</span>
          </div>
        </div>

        {jobError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {getErrorMessage(jobError, "Failed to load job details.")}
          </div>
        )}

        {job && (
          <div className="mb-6 flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-xl font-semibold text-[#161616]">{job.title}</h1>
                <Badge className="rounded-md border border-[#2AA65A] bg-transparent px-2 py-0.5 text-xs text-[#2AA65A] hover:bg-transparent">
                  {job.status}
                </Badge>
              </div>

              <div className="mb-4 flex items-center gap-2 text-[#718EBF]">
                <span className="text-sm">{provider?.provider_name}</span>
                <CheckCircle2 className="h-4 w-4 fill-blue-500/20 text-blue-500" />
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-[#737373]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#A3A3A3]" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-[#A3A3A3]" />
                  {provider?.mobile_number || "N/A"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-[#A3A3A3]" />
                  {job.email || provider?.email || "N/A"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-[#A3A3A3]" />
                  {provider?.website_url || "N/A"}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-[#A3A3A3]">
                <span>Company Size: {provider?.company_size || "N/A"}</span>
                <span className="h-1 w-1 rounded-full bg-[#D4D4D4]"></span>
                <span>Salary: {job.salary_range || "N/A"}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex w-[260px] flex-col justify-between rounded-2xl bg-[#FEF4E6] p-5">
                <span className="text-sm font-medium text-[#303030]">Total Applicants</span>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-4xl font-semibold text-[#161616]">{job.applicants}</span>
                  <div className="h-12 w-16 relative">
                    <div className="absolute right-0 bottom-0 z-20 h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-[#FCE5CD]"></div>
                    <div className="absolute right-6 bottom-0 z-10 h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-[#FFEFE5]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-[22px] border border-[#ECECEC] bg-white shadow-sm">
          <div className="border-b border-[#F1F1F1] px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-lg font-semibold text-[#161616]">Applicants</h2>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search applicants by name, email, or location.."
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-10 rounded-full border-[#E5E5E5] pl-10 text-sm focus:border-[#B3B3B3]"
                  />
                </div>

                <Button
                  variant="outline"
                  className="h-10 rounded-full border-[#E5E5E5] bg-white px-4 text-[#303030] hover:bg-[#FAFAFA]"
                >
                  Download CSV
                  <Download className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="h-10 w-10 rounded-xl border-[#E5E5E5] bg-white p-0 text-[#737373] hover:bg-[#FAFAFA]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {applicationsError && (
            <div className="px-6 pt-4 text-sm text-red-600">
              {getErrorMessage(applicationsError, "Failed to load applications.")}
            </div>
          )}

          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[1000px] border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Applicants</th>
                  <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Experience</th>
                  <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Applied On</th>
                  <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Resume</th>
                  <th className="px-4 py-3 text-right text-sm font-normal text-[#8C8C8C]"></th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => (
                  <tr
                    key={applicant._id}
                    className="cursor-pointer rounded-xl bg-[#FAFAFA] transition-colors hover:bg-[#F3F4F6]"
                    onClick={() => setViewedApplicant(applicant)}
                  >
                    <td className="rounded-l-2xl px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#161616]">{applicant.name}</p>
                        <p className="text-xs text-[#8D8D8D]">{applicant.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#303030]">{applicant.email}</td>
                    <td className="px-4 py-4 text-sm text-[#303030]">{applicant.location || "N/A"}</td>
                    <td className="px-4 py-4 text-sm text-[#303030]">{applicant.experience || "N/A"}</td>
                    <td className="px-4 py-4 text-sm text-[#303030]">
                      {new Date(applicant.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      {applicant.resume_url ? (
                        <a
                          href={applicant.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-[#718EBF]"
                        >
                          <FileText className="h-4 w-4" />
                          View Resume
                        </a>
                      ) : (
                        <span className="text-sm text-[#8C8C8C]">Not available</span>
                      )}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-[#737373]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-3 py-2 text-sm"
                          onClick={() => setViewedApplicant(applicant)}
                        >
                          View
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {!isApplicationsLoading && applicants.length === 0 && (
                  <tr>
                    <td colSpan={7} className="rounded-2xl bg-[#FAFAFA] px-4 py-8 text-center text-sm text-[#8C8C8C]">
                      No applicants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#F1F1F1] px-6 py-4 md:flex-row md:items-center md:justify-end">
            <div className="flex items-center gap-2 text-sm text-[#737373]">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(event) => {
                  setRowsPerPage(Number(event.target.value))
                  setCurrentPage(1)
                }}
                className="rounded-md border border-[#E5E5E5] bg-transparent px-2 py-1 text-sm text-[#303030] outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="ml-4 flex items-center gap-4 text-sm text-[#737373]">
              <span>
                {totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
                {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <span className="text-xl">&lt;</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  <span className="text-xl">&gt;</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {(isJobLoading || isApplicationsLoading) && (
          <p className="mt-4 text-sm text-gray-500">Loading job details...</p>
        )}
      </div>

      <Modal isOpen={!!viewedApplicant} onClose={() => setViewedApplicant(null)}>
        <div className="flex items-center justify-between border-b border-[#F1F1F1] px-6 py-4">
          <h2 className="text-[20px] font-medium text-[#1A1A1A]">View response</h2>
          <button onClick={() => setViewedApplicant(null)} className="text-[#A3A3A3] hover:text-[#1A1A1A]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {viewedApplicant && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-base text-[#8C8C8C]">Name</span>
                <span className="text-base font-medium text-[#1A1A1A]">{viewedApplicant.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-[#8C8C8C]">Designation</span>
                <span className="text-base font-medium text-[#1A1A1A]">{viewedApplicant.designation || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-[#8C8C8C]">Experience</span>
                <span className="text-base font-medium text-[#1A1A1A]">{viewedApplicant.experience || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-[#8C8C8C]">Notice Period</span>
                <span className="text-base font-medium text-[#1A1A1A]">{viewedApplicant.notice_period || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-[#8C8C8C]">Email</span>
                <span className="text-base font-medium text-[#1A1A1A]">{viewedApplicant.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-[#8C8C8C]">Contact Number</span>
                <span className="text-base font-medium text-[#1A1A1A]">{viewedApplicant.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-[#8C8C8C]">Location</span>
                <span className="text-base font-medium text-[#1A1A1A]">{viewedApplicant.location || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-[#8C8C8C]">Website</span>
                <span className="text-base font-medium text-[#1A1A1A]">{viewedApplicant.website || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-[#8C8C8C]">Applied On</span>
                <span className="text-base font-medium text-[#1A1A1A]">
                  {new Date(viewedApplicant.createdAt).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-[#8C8C8C]">Expected Salary</span>
                <span className="text-base font-medium text-[#1A1A1A]">{viewedApplicant.expected_salary || "N/A"}</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 text-base font-medium text-[#1A1A1A]">Resume</h3>
              <div className="flex items-center justify-between rounded-xl border border-[#ECECEC] p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-[#FFF1F1]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4B4B]">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {viewedApplicant.resume_url ? "Resume File" : "No Resume"}
                    </p>
                    <p className="text-xs text-[#8C8C8C]">
                      {viewedApplicant.resume_url ? "Available for download" : "Not uploaded"}
                    </p>
                  </div>
                </div>
                {viewedApplicant.resume_url && (
                  <a
                    href={viewedApplicant.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#737373] hover:text-[#1A1A1A]"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
