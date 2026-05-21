import { useDeferredValue, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { TopBar } from "@/components/custom/top-bar"
import { Button } from "@/components/ui/button"
import {
  AddProviderForm,
  type AddProviderFormData,
} from "@/components/custom/jobProviders/add-provider-form"
import { JobProviderSummaryCards } from "@/components/custom/jobProviders/job-provider-summary-cards"
import {
  JobProvidersTable,
  type JobProviderRecord,
  type JobProviderStatusFilter,
} from "@/components/custom/jobProviders/job-providers-table"
import { JobProviderDetails } from "@/components/custom/jobProviders/job-provider-details"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import {
  useCreateJobProvider,
  useJobProvider,
  useJobProviders,
  useUpdateJobProvider,
} from "@/hooks/useJobProviders"
import type { CreateJobProviderData, JobProvider } from "@/types/job-provider"

const getProviderAccent = (index: number): JobProviderRecord["accent"] => {
  const accents: JobProviderRecord["accent"][] = [
    "emerald",
    "stone",
    "slate",
    "amber",
    "rose",
    "violet",
    "teal",
    "sky",
    "lime",
    "orange",
    "indigo",
    "zinc",
    "red",
  ]

  return accents[index % accents.length]
}

const toTableRecord = (provider: JobProvider, index: number): JobProviderRecord => ({
  id: provider._id,
  name: provider.provider_name,
  phone: provider.mobile_number,
  logoUrl: provider.company_logo || undefined,
  location: provider.location,
  activeJobs: provider.active_jobs,
  applicants: provider.applicants,
  joinedOn: provider.joined_on || provider.createdAt,
  status: provider.status === "deleted" ? "inactive" : provider.status,
  accent: getProviderAccent(index),
})

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

const mapFormDataToPayload = (providerData: AddProviderFormData): CreateJobProviderData => ({
  provider_name: providerData.providerName.trim(),
  email: providerData.email.trim(),
  mobile_number: providerData.mobileNumber.trim(),
  website_url: providerData.websiteUrl.trim(),
  location: providerData.location,
  industry_type: providerData.industryType,
  company_size: providerData.companySize,
  ...(providerData.companyLogo ? { company_logo: providerData.companyLogo } : {}),
})

export function JobProvidersPage() {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [showAddProviderForm, setShowAddProviderForm] = useState(false)
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<JobProviderStatusFilter>("all")
  const [tempStatusFilter, setTempStatusFilter] = useState<JobProviderStatusFilter>("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const deferredSearch = useDeferredValue(searchTerm)

  const { toasts, removeToast, success, error: showError } = useToast()

  const providerParams = useMemo(
    () => ({
      page_no: currentPage,
      limit: rowsPerPage,
      ...(deferredSearch.trim() ? { search: deferredSearch.trim() } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    }),
    [currentPage, deferredSearch, rowsPerPage, statusFilter]
  )

  const statsParams = useMemo(() => ({ page_no: 1, limit: 1000 }), [])

  const { data: providersResponse, isLoading, error } = useJobProviders(providerParams)
  const { data: statsResponse } = useJobProviders(statsParams)
  const { data: editingProviderResponse, isLoading: isEditLoading } = useJobProvider(
    editingProviderId || ""
  )

  const createProviderMutation = useCreateJobProvider()
  const updateProviderMutation = useUpdateJobProvider()

  const providers = providersResponse?.data || []
  const tableProviders = providers.map(toTableRecord)
  const totalCount = providersResponse?.total_count || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const statsProviders = statsResponse?.data || []
  const totalProviders = statsResponse?.total_count || 0
  const activeProviders = statsProviders.filter((provider) => provider.status === "active").length
  const totalActiveJobs = statsProviders.reduce((sum, provider) => sum + provider.active_jobs, 0)
  const totalApplicants = statsProviders.reduce((sum, provider) => sum + provider.applicants, 0)

  const handleOpenFilter = () => {
    setTempStatusFilter(statusFilter)
    setIsFilterOpen(true)
  }

  const handleApplyFilters = () => {
    setStatusFilter(tempStatusFilter)
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setTempStatusFilter("all")
    setStatusFilter("all")
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const handleSaveProvider = async (providerData: AddProviderFormData) => {
    try {
      const payload = mapFormDataToPayload(providerData)

      if (editingProviderId) {
        await updateProviderMutation.mutateAsync({
          id: editingProviderId,
          providerData: payload,
        })
        success("Provider updated", "The provider details have been saved.")
      } else {
        await createProviderMutation.mutateAsync(payload)
        success("Provider created", "The new provider has been added.")
      }

      setShowAddProviderForm(false)
      setEditingProviderId(null)
    } catch (saveError) {
      showError("Unable to save provider", getErrorMessage(saveError, "Please try again."))
      throw saveError
    }
  }

  if (showAddProviderForm || editingProviderId) {
    if (editingProviderId && isEditLoading) {
      return (
        <div className="flex h-screen flex-col">
          <TopBar />
          <div className="flex flex-1 items-center justify-center bg-gray-50 pt-[100px]">
            <p className="text-sm text-gray-500">Loading provider details...</p>
          </div>
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      )
    }

    const editingProvider = editingProviderResponse?.data

    return (
      <>
        <AddProviderForm
          isEdit={!!editingProviderId}
          initialData={
            editingProvider
              ? {
                  providerName: editingProvider.provider_name,
                  email: editingProvider.email,
                  mobileNumber: editingProvider.mobile_number,
                  websiteUrl: editingProvider.website_url || "",
                  location: editingProvider.location,
                  industryType: editingProvider.industry_type || "",
                  companySize: editingProvider.company_size || "",
                  companyLogo: null,
                }
              : undefined
          }
          currentLogoUrl={editingProvider?.company_logo}
          onBack={() => {
            setShowAddProviderForm(false)
            setEditingProviderId(null)
          }}
          onSave={handleSaveProvider}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  if (selectedProviderId) {
    return (
      <>
        <JobProviderDetails
          providerId={selectedProviderId}
          onBack={() => setSelectedProviderId(null)}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex-1 overflow-y-auto bg-gray-50 pt-[100px] pr-8 pb-8 pl-0">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-medium text-[#161616]">Job Providers</h1>
          </div>

          <Button
            onClick={() => setShowAddProviderForm(true)}
            className="h-11 rounded-full bg-[#111111] px-5 text-white hover:bg-[#222222]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Provider
          </Button>
        </div>

        <JobProviderSummaryCards
          totalProviders={totalProviders}
          activeProviders={activeProviders}
          activeJobs={totalActiveJobs}
          totalApplicants={totalApplicants}
        />

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {getErrorMessage(error, "Failed to load job providers.")}
          </div>
        )}

        <JobProvidersTable
          providers={tableProviders}
          totalCount={totalCount}
          currentPage={safeCurrentPage}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value)
            setCurrentPage(1)
          }}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value)
            setCurrentPage(1)
          }}
          onPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNextPage={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          onOpenFilter={handleOpenFilter}
          onViewProvider={(provider) => setSelectedProviderId(provider.id)}
          onEditProvider={(provider) => setEditingProviderId(provider.id)}
        />

        {isLoading && (
          <p className="mt-4 text-sm text-gray-500">Loading providers...</p>
        )}

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
                    x
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={tempStatusFilter}
                      onChange={(event) =>
                        setTempStatusFilter(event.target.value as JobProviderStatusFilter)
                      }
                      className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 bg-white p-6">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="flex-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
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
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
