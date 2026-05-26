import { useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react"
import { TopBar } from "@/components/custom/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { AddJobForm, type AddJobFormData } from "./add-job-form"
import { JobDetails } from "./job-details"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import {
  useCreateProviderJob,
  useJob,
  useJobProvider,
  useProviderJobs,
  useUpdateJob,
} from "@/hooks/useJobProviders"
import type { CreateJobData, JobStatus } from "@/types/job-provider"

interface JobProviderDetailsProps {
  providerId: string
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

const parseSalaryRange = (salaryRange: string) => {
  if (!salaryRange) {
    return {}
  }

  const [salaryMin, salaryMax] = salaryRange.split("-").map((value) => Number(value))

  return {
    salary_min: Number.isFinite(salaryMin) ? salaryMin : undefined,
    salary_max: Number.isFinite(salaryMax) ? salaryMax : undefined,
  }
}

const mapJobFormToPayload = (jobData: AddJobFormData): CreateJobData => ({
  title: jobData.title.trim(),
  email: jobData.email.trim(),
  job_type: (jobData.jobType || "full-time") as CreateJobData["job_type"],
  work_mode: (jobData.workMode || "onsite") as CreateJobData["work_mode"],
  location: jobData.location,
  about_role: jobData.aboutRole,
  responsibilities: jobData.responsibilities,
  requirements: jobData.requirements,
  skills: jobData.skills,
  benefits: jobData.benefits,
  ...parseSalaryRange(jobData.salaryRange),
})

export function JobProviderDetails({ providerId, onBack }: JobProviderDetailsProps) {
  const [showAddJobForm, setShowAddJobForm] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | Exclude<JobStatus, "deleted" | "draft">>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Applied filters (used in API query)
  const [appliedFilters, setAppliedFilters] = useState({
    jobType: "",
    salaryRange: "",
    appliedOnFrom: "",
    appliedOnTo: "",
  })

  // Temp filters (used in filter drawer before applying)
  const [tempFilters, setTempFilters] = useState({
    jobType: "",
    salaryRange: "",
    appliedOnFrom: "",
    appliedOnTo: "",
  })

  const { toasts, removeToast, success, error: showError } = useToast()

  const providerParams = useMemo(
    () => ({
      page_no: currentPage,
      limit: rowsPerPage,
      ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(appliedFilters.jobType ? { job_type: appliedFilters.jobType as "full-time" | "part-time" | "contract" | "internship" | "temporary" } : {}),
      ...(appliedFilters.salaryRange ? { salary_range: appliedFilters.salaryRange } : {}),
      ...(appliedFilters.appliedOnFrom ? { applied_on_from: appliedFilters.appliedOnFrom } : {}),
      ...(appliedFilters.appliedOnTo ? { applied_on_to: appliedFilters.appliedOnTo } : {}),
    }),
    [currentPage, rowsPerPage, searchTerm, statusFilter, appliedFilters]
  )

  const handleOpenFilter = () => {
    setTempFilters(appliedFilters)
    setIsFilterOpen(true)
  }

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters)
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    const empty = { jobType: "", salaryRange: "", appliedOnFrom: "", appliedOnTo: "" }
    setTempFilters(empty)
    setAppliedFilters(empty)
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const { data: providerResponse, isLoading: isProviderLoading, error: providerError } =
    useJobProvider(providerId)
  const { data: jobsResponse, isLoading: isJobsLoading, error: jobsError } = useProviderJobs(
    providerId,
    providerParams
  )
  const { data: editingJobResponse, isLoading: isEditJobLoading } = useJob(editingJobId || "")

  const createJobMutation = useCreateProviderJob()
  const updateJobMutation = useUpdateJob()

  const provider = providerResponse?.data
  const jobs = jobsResponse?.data || []
  const totalCount = jobsResponse?.total_count || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))

  const getStatusBadge = (status: string) => {
    if (status.toLowerCase() === "active") {
      return (
        <Badge className="rounded-full bg-[#E6F8ED] px-4 py-1 text-[#2AA65A] hover:bg-[#E6F8ED]">
          Active
        </Badge>
      )
    }
    return (
      <Badge className="rounded-full bg-[#FFF1F1] px-4 py-1 text-[#E53E3E] hover:bg-[#FFF1F1]">
        Closed
      </Badge>
    )
  }

  const handleSaveJob = async (jobData: AddJobFormData) => {
    try {
      const payload = mapJobFormToPayload(jobData)

      if (editingJobId) {
        await updateJobMutation.mutateAsync({ jobId: editingJobId, jobData: payload })
        success("Job updated", "The job has been saved.")
      } else {
        await createJobMutation.mutateAsync({ providerId, jobData: payload })
        success("Job created", "The new job has been added.")
      }

      setShowAddJobForm(false)
      setEditingJobId(null)
    } catch (saveError) {
      showError("Unable to save job", getErrorMessage(saveError, "Please try again."))
      throw saveError
    }
  }

  if (showAddJobForm || editingJobId) {
    const editingJob = editingJobResponse?.data
    const editingSalaryRange =
      editingJob?.salary_min !== undefined && editingJob?.salary_max !== undefined
        ? `${editingJob.salary_min}-${editingJob.salary_max}`
        : ""

    return (
      <>
        <div className="flex h-screen flex-col">
          <TopBar />
          <div className="flex-1 overflow-y-auto bg-gray-50 pt-[100px] pr-8 pb-8 pl-0">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <button onClick={onBack} className="hover:text-gray-900">
                  Job Providers
                </button>
                <span className="mx-2">/</span>
                <button
                  onClick={() => {
                    setShowAddJobForm(false)
                    setEditingJobId(null)
                  }}
                  className="hover:text-gray-900"
                >
                  {provider?.provider_name || "Provider"}
                </button>
                <span className="mx-2">/</span>
                <span className="text-gray-900">
                  {editingJobId ? "Edit Job" : "Add New Job"}
                </span>
              </div>
            </div>
            {editingJobId && isEditJobLoading ? (
              <p className="text-sm text-gray-500">Loading job details...</p>
            ) : (
              <AddJobForm
                isEdit={!!editingJobId}
                initialData={
                  editingJob
                    ? {
                        title: editingJob.title,
                        email: editingJob.email || "",
                        jobType: editingJob.job_type as AddJobFormData["jobType"],
                        workMode: editingJob.work_mode as AddJobFormData["workMode"],
                        location: editingJob.location,
                        salaryRange: editingSalaryRange,
                        aboutRole: editingJob.about_role || "",
                        responsibilities: editingJob.responsibilities || "",
                        requirements: editingJob.requirements || "",
                        skills: editingJob.skills || [],
                        benefits: editingJob.benefits || "",
                      }
                    : undefined
                }
                onBack={() => {
                  setShowAddJobForm(false)
                  setEditingJobId(null)
                }}
                onSave={handleSaveJob}
              />
            )}
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  if (selectedJobId) {
    return (
      <>
        <JobDetails jobId={selectedJobId} onBack={() => setSelectedJobId(null)} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  return (
    <>
      <div className="flex h-screen flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto bg-gray-50 pt-[100px] pr-8 pb-8 pl-0">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <button onClick={onBack} className="hover:text-gray-900">
                Job Providers
              </button>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{provider?.provider_name || "Provider"}</span>
            </div>

            <Button
              onClick={() => setShowAddJobForm(true)}
              className="h-11 rounded-full bg-[#111111] px-5 text-white hover:bg-[#222222]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Job
            </Button>
          </div>

          {providerError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {getErrorMessage(providerError, "Failed to load provider details.")}
            </div>
          )}

          {provider && (
            <div className="mb-6 flex flex-col gap-6 lg:flex-row">
              <div className="flex-1 rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="h-[88px] w-[88px] overflow-hidden rounded-xl bg-black">
                    {provider.company_logo ? (
                      <img
                        src={provider.company_logo}
                        alt={provider.provider_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-400 to-red-600 text-xl font-bold italic text-white">
                        {provider.provider_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h1 className="text-xl font-semibold text-[#161616]">
                        {provider.provider_name}
                      </h1>
                      <Badge className="rounded-md border border-[#2AA65A] bg-transparent px-2 py-0.5 text-xs text-[#2AA65A] hover:bg-transparent">
                        {provider.status}
                      </Badge>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-[#737373]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-[#A3A3A3]" />
                        {provider.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-[#A3A3A3]" />
                        {provider.mobile_number}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-[#A3A3A3]" />
                        {provider.email}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-[#A3A3A3]" />
                        {provider.website_url || "N/A"}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[#A3A3A3]">
                      <span>Company Size: {provider.company_size || "N/A"}</span>
                      <span className="h-1 w-1 rounded-full bg-[#D4D4D4]"></span>
                      <span>
                        Joined on: {new Date(provider.joined_on).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex w-[200px] flex-col justify-between rounded-2xl bg-[#E6EDFF] p-5">
                  <span className="text-sm font-medium text-[#303030]">Active Jobs</span>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="text-3xl font-semibold text-[#161616]">
                      {provider.active_jobs}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#CCDCFF]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7M4 7H20C21.1046 7 22 7.89543 22 9V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V9C2 7.89543 2.89543 7 4 7Z"
                          stroke="#4B7BFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex w-[220px] flex-col justify-between rounded-2xl bg-[#FEF4E6] p-5">
                  <span className="text-sm font-medium text-[#303030]">Total Applicants</span>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="text-3xl font-semibold text-[#161616]">
                      {provider.applicants}
                    </span>
                    <div className="relative h-12 w-16">
                      <div className="absolute right-0 bottom-0 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#FCE5CD]">
                        <Users className="h-5 w-5 text-[#E68A00]" />
                      </div>
                      <div className="absolute right-6 bottom-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#FFEFE5]">
                        <Users className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-[22px] border border-[#ECECEC] bg-white shadow-sm">
            <div className="border-b border-[#F1F1F1] px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-lg font-semibold text-[#161616]">Jobs</h2>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search jobs by title or location.."
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value)
                        setCurrentPage(1)
                      }}
                      className="h-10 rounded-full border-[#E5E5E5] pl-10 text-sm focus:border-[#B3B3B3]"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value as typeof statusFilter)
                      setCurrentPage(1)
                    }}
                    className="h-10 rounded-full border border-[#E5E5E5] bg-white px-4 text-sm text-[#303030] outline-none"
                  >
                    <option value="">Status: All</option>
                    <option value="active">Status: Active</option>
                    <option value="closed">Status: Closed</option>
                  </select>

                  <Button
                    variant="outline"
                    onClick={handleOpenFilter}
                    className="h-10 w-10 rounded-xl border-[#E5E5E5] bg-white p-0 text-[#737373] hover:bg-[#FAFAFA]"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {jobsError && (
              <div className="px-6 pt-4 text-sm text-red-600">
                {getErrorMessage(jobsError, "Failed to load jobs.")}
              </div>
            )}

            <div className="overflow-x-auto p-4">
              <table className="w-full min-w-[900px] border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Jobs</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Job Type</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Salary Range</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Applicants</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Applied On</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-[#8C8C8C]">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-normal text-[#8C8C8C]"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job._id}
                      className="cursor-pointer rounded-xl bg-[#F8F9FA] transition-colors hover:bg-[#F3F4F6]"
                      onClick={() => setSelectedJobId(job._id)}
                    >
                      <td className="rounded-l-2xl px-4 py-4 text-sm font-medium text-[#161616]">
                        {job.title}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#303030]">{job.job_type}</td>
                      <td className="px-4 py-4 text-sm text-[#303030]">{job.salary_range || "N/A"}</td>
                      <td className="px-4 py-4 text-sm text-[#303030]">{job.applicants}</td>
                      <td className="px-4 py-4 text-sm text-[#303030]">
                        {new Date(job.applied_on).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(job.status)}</td>
                      <td className="rounded-r-2xl px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full p-0 text-[#737373] hover:bg-white"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 text-sm"
                            onClick={() => setSelectedJobId(job._id)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 text-sm"
                            onClick={() => setEditingJobId(job._id)}
                          >
                            Edit Job
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {!isJobsLoading && jobs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="rounded-2xl bg-[#FAFAFA] px-4 py-8 text-center text-sm text-[#8C8C8C]">
                        No jobs found.
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
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {(isProviderLoading || isJobsLoading) && (
            <p className="mt-4 text-sm text-gray-500">Loading provider content...</p>
          )}
        </div>
      </div>

      {/* Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50">
          <div className="flex h-full w-80 flex-col overflow-hidden rounded-l-2xl bg-white shadow-lg">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Filter by</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                  className="h-8 w-8 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Job Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Job Type
                  </label>
                  <select
                    value={tempFilters.jobType}
                    onChange={(event) =>
                      setTempFilters((prev) => ({ ...prev, jobType: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Salary Range
                  </label>
                  <select
                    value={tempFilters.salaryRange}
                    onChange={(event) =>
                      setTempFilters((prev) => ({ ...prev, salaryRange: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  >
                    <option value="">All Ranges</option>
                    <option value="10000-25000">₹10,000 – ₹25,000</option>
                    <option value="25000-40000">₹25,000 – ₹40,000</option>
                    <option value="40000-60000">₹40,000 – ₹60,000</option>
                    <option value="60000-100000">₹60,000 – ₹1,00,000</option>
                    <option value="100000+">₹1,00,000+</option>
                  </select>
                </div>

                {/* Applied On — date range */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Applied On
                  </label>
                  <div className="space-y-2">
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">From</label>
                      <input
                        type="date"
                        value={tempFilters.appliedOnFrom}
                        onChange={(event) =>
                          setTempFilters((prev) => ({ ...prev, appliedOnFrom: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">To</label>
                      <input
                        type="date"
                        value={tempFilters.appliedOnTo}
                        onChange={(event) =>
                          setTempFilters((prev) => ({ ...prev, appliedOnTo: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-white p-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="flex-1 rounded-full bg-black text-white hover:bg-gray-800"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
