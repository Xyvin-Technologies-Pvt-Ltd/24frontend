import { useEffect, useRef, useState, type ReactNode } from "react"
import { Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { TopBar } from "@/components/custom/top-bar"
import { ConfirmationModal } from "@/components/custom/confirmation-modal"
import { InitiativeForm } from "@/components/custom/initiatives/initiative-form"
import { InitiativeView } from "@/components/custom/initiatives/initiative-view"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import { getApiErrorMessage } from "@/lib/utils"
import {
  useDeleteInitiative,
  useInitiative,
  useInitiatives,
  useUpdateInitiativeStatus,
} from "@/hooks/useInitiatives"
import type { Initiative } from "@/types/initiative"
import { ChevronLeft, ChevronRight, Eye, Loader2, MoreHorizontal, Plus, Search } from "lucide-react"

function AddInitiativePage() {
  const navigate = useNavigate()
  return (
    <InitiativeForm
      onBack={() => navigate("/initiatives")}
      onSave={(message) => navigate("/initiatives", { state: { successMessage: message } })}
    />
  )
}

function EditInitiativePage() {
  const { initiativeId } = useParams<{ initiativeId: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useInitiative(initiativeId || "")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading campaign</p>
          <Button onClick={() => navigate("/initiatives")}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <InitiativeForm
      initiative={data.data}
      onBack={() => navigate(`/initiatives/view/${data.data._id}`)}
      onSave={(message) => navigate(`/initiatives/view/${data.data._id}`, { state: { successMessage: message } })}
    />
  )
}

function InitiativeViewPage() {
  const { initiativeId } = useParams<{ initiativeId: string }>()
  const navigate = useNavigate()
  return (
    <SuccessFromState>
      <InitiativeView
        initiativeId={initiativeId || ""}
        onBack={() => navigate("/initiatives")}
        onEdit={(id) => navigate(`/initiatives/edit/${id}`)}
      />
    </SuccessFromState>
  )
}

// Shows the success message handed over by the form after saving
function SuccessFromState({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { toasts, removeToast, success: showSuccess } = useToast()

  const handledLocationKey = useRef<string | null>(null)
  useEffect(() => {
    const successMessage = (location.state as { successMessage?: string } | null)?.successMessage
    // the key guard stops a double toast when effects run twice (React StrictMode)
    if (successMessage && handledLocationKey.current !== location.key) {
      handledLocationKey.current = location.key
      showSuccess("Success", successMessage)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.state, location.key, location.pathname, navigate, showSuccess])

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {children}
    </>
  )
}

function InitiativesList() {
  const navigate = useNavigate()
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [deleteTarget, setDeleteTarget] = useState<Initiative | null>(null)

  const { data, isLoading } = useInitiatives({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
  })
  const statusMutation = useUpdateInitiativeStatus()
  const deleteMutation = useDeleteInitiative()

  const initiatives = data?.data || []
  const totalCount = data?.total_count || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const startIndex = (currentPage - 1) * rowsPerPage

  const handleToggleStatus = async (initiative: Initiative, checked: boolean) => {
    try {
      const response = await statusMutation.mutateAsync({ id: initiative._id, status: checked ? "active" : "inactive" })
      showSuccess("Success", response.message)
    } catch (error) {
      showError("Error", getApiErrorMessage(error, "Failed to update campaign status"))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget._id)
      showSuccess("Success", "Campaign deleted successfully")
      setDeleteTarget(null)
    } catch (error) {
      showError("Error", getApiErrorMessage(error, "Failed to delete campaign"))
    }
  }

  return (
    <SuccessFromState>
      <div className="flex flex-col h-screen">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <TopBar />

        <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Initiatives</h1>
              <p className="text-sm text-gray-500">Pledge campaigns with sign-ups and participation certificates</p>
            </div>
            <Button
              onClick={() => navigate("/initiatives/add")}
              className="bg-black hover:bg-gray-800 text-white rounded-full px-6 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Campaign
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-end">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search campaigns"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 border-[#B3B3B3] focus:border-[#B3B3B3] rounded-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    {["Campaign", "Sign-ups", "Certificate Downloads", "Created On", "Status", "Show in App", "Actions"].map(
                      (heading) => (
                        <th key={heading} className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : initiatives.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        No campaigns yet
                      </td>
                    </tr>
                  ) : (
                    initiatives.map((initiative, index) => (
                      <tr
                        key={initiative._id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {initiative.banner_image && (
                              <img src={initiative.banner_image} alt="" className="w-16 h-10 rounded-lg object-cover" />
                            )}
                            <span className="text-sm font-medium text-gray-900">{initiative.title.en}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{initiative.participants_count ?? 0}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{initiative.certificate_downloads ?? 0}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(initiative.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            className={`text-xs px-3 py-1 rounded-full ${
                              initiative.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {initiative.status === "active" ? "On" : "Off"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Switch
                            checked={initiative.status === "active"}
                            disabled={statusMutation.isPending}
                            onCheckedChange={(checked) => handleToggleStatus(initiative, checked)}
                            className={initiative.status === "active" ? "bg-green-500" : "bg-gray-300"}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-8 w-8"
                              onClick={() => navigate(`/initiatives/view/${initiative._id}`)}
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                            </Button>
                            <DropdownMenu
                              trigger={
                                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </Button>
                              }
                            >
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm"
                                onClick={() => navigate(`/initiatives/edit/${initiative._id}`)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600"
                                onClick={() => setDeleteTarget(initiative)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {totalCount === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalCount)} of {totalCount}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1 h-8 w-8"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 h-8 w-8"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Campaign"
          message={`Delete "${deleteTarget?.title.en}"? It will be removed from the app and users will no longer see its certificates.`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
          cancelText="Cancel"
        />
      </div>
    </SuccessFromState>
  )
}

export function InitiativesPage() {
  return (
    <Routes>
      <Route path="/" element={<InitiativesList />} />
      <Route path="/add" element={<AddInitiativePage />} />
      <Route path="/edit/:initiativeId" element={<EditInitiativePage />} />
      <Route path="/view/:initiativeId" element={<InitiativeViewPage />} />
    </Routes>
  )
}
