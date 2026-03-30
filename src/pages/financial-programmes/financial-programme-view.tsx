import { useDeferredValue, useEffect, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Trash2,
  Plus,
} from "lucide-react"
import { TopBar } from "@/components/custom/top-bar"
import {
  AddCompletedProgrammeView,
  AddMedicalCampaignView,
  CampaignDetailView,
  HousingProjectView,
  RequestDetailView,
} from "@/components/custom/financialProgrammes"
import { ConfirmationModal } from "@/components/custom/confirmation-modal"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ToastContainer } from "@/components/ui/toast"
import {
  useCreateFinancialProgrammeCampaign,
  useCreateFinancialProgrammeHousingProject,
  useDeleteFinancialProgrammeCampaign,
  useDeleteFinancialProgrammeDonation,
  useDeleteFinancialProgrammeHousingProject,
  useDeleteFinancialProgrammeReferral,
  useDeleteFinancialProgrammeRequest,
  useFinancialProgrammeCampaigns,
  useFinancialProgramme,
  useFinancialProgrammeDonations,
  useFinancialProgrammeHousingProjects,
  useFinancialProgrammeReferrals,
  useFinancialProgrammeRequests,
  useUpdateFinancialProgrammeCampaign,
  useUpdateFinancialProgrammeHousingProject,
} from "@/hooks/useFinancialProgrammes"
import { useToast } from "@/hooks/useToast"
import { useUpload } from "@/hooks/useUpload"
import type {
  FinancialProgrammeCampaign,
  FinancialProgrammeDonation,
  FinancialProgrammeEntryQueryParams,
  FinancialProgrammeHousingProject,
  FinancialProgrammeHousingProjectStatus,
  FinancialProgrammeReferral,
  FinancialProgrammeRequest,
} from "@/types/financial-programme"

type ActiveTab = "requests" | "referrals" | "campaigns" | "donations" | "housingProjects"
type DeleteTargetType =
  | "request"
  | "referral"
  | "campaign"
  | "donation"
  | "housingProject"

interface DeleteTarget {
  id: string
  type: DeleteTargetType
  label: string
}

interface HousingProjectFilters {
  status?: FinancialProgrammeHousingProjectStatus
}

interface ViewProgrammeProps {
  onEdit: (programmeId: string) => void
  programmeId: string
}

const getHousingStatusClasses = (status?: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-600"
    case "In Progress":
      return "bg-blue-100 text-blue-600"
    default:
      return "bg-cyan-100 text-cyan-600"
  }
}

const formatDate = (value?: string) => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB")
}

const getMedicalCampaignStatusClasses = (status?: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-600"
    case "Fund Allocated":
      return "bg-cyan-100 text-cyan-600"
    default:
      return "bg-blue-100 text-blue-600"
  }
}

export function FinancialProgrammeView({
  onEdit,
  programmeId,
}: ViewProgrammeProps) {
  const { toasts, removeToast, success, error: showError } = useToast()
  const [activeTab, setActiveTab] = useState<ActiveTab>("requests")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [housingProjectFilters, setHousingProjectFilters] =
    useState<HousingProjectFilters>({})
  const [draftHousingProjectFilters, setDraftHousingProjectFilters] =
    useState<HousingProjectFilters>({})
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [selectedRequest, setSelectedRequest] =
    useState<FinancialProgrammeRequest | null>(null)
  const [selectedHousingProject, setSelectedHousingProject] =
    useState<FinancialProgrammeHousingProject | null>(null)
  const [selectedCampaign, setSelectedCampaign] =
    useState<FinancialProgrammeCampaign | null>(null)
  const [isAddingHousingProject, setIsAddingHousingProject] = useState(false)
  const [isAddingMedicalCampaign, setIsAddingMedicalCampaign] = useState(false)
  const [editingMedicalCampaign, setEditingMedicalCampaign] =
    useState<FinancialProgrammeCampaign | null>(null)
  const [editingHousingProject, setEditingHousingProject] =
    useState<FinancialProgrammeHousingProject | null>(null)
  const deferredSearch = useDeferredValue(searchTerm)
  const { uploadFile, uploadState, resetUploadState } = useUpload()

  const entryParams: FinancialProgrammeEntryQueryParams = useMemo(
    () => ({
      page_no: currentPage,
      limit: rowsPerPage,
      search: deferredSearch || undefined,
      status:
        activeTab === "housingProjects"
          ? housingProjectFilters.status
          : undefined,
    }),
    [activeTab, currentPage, deferredSearch, housingProjectFilters.status, rowsPerPage]
  )

  const programmeQuery = useFinancialProgramme(programmeId)
  const requestsQuery = useFinancialProgrammeRequests(programmeId, entryParams)
  const referralsQuery = useFinancialProgrammeReferrals(programmeId, entryParams)
  const campaignsQuery = useFinancialProgrammeCampaigns(programmeId, entryParams)
  const donationsQuery = useFinancialProgrammeDonations(programmeId, entryParams)
  const housingProjectsQuery = useFinancialProgrammeHousingProjects(
    programmeId,
    entryParams
  )
  const createHousingProjectMutation =
    useCreateFinancialProgrammeHousingProject(programmeId)
  const createCampaignMutation = useCreateFinancialProgrammeCampaign(programmeId)
  const deleteRequestMutation = useDeleteFinancialProgrammeRequest(programmeId)
  const deleteReferralMutation = useDeleteFinancialProgrammeReferral(programmeId)
  const deleteCampaignMutation = useDeleteFinancialProgrammeCampaign(programmeId)
  const deleteDonationMutation = useDeleteFinancialProgrammeDonation(programmeId)
  const deleteHousingProjectMutation =
    useDeleteFinancialProgrammeHousingProject(programmeId)
  const updateHousingProjectMutation =
    useUpdateFinancialProgrammeHousingProject(programmeId)
  const updateCampaignMutation = useUpdateFinancialProgrammeCampaign(programmeId)

  const programme = programmeQuery.data?.data
  const isMedicalProgramme = programme?.type === "medical"

  useEffect(() => {
    if (isMedicalProgramme && activeTab === "housingProjects") {
      setActiveTab("requests")
      setCurrentPage(1)
      setSearchTerm("")
      setShowFilterModal(false)
    }
  }, [activeTab, isMedicalProgramme])

  const activeDataset = useMemo(() => {
    switch (activeTab) {
      case "requests":
        return requestsQuery
      case "referrals":
        return referralsQuery
      case "campaigns":
        return campaignsQuery
      case "donations":
        return donationsQuery
      case "housingProjects":
        return housingProjectsQuery
    }
  }, [
    activeTab,
    campaignsQuery,
    donationsQuery,
    housingProjectsQuery,
    referralsQuery,
    requestsQuery,
  ])

  const rows = activeDataset.data?.data ?? []
  const totalCount = activeDataset.data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const isDeletePending =
    deleteRequestMutation.isPending ||
    deleteReferralMutation.isPending ||
    deleteCampaignMutation.isPending ||
    deleteDonationMutation.isPending ||
    deleteHousingProjectMutation.isPending

  const openDeleteModal = (target: DeleteTarget) => {
    setDeleteTarget(target)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      if (deleteTarget.type === "request") {
        await deleteRequestMutation.mutateAsync(deleteTarget.id)
        success("Success", "Request deleted successfully")
      } else if (deleteTarget.type === "referral") {
        await deleteReferralMutation.mutateAsync(deleteTarget.id)
        success("Success", "Referral deleted successfully")
      } else if (deleteTarget.type === "campaign") {
        await deleteCampaignMutation.mutateAsync(deleteTarget.id)
        success("Success", "Campaign deleted successfully")
      } else if (deleteTarget.type === "donation") {
        await deleteDonationMutation.mutateAsync(deleteTarget.id)
        success("Success", "Donation deleted successfully")
      } else {
        await deleteHousingProjectMutation.mutateAsync(deleteTarget.id)
        success("Success", "Housing project deleted successfully")
        if (selectedHousingProject?._id === deleteTarget.id) {
          setSelectedHousingProject(null)
        }
      }

      if (rows.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }

      setDeleteTarget(null)
    } catch {
      showError("Error", `Failed to delete ${deleteTarget.label}`)
    }
  }

  const deleteModalTitle = deleteTarget
    ? `Delete ${deleteTarget.label.charAt(0).toUpperCase()}${deleteTarget.label.slice(1)}`
    : "Delete Item"

  const visibleTabs: Array<{ value: ActiveTab; label: string }> = isMedicalProgramme
    ? [
        { value: "requests", label: "Requests" },
        { value: "donations", label: "Donations" },
        { value: "campaigns", label: "Campaigns" },
      ]
    : [
        { value: "requests", label: "Requests" },
        { value: "referrals", label: "Referrals" },
        { value: "donations", label: "Donation Requests" },
        { value: "housingProjects", label: "Housing Projects" },
      ]

  if (selectedRequest && programme) {
    return (
      <RequestDetailView
        data={selectedRequest}
        programmeName={programme.programme}
        onBack={() => setSelectedRequest(null)}
      />
    )
  }

  if (selectedCampaign && programme) {
    return (
      <CampaignDetailView
        data={selectedCampaign}
        programmeName={programme.programme}
        onBack={() => setSelectedCampaign(null)}
      />
    )
  }

  if (isAddingHousingProject && programme) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <AddCompletedProgrammeView
          programmeName={programme.programme}
          onBack={() => {
            resetUploadState()
            setIsAddingHousingProject(false)
          }}
          isSaving={
            createHousingProjectMutation.isPending || uploadState.isUploading
          }
          onSave={async (data) => {
            try {
              let uploadedPhotoUrl: string | undefined

              if (data.file) {
                const uploadResult = await uploadFile(
                  data.file,
                  "financial-programmes"
                )
                uploadedPhotoUrl = uploadResult.data.url
              }

              await createHousingProjectMutation.mutateAsync({
                house_id: data.house_id,
                location: data.location,
                beneficiary: data.beneficiary,
                status: data.status,
                photos: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
              })

              success("Success", "Housing project created successfully")
              resetUploadState()
              setIsAddingHousingProject(false)
            } catch {
              showError("Error", "Failed to create housing project")
            }
          }}
        />
      </>
    )
  }

  if ((isAddingMedicalCampaign || editingMedicalCampaign) && programme) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <AddMedicalCampaignView
          programmeName={programme.programme}
          title={editingMedicalCampaign ? "Edit Campaign" : "Add Campaign"}
          saveLabel={editingMedicalCampaign ? "Update" : "Save"}
          initialData={
            editingMedicalCampaign
              ? {
                  campaign_name: editingMedicalCampaign.campaign_name,
                  short_description: editingMedicalCampaign.short_description,
                  description: editingMedicalCampaign.description,
                  start_date: editingMedicalCampaign.start_date?.slice(0, 10) || "",
                  end_date: editingMedicalCampaign.end_date?.slice(0, 10) || "",
                  beneficiary_name: editingMedicalCampaign.beneficiary_name,
                  beneficiary_location: editingMedicalCampaign.beneficiary_location,
                  campaign_status:
                    editingMedicalCampaign.status || "Fund Allocated",
                  amount_raised: String(editingMedicalCampaign.amount_raised ?? ""),
                  imageUrl: editingMedicalCampaign.cover_image,
                }
              : undefined
          }
          onBack={() => {
            resetUploadState()
            setIsAddingMedicalCampaign(false)
            setEditingMedicalCampaign(null)
          }}
          isSaving={
            createCampaignMutation.isPending ||
            updateCampaignMutation.isPending ||
            uploadState.isUploading
          }
          onSave={async (data) => {
            try {
              let uploadedImageUrl = editingMedicalCampaign?.cover_image

              if (data.file) {
                const uploadResult = await uploadFile(
                  data.file,
                  "financial-programmes"
                )
                uploadedImageUrl = uploadResult.data.url
              }

              if (!uploadedImageUrl) {
                throw new Error("Campaign image is required")
              }

              const payload = {
                campaign_name: data.campaign_name,
                short_description: data.short_description,
                description: data.description,
                start_date: data.start_date,
                end_date: data.end_date,
                beneficiary_name: data.beneficiary_name,
                beneficiary_location: data.beneficiary_location,
                status: data.campaign_status,
                amount_raised: Number(data.amount_raised),
                cover_image: uploadedImageUrl,
              }

              if (editingMedicalCampaign) {
                await updateCampaignMutation.mutateAsync({
                  campaignId: editingMedicalCampaign._id,
                  data: payload,
                })
                success("Success", "Campaign updated successfully")
              } else {
                await createCampaignMutation.mutateAsync(payload)
                success("Success", "Campaign created successfully")
              }

              resetUploadState()
              setIsAddingMedicalCampaign(false)
              setEditingMedicalCampaign(null)
            } catch {
              showError(
                "Error",
                editingMedicalCampaign
                  ? "Failed to update campaign"
                  : "Failed to create campaign"
              )
            }
          }}
        />
      </>
    )
  }

  if (editingHousingProject && programme) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <AddCompletedProgrammeView
          programmeName={programme.programme}
          title="Edit Completed Programme"
          saveLabel="Update"
          initialData={{
            house_id: editingHousingProject.house_id,
            location: editingHousingProject.location,
            beneficiary: editingHousingProject.beneficiary,
            status: editingHousingProject.status ?? "Fund Allocated",
            imageUrl: editingHousingProject.photos?.[0],
          }}
          onBack={() => {
            resetUploadState()
            setEditingHousingProject(null)
          }}
          isSaving={
            updateHousingProjectMutation.isPending || uploadState.isUploading
          }
          onSave={async (data) => {
            try {
              let updatedPhotos = editingHousingProject.photos ?? []

              if (data.file) {
                const uploadResult = await uploadFile(
                  data.file,
                  "financial-programmes"
                )
                updatedPhotos = [uploadResult.data.url]
              }

              await updateHousingProjectMutation.mutateAsync({
                housingProjectId: editingHousingProject._id,
                data: {
                  house_id: data.house_id,
                  location: data.location,
                  beneficiary: data.beneficiary,
                  status: data.status,
                  photos: updatedPhotos,
                },
              })

              success("Success", "Housing project updated successfully")
              resetUploadState()
              setEditingHousingProject(null)
            } catch {
              showError("Error", "Failed to update housing project")
            }
          }}
        />
      </>
    )
  }

  const handleDownloadCSV = () => {
    if (rows.length === 0) return

    let headers: string[] = []
    let csvRows: string[][] = []

    if (activeTab === "requests") {
      headers = ["Name", "Date of Birth", "Gender", "Phone Number", "Current Address", "Current District", "Employment Status", "Monthly Income", "Family Members", "Details of Situation", "Status", "Date"]
      csvRows = (rows as FinancialProgrammeRequest[]).map((r) => [
        r.name,
        r.date_of_birth ? formatDate(r.date_of_birth) : "-",
        r.gender || "-",
        r.phone_number,
        r.current_address,
        r.current_district || "-",
        r.employment_status || "-",
        r.monthly_income || "-",
        String(r.family_members ?? "-"),
        r.details_of_situation,
        r.status || "-",
        formatDate(r.createdAt),
      ])
    } else if (activeTab === "referrals") {
      headers = ["Person in Need", "Phone Number", "Location", "Referrer Name", "Referrer Phone", "Notes", "Status", "Date"]
      csvRows = (rows as FinancialProgrammeReferral[]).map((r) => [
        r.name,
        r.phone,
        r.location,
        r.referrer_name || "-",
        r.referrer_phone || "-",
        r.notes || "-",
        r.status || "-",
        formatDate(r.createdAt),
      ])
    } else if (activeTab === "donations") {
      headers = ["Name", "Phone Number", "Message", "Donated Amount", "Currency", "Status", "Date"]
      csvRows = (rows as FinancialProgrammeDonation[]).map((r) => [
        r.name,
        r.phone_number,
        r.message || "-",
        String(r.donated_amount ?? "-"),
        r.currency || "-",
        r.status || "-",
        formatDate(r.createdAt),
      ])
    } else {
      headers = ["House ID", "Beneficiary", "Location", "Status", "Date"]
      csvRows = (rows as FinancialProgrammeHousingProject[]).map((r) => [
        r.house_id,
        r.beneficiary,
        r.location,
        r.status || "-",
        formatDate(r.createdAt),
      ])
    }

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`
    const csv = [headers, ...csvRows].map((row) => row.map(escape).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const tabLabel = activeTab === "housingProjects" ? "housing_projects" : activeTab
    link.href = url
    link.download = `${programme?.programme || "programme"}_${tabLabel}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const statCards = isMedicalProgramme
    ? [
        {
          label: "Total Campaigns",
          value: String(programme?.campaigns ?? 0),
          bgColor: "bg-[#F1F0FF]",
        },
        {
          label: "Active Campaigns",
          value: String(programme?.active_campaigns ?? 0),
          bgColor: "bg-[#EAF5FF]",
        },
        {
          label: "Requests",
          value: String(programme?.requests ?? 0),
          bgColor: "bg-[#F1F0FF]",
        },
        {
          label: "Total Donations",
          value: String(programme?.donations ?? 0),
          bgColor: "bg-[#EAF5FF]",
        },
      ]
    : [
        {
          label: "Goal",
          value: programme?.goal || "-",
          bgColor: "bg-[#EDEEFC]",
        },
        {
          label: "Progress",
          value: String(programme?.completed_housing_projects ?? 0),
          bgColor: "bg-[#E6F1FD]",
        },
        {
          label: "Requests",
          value: String(programme?.requests ?? 0),
          bgColor: "bg-[#EDEEFC]",
        },
        {
          label: "Referrals",
          value: String(programme?.referrals ?? 0),
          bgColor: "bg-[#E6F1FD]",
        },
        {
          label: "Donation Requests",
          value: String(programme?.donations ?? 0),
          bgColor: "bg-[#EDEEFC]",
        },
      ]

  const searchPlaceholder = isMedicalProgramme
    ? activeTab === "requests"
      ? "Search members"
      : activeTab === "donations"
      ? "Search donations"
      : activeTab === "campaigns"
      ? "Search campaigns"
      : "Search referrals"
    : activeTab === "housingProjects"
    ? "Search by house ID, location, beneficiary"
    : activeTab === "requests"
    ? "Search by name, phone, address"
    : activeTab === "referrals"
    ? "Search by name, phone, location"
    : "Search by donor name, phone, message"

  const emptyStateLabel =
    activeTab === "housingProjects"
      ? "housing projects"
      : isMedicalProgramme && activeTab === "campaigns"
      ? "campaigns"
      : activeTab

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex h-screen min-w-0 flex-col overflow-hidden">
        <TopBar />

        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-gray-50 p-8 pt-[100px]">
          <div className="mb-8 flex min-w-0 max-w-full items-center justify-between gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <button
                type="button"
                onClick={() => onEdit(programmeId)}
                className="hover:text-gray-900"
              >
                Financial Programmes
              </button>
              <span className="mx-2">{">"}</span>
              <span className="font-medium text-gray-900">
                {programme?.programme || "Loading..."}
              </span>
            </div>

            {programme && (
              <>
                {!isMedicalProgramme && activeTab === "housingProjects" && (
                  <Button
                    onClick={() => setIsAddingHousingProject(true)}
                    className="rounded-full bg-black px-5 text-white hover:bg-gray-800"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Completed Programme
                  </Button>
                )}
                {isMedicalProgramme && activeTab === "campaigns" && (
                  <Button
                    onClick={() => {
                      setEditingMedicalCampaign(null)
                      setIsAddingMedicalCampaign(true)
                    }}
                    className="rounded-full bg-black px-5 text-white hover:bg-gray-800"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Campaign
                  </Button>
                )}
              </>
            )}
          </div>

          {programmeQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : programmeQuery.isError || !programme ? (
            <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-500">
              Failed to load this financial programme.
            </div>
          ) : (
            <>
              <div
                className={`mb-8 grid w-full max-w-full grid-cols-1 gap-4 ${
                  isMedicalProgramme ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-5"
                }`}
              >
                {statCards.map((stat) => (
                  <div
                    key={stat.label}
                    className={`${stat.bgColor} min-w-0 rounded-2xl p-4`}
                  >
                    <p className="mb-2 text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-8 min-w-0 max-w-full">
                <div className="flex min-w-0 items-center gap-8 border-b border-gray-200">
                  {visibleTabs.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setActiveTab(value)
                        setCurrentPage(1)
                        setSearchTerm("")
                        setShowFilterModal(false)
                      }}
                      className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                        activeTab === value
                          ? "border-blue-500 text-blue-500"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 p-6">
                  <div className="flex min-w-0 max-w-full justify-end gap-3">
                    <div className="relative w-80 max-w-full">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className={`rounded-full border-[#B3B3B3] pl-10 focus:border-[#B3B3B3] ${
                          isMedicalProgramme ? "bg-[#F7F7F7]" : ""
                        }`}
                      />
                    </div>
                    {!isMedicalProgramme && (
                      <Button
                        onClick={handleDownloadCSV}
                        disabled={rows.length === 0}
                        className="h-9 whitespace-nowrap rounded-full bg-black px-4 text-sm text-white hover:bg-gray-800"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                    {!isMedicalProgramme && activeTab === "housingProjects" && (
                      <Button
                        variant="outline"
                        className="ml-4 rounded-lg border-[#B3B3B3] hover:border-[#B3B3B3]"
                        onClick={() => {
                          setDraftHousingProjectFilters(housingProjectFilters)
                          setShowFilterModal(true)
                        }}
                      >
                        <SlidersHorizontal className="h-4 w-4 text-[#B3B3B3]" />
                      </Button>
                    )}
                  </div>
                </div>

                {showFilterModal && activeTab === "housingProjects" && (
                  <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50">
                    <div className="flex h-full w-80 flex-col rounded-l-2xl bg-white shadow-lg">
                      <div className="flex-1 p-6">
                        <div className="mb-6 flex items-center justify-between">
                          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilterModal(false)}
                            className="h-8 w-8 p-1"
                          >
                            X
                          </Button>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <select
                            value={draftHousingProjectFilters.status || ""}
                            onChange={(event) =>
                              setDraftHousingProjectFilters((prev) => ({
                                ...prev,
                                status:
                                  (event.target.value as HousingProjectFilters["status"]) ||
                                  undefined,
                              }))
                            }
                            className="w-full rounded-2xl border px-3 py-2 text-sm"
                          >
                            <option value="">All</option>
                            <option value="Fund Allocated">Fund Allocated</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 p-6">
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 rounded-2xl"
                            onClick={() => {
                              setHousingProjectFilters({})
                              setDraftHousingProjectFilters({})
                              setCurrentPage(1)
                              setShowFilterModal(false)
                            }}
                          >
                            Reset
                          </Button>
                          <Button
                            className="flex-1 rounded-2xl bg-black text-white hover:bg-gray-800"
                            onClick={() => {
                              setHousingProjectFilters(draftHousingProjectFilters)
                              setCurrentPage(1)
                              setShowFilterModal(false)
                            }}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDataset.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : activeDataset.isError ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-red-500">
                      Failed to load {activeTab}.
                    </p>
                  </div>
                ) : rows.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-gray-500">
                      No {emptyStateLabel} found.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-full">
                      <table className="w-full">
                        <thead className="bg-white">
                          <tr>
                            {activeTab === "requests" && (
                              <>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Name
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  DOB
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Current Address
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Current District
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Phone Number
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Description
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Supporting Photo
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Action
                                </th>
                              </>
                            )}
                            {activeTab === "referrals" && (
                              <>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Person in Need
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Phone Number
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Location
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Action
                                </th>
                              </>
                            )}
                            {activeTab === "campaigns" && (
                              <>
                                <th className="w-[14%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  Campaign Name
                                </th>
                                <th className="w-[13%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  Short Description
                                </th>
                                <th className="w-[13%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  Description
                                </th>
                                <th className="w-[9%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  Start Date
                                </th>
                                <th className="w-[9%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  End Date
                                </th>
                                <th className="w-[10%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  Amount Raised
                                </th>
                                <th className="w-[11%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  Beneficiary Name
                                </th>
                                <th className="w-[11%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  Beneficiary Location
                                </th>
                                <th className="w-[5%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  Image
                                </th>
                                <th className="w-[8%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  Status
                                </th>
                                <th className="w-[7%] px-4 py-4 text-left text-sm font-medium text-gray-600">
                                  Action
                                </th>
                              </>
                            )}
                            {activeTab === "donations" && (
                              <>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Name
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Phone Number
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Message
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Action
                                </th>
                              </>
                            )}
                            {activeTab === "housingProjects" && (
                              <>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  House ID
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Location
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Beneficiary
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Status
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Image
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                                  Action
                                </th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {activeTab === "requests" &&
                            (rows as FinancialProgrammeRequest[]).map((item) => (
                              <tr
                                key={item._id}
                                className="border-t border-gray-200 transition-colors hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {formatDate(item.date_of_birth)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {item.current_address}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {item.current_district || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {item.phone_number}
                                </td>
                                <td className="max-w-[220px] px-6 py-4 text-sm text-gray-700">
                                  <p className="max-w-[220px] overflow-hidden text-ellipsis whitespace-normal">
                                    {item.details_of_situation}
                                  </p>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    {(item.supporting_photos ?? [])
                                      .slice(0, 2)
                                      .map((photo, index) => (
                                        <div
                                          key={`${item._id}-photo-${index}`}
                                          className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100"
                                        >
                                          <img
                                            src={photo}
                                            alt={`${item.name} supporting photo ${index + 1}`}
                                            className="h-full w-full object-cover"
                                          />
                                        </div>
                                      ))}
                                    {(item.supporting_photos ?? []).length === 0 && (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-1"
                                      onClick={() => setSelectedRequest(item)}
                                    >
                                      <Eye className="h-4 w-4 text-gray-400" />
                                    </Button>
                                    <DropdownMenu
                                      trigger={
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-1"
                                        >
                                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                        </Button>
                                      }
                                      className="w-36"
                                    >
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-600"
                                        onClick={() =>
                                          openDeleteModal({
                                            id: item._id,
                                            type: "request",
                                            label: "request",
                                          })
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenu>
                                  </div>
                                </td>
                              </tr>
                            ))}

                          {activeTab === "referrals" &&
                            (rows as FinancialProgrammeReferral[]).map((item) => (
                              <tr
                                key={item._id}
                                className="border-t border-gray-200 transition-colors hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{item.phone}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {item.location}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <DropdownMenu
                                    trigger={
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-1"
                                      >
                                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                      </Button>
                                    }
                                    className="w-36"
                                  >
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-600"
                                      onClick={() =>
                                        openDeleteModal({
                                          id: item._id,
                                          type: "referral",
                                          label: "referral",
                                        })
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}

                          {activeTab === "campaigns" &&
                            (rows as FinancialProgrammeCampaign[]).map((item) => (
                              <tr
                                key={item._id}
                                className="border-t border-gray-200 transition-colors hover:bg-gray-50"
                              >
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                  <p className="line-clamp-2 break-words">
                                    {item.campaign_name}
                                  </p>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                  <p className="line-clamp-2 break-words">
                                    {item.short_description}
                                  </p>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                  <p className="line-clamp-2 break-words">
                                    {item.description}
                                  </p>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                  {formatDate(item.start_date)}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                  {formatDate(item.end_date)}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                  ₹{Number(item.amount_raised || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900">
                                  <p className="break-words">{item.beneficiary_name}</p>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                  <p className="break-words">{item.beneficiary_location}</p>
                                </td>
                                <td className="px-4 py-4 text-sm">
                                  {item.cover_image ? (
                                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                                      <img
                                        src={item.cover_image}
                                        alt={item.campaign_name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-sm">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getMedicalCampaignStatusClasses(
                                      item.status
                                    )}`}
                                  >
                                    {item.status || "-"}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-1"
                                      onClick={() => setSelectedCampaign(item)}
                                    >
                                      <Eye className="h-4 w-4 text-gray-400" />
                                    </Button>
                                    <DropdownMenu
                                      trigger={
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-1"
                                        >
                                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                        </Button>
                                      }
                                      className="w-36"
                                    >
                                      <DropdownMenuItem
                                        className="flex items-center gap-2"
                                        onClick={() => setEditingMedicalCampaign(item)}
                                      >
                                        <Eye className="h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-600"
                                        onClick={() =>
                                          openDeleteModal({
                                            id: item._id,
                                            type: "campaign",
                                            label: "campaign",
                                          })
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenu>
                                  </div>
                                </td>
                              </tr>
                            ))}

                          {activeTab === "donations" &&
                            (rows as FinancialProgrammeDonation[]).map((item) => (
                              <tr
                                key={item._id}
                                className="border-t border-gray-200 transition-colors hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {item.phone_number}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {item.message || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <DropdownMenu
                                    trigger={
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-1"
                                      >
                                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                      </Button>
                                    }
                                    className="w-36"
                                  >
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-600"
                                      onClick={() =>
                                        openDeleteModal({
                                          id: item._id,
                                          type: "donation",
                                          label: "donation",
                                        })
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}

                          {activeTab === "housingProjects" &&
                            (rows as FinancialProgrammeHousingProject[]).map((item) => (
                              <tr
                                key={item._id}
                                className="border-t border-gray-200 transition-colors hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {item.house_id}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {item.location}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {item.beneficiary}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getHousingStatusClasses(
                                      item.status
                                    )}`}
                                  >
                                    {item.status || "-"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    {(item.photos ?? []).slice(0, 1).map((photo, index) => (
                                      <div
                                        key={`${item._id}-housing-photo-${index}`}
                                        className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100"
                                      >
                                        <img
                                          src={photo}
                                          alt={`${item.house_id} preview ${index + 1}`}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    ))}
                                    {(item.photos ?? []).length === 0 && (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-1"
                                      onClick={() => setSelectedHousingProject(item)}
                                    >
                                      <Eye className="h-4 w-4 text-gray-400" />
                                    </Button>
                                    <DropdownMenu
                                      trigger={
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-1"
                                        >
                                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                        </Button>
                                      }
                                      className="w-36"
                                    >
                                      <DropdownMenuItem
                                        className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-600"
                                        onClick={() =>
                                          openDeleteModal({
                                            id: item._id,
                                            type: "housingProject",
                                            label: "housing project",
                                          })
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenu>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>

                    <div className="flex min-w-0 items-center justify-between border-t border-gray-200 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                          value={rowsPerPage}
                          onChange={(event) => {
                            setRowsPerPage(Number(event.target.value))
                            setCurrentPage(1)
                          }}
                          className="rounded border border-gray-300 px-2 py-1 text-sm"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {totalCount === 0
                            ? "0-0 of 0"
                            : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                                currentPage * rowsPerPage,
                                totalCount
                              )} of ${totalCount}`}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-1"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-1"
                            onClick={() =>
                              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                            }
                            disabled={currentPage >= totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedHousingProject && (
        <HousingProjectView
          data={selectedHousingProject}
          onClose={() => setSelectedHousingProject(null)}
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteModalTitle}
        message={`Are you sure you want to delete this ${deleteTarget?.label || "item"}?`}
        confirmText={isDeletePending ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        disabled={isDeletePending}
      />
    </>
  )
}
