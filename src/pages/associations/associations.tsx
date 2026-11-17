import { useState, useDeferredValue, useMemo } from "react"
import {
  Plus,
  Search,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Eye,
  PenLine,
  Trash2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RotateCcw,
} from "lucide-react"
import { TopBar } from "@/components/custom/top-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ConfirmationModal } from "@/components/custom/confirmation-modal"
import { AddAssociationModal, ViewAssociationModal } from "@/components/custom/associations"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import {
  useAssociations,
  useAssociationStats,
  useCreateAssociation,
  useUpdateAssociation,
  useUpdateAssociationStatus,
  useDeleteAssociation,
} from "@/hooks/useAssociations"
import type {
  Association,
  AssociationFormData,
  AssociationStatus,
} from "@/types/association"

const CATEGORIES = [
  "All",
  "Residents' Association",
  "Arts & Culture",
  "Environment & Sustainability",
  "Pravasi Association",
  "Charitable Trust",
  "Alumni",
  "Professional",
  "Youth & Sports",
  "Cultural",
  "Literature & Discussion",
  "Other",
]

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
]

export function AssociationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const deferredSearch = useDeferredValue(searchTerm)
  const { toasts, removeToast, success, error: showError } = useToast()

  const queryParams = useMemo(
    () => ({
      page_no: currentPage,
      limit: rowsPerPage,
      ...(deferredSearch.trim() ? { search: deferredSearch.trim() } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter as AssociationStatus } : {}),
      ...(categoryFilter !== "All" ? { category: categoryFilter } : {}),
    }),
    [currentPage, rowsPerPage, deferredSearch, statusFilter, categoryFilter]
  )

  const { data: associationsResponse, isLoading } = useAssociations(queryParams)
  const { data: statsResponse } = useAssociationStats()

  const createMutation = useCreateAssociation()
  const updateMutation = useUpdateAssociation()
  const statusMutation = useUpdateAssociationStatus()
  const deleteMutation = useDeleteAssociation()

  const associations = associationsResponse?.data?.data || []
  const totalCount = associationsResponse?.data?.total_count || 0
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const pageEnd = Math.min(currentPage * rowsPerPage, totalCount)
  const stats = statsResponse?.data

  const handleOpenAdd = () => {
    setSelectedAssociation(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEdit = (assoc: Association) => {
    setSelectedAssociation(assoc)
    setIsEditModalOpen(true)
  }

  const handleOpenView = (assoc: Association) => {
    setSelectedAssociation(assoc)
    setIsViewModalOpen(true)
  }

  const handleOpenDelete = (assoc: Association) => {
    setSelectedAssociation(assoc)
    setIsDeleteModalOpen(true)
  }

  const handleOpenApprove = (assoc: Association) => {
    setSelectedAssociation(assoc)
    setIsApproveModalOpen(true)
  }

  const handleOpenReject = (assoc: Association) => {
    setSelectedAssociation(assoc)
    setRejectReason("")
    setIsRejectModalOpen(true)
  }

  const handleSaveAssociation = async (data: AssociationFormData) => {
    try {
      if (isEditModalOpen && selectedAssociation) {
        await updateMutation.mutateAsync({
          id: selectedAssociation._id,
          data,
        })
        success("Association Updated", "The association details have been successfully updated.")
        setIsEditModalOpen(false)
      } else {
        await createMutation.mutateAsync(data)
        success("Association Created", "New association has been created successfully.")
        setIsAddModalOpen(false)
      }
      setSelectedAssociation(null)
    } catch (err: any) {
      showError("Action Failed", err?.response?.data?.message || "Failed to save association details.")
    }
  }

  const handleConfirmApprove = async () => {
    if (!selectedAssociation) return
    try {
      await statusMutation.mutateAsync({
        id: selectedAssociation._id,
        payload: {
          status: "active",
        },
      })
      success("Association Approved", `"${selectedAssociation.name?.en}" is now active.`)
      setIsApproveModalOpen(false)
      if (isViewModalOpen) setIsViewModalOpen(false)
      setSelectedAssociation(null)
    } catch (err: any) {
      showError("Approval Failed", err?.response?.data?.message || "Unable to approve association.")
    }
  }

  const handleConfirmReject = async () => {
    if (!selectedAssociation) return
    try {
      await statusMutation.mutateAsync({
        id: selectedAssociation._id,
        payload: {
          status: "rejected",
          rejection_reason: rejectReason.trim() || undefined,
        },
      })
      success("Association Rejected", `"${selectedAssociation.name?.en}" status set to rejected.`)
      setIsRejectModalOpen(false)
      if (isViewModalOpen) setIsViewModalOpen(false)
      setSelectedAssociation(null)
    } catch (err: any) {
      showError("Action Failed", err?.response?.data?.message || "Unable to reject association.")
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedAssociation) return
    try {
      await deleteMutation.mutateAsync(selectedAssociation._id)
      success("Association Deleted", "The association was marked as deleted.")
      setIsDeleteModalOpen(false)
      if (isViewModalOpen) setIsViewModalOpen(false)
      setSelectedAssociation(null)
    } catch (err: any) {
      showError("Delete Failed", err?.response?.data?.message || "Unable to delete association.")
    }
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCategoryFilter("All")
    setCurrentPage(1)
  }

  const getStatusBadge = (status: AssociationStatus) => {
    switch (status) {
      case "active":
        return <Badge className="rounded-full bg-[#E6F8ED] px-3 py-1 text-xs text-[#2AA65A] hover:bg-[#E6F8ED]">Active</Badge>
      case "pending":
        return <Badge className="rounded-full bg-[#FFF5E8] px-3 py-1 text-xs text-[#C98A2E] hover:bg-[#FFF5E8]">Pending</Badge>
      case "rejected":
        return <Badge className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-50">Rejected</Badge>
      case "suspended":
        return <Badge className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-600 hover:bg-purple-50">Suspended</Badge>
      case "deleted":
        return <Badge className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 hover:bg-gray-100">Deleted</Badge>
      default:
        return <Badge className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{status}</Badge>
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex-1 overflow-y-auto bg-gray-50 pt-[100px] pr-8 pb-8 pl-0">
        {/* Page Title & Add CTA */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-medium text-[#161616]">Associations</h1>
            <p className="text-xs text-[#717171] mt-0.5">
              Manage residents', cultural, and charitable associations in English &amp; Malayalam
            </p>
          </div>

          <Button
            onClick={handleOpenAdd}
            className="h-11 rounded-full bg-[#111111] px-5 text-white hover:bg-[#222222] shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Association
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#E3E8F3] bg-[#EDEEFC] px-4 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="mb-2 text-sm text-[#4F4F4F]">Total Associations</p>
                <p className="text-[30px] font-semibold leading-none text-[#161616]">
                  {stats?.total ?? 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
                <Building2 className="h-6 w-6 text-[#718EBF]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#FFE8CC] bg-[#FFF5E8] px-4 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="mb-2 text-sm text-[#4F4F4F]">Pending Approval</p>
                <p className="text-[30px] font-semibold leading-none text-[#C98A2E]">
                  {stats?.pending ?? 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
                <Clock className="h-6 w-6 text-[#C98A2E]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D6E6F8] bg-[#E6F1FD] px-4 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="mb-2 text-sm text-[#4F4F4F]">Active Associations</p>
                <p className="text-[30px] font-semibold leading-none text-[#2AA65A]">
                  {stats?.active ?? 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
                <CheckCircle2 className="h-6 w-6 text-[#2AA65A]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E3E8F3] bg-[#EDEEFC] px-4 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="mb-2 text-sm text-[#4F4F4F]">Total Members</p>
                <p className="text-[30px] font-semibold leading-none text-[#161616]">
                  {(stats?.total_members ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
                <Users className="h-6 w-6 text-[#718EBF]" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-[22px] border border-[#ECECEC] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.02)] mb-6">
          <div className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-[#F1F1F1]">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setStatusFilter(filter.value)
                    setCurrentPage(1)
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === filter.value
                      ? "bg-[#111111] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Category Dropdown & Search & Reset */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Category selector */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-10 rounded-full border border-[#B3B3B3] px-3.5 text-xs text-[#303030] bg-white outline-none focus:border-black"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>

              {/* Search box */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search associations..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="rounded-full border-[#B3B3B3] pl-9 text-xs focus:border-black h-10"
                />
              </div>

              {(searchTerm || statusFilter !== "all" || categoryFilter !== "All") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-10 px-3 text-xs text-gray-500 hover:text-black"
                  title="Reset filters"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Associations Table */}
          <div className="overflow-x-auto px-4 pt-2">
            <table className="w-full min-w-[960px] border-separate border-spacing-y-2.5">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#9C9C9C]">Association</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#9C9C9C]">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#9C9C9C]">Location</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-[#9C9C9C]">Reg. No.</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-[#9C9C9C]">Members</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-[#9C9C9C]">Status</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-[#9C9C9C]">Verified</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-[#9C9C9C]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="rounded-2xl bg-[#FAFAFA] px-3 py-12 text-center text-sm text-[#9C9C9C]">
                      Loading associations...
                    </td>
                  </tr>
                ) : associations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="rounded-2xl bg-[#FAFAFA] px-3 py-12 text-center text-sm text-[#9C9C9C]">
                      No associations found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  associations.map((assoc) => {
                    const nameEn = assoc.name?.en || "Untitled"
                    const nameMl = assoc.name?.ml || ""

                    return (
                      <tr
                        key={assoc._id}
                        onClick={() => handleOpenView(assoc)}
                        className="cursor-pointer bg-[#FAFAFA] hover:bg-[#F3F3F3] transition-colors"
                      >
                        {/* Association Name & Monogram */}
                        <td className="rounded-l-2xl px-3 py-3">
                          <div className="flex items-center gap-3">
                            {assoc.logo_image ? (
                              <img
                                src={assoc.logo_image}
                                alt={nameEn}
                                className="h-10 w-10 rounded-xl object-cover border border-gray-200"
                              />
                            ) : (
                              <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                                style={{
                                  background: `linear-gradient(135deg, ${assoc.gradient_start || "#34C0CB"}, ${assoc.gradient_end || "#1A78A3"})`,
                                }}
                              >
                                {assoc.monogram || nameEn.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="max-w-[240px]">
                              <p className="text-sm font-semibold text-[#161616] truncate">{nameEn}</p>
                              {nameMl && (
                                <p className="text-xs text-emerald-800 truncate font-normal">
                                  {nameMl}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-3 py-3 text-xs text-[#303030]">
                          <span className="bg-white border border-gray-200 px-2 py-1 rounded-md text-[11px] font-medium text-gray-700">
                            {assoc.category}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-3 py-3 text-xs text-[#505050]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[140px]" title={`${assoc.location}${assoc.district_name ? `, ${assoc.district_name}` : ""}`}>
                              {assoc.location}
                              {assoc.district_name ? `, ${assoc.district_name}` : ""}
                            </span>
                          </div>
                        </td>

                        {/* Reg No */}
                        <td className="px-3 py-3 text-xs text-[#505050] font-mono">
                          {assoc.registration_number || "—"}
                        </td>

                        {/* Members */}
                        <td className="px-3 py-3 text-xs text-[#303030] text-center font-semibold">
                          {assoc.member_count ?? 0}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 text-center">
                          {getStatusBadge(assoc.status)}
                        </td>

                        {/* Verified */}
                        <td className="px-3 py-3 text-center">
                          {assoc.is_verified ? (
                            <span title="Verified">
                              <ShieldCheck className="h-4 w-4 text-blue-600 inline" />
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="rounded-r-2xl px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {assoc.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleOpenApprove(assoc)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                                  title="Approve"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenReject(assoc)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}

                            <DropdownMenu
                              trigger={
                                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-[#737373] hover:bg-white">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              }
                            >
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-xs"
                                onClick={() => handleOpenView(assoc)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-xs"
                                onClick={() => handleOpenEdit(assoc)}
                              >
                                <PenLine className="h-3.5 w-3.5" />
                                Edit Association
                              </DropdownMenuItem>
                              {assoc.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-green-600"
                                    onClick={() => handleOpenApprove(assoc)}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-600"
                                    onClick={() => handleOpenReject(assoc)}
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-xs text-red-600"
                                onClick={() => handleOpenDelete(assoc)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col gap-3 border-t border-[#F1F1F1] px-5 py-4 md:flex-row md:items-center md:justify-end">
            <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="rounded-md border border-[#E5E5E5] px-2 py-1 text-xs text-[#303030] outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#6B6B6B]">
              <span>
                {pageStart}-{pageEnd} of {totalCount}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={pageEnd >= totalCount}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Association Modal */}
      <AddAssociationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAssociation}
      />

      {/* Edit Association Modal */}
      <AddAssociationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedAssociation(null)
        }}
        onSave={handleSaveAssociation}
        initialData={selectedAssociation}
        isEditing={true}
      />

      {/* View Association Modal */}
      <ViewAssociationModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedAssociation(null)
        }}
        association={selectedAssociation}
        onEdit={(assoc) => {
          setIsViewModalOpen(false)
          handleOpenEdit(assoc)
        }}
        onApprove={(assoc) => {
          handleOpenApprove(assoc)
        }}
        onReject={(assoc) => {
          handleOpenReject(assoc)
        }}
        onDelete={(assoc) => {
          handleOpenDelete(assoc)
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedAssociation(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Association"
        message={`Are you sure you want to delete "${selectedAssociation?.name?.en || "this association"}"? This will mark it as deleted.`}
        confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
        disabled={deleteMutation.isPending}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false)
          setSelectedAssociation(null)
        }}
        onConfirm={handleConfirmApprove}
        title="Approve Association"
        message={`Are you sure you want to approve "${selectedAssociation?.name?.en || "this association"}"? It will become active and visible to all users.`}
        confirmText={statusMutation.isPending ? "Approving..." : "Approve"}
        disabled={statusMutation.isPending}
      />

      {/* Reject Confirmation Modal with Reason */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Reject Association</h2>
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to reject &quot;{selectedAssociation?.name?.en}&quot;? You can provide a reason for the rejection.
            </p>
            <Input
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mb-6 rounded-xl text-xs"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectModalOpen(false)
                  setSelectedAssociation(null)
                }}
                disabled={statusMutation.isPending}
                className="flex-1 rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReject}
                disabled={statusMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs"
              >
                {statusMutation.isPending ? "Rejecting..." : "Confirm Reject"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
