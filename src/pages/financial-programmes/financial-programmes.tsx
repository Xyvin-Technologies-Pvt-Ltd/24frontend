import { useDeferredValue, useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"
import { TopBar } from "@/components/custom/top-bar"
import { AddProgrammeView } from "@/components/custom/financialProgrammes"
import { FinancialProgrammeView } from "./financial-programme-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ToastContainer } from "@/components/ui/toast"
import {
  useCreateFinancialProgramme,
  useDeleteFinancialProgramme,
  useFinancialProgrammes,
} from "@/hooks/useFinancialProgrammes"
import { useToast } from "@/hooks/useToast"
import type {
  FinancialProgrammeFormData,
  FinancialProgrammeStatus,
} from "@/types/financial-programme"

type ProgrammeFilterState = {
  status?: Exclude<FinancialProgrammeStatus, "deleted">
}

const getStatusColor = (status: FinancialProgrammeStatus) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "inactive":
      return "bg-gray-100 text-gray-800"
    case "completed":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-red-100 text-red-800"
  }
}

export function FinancialProgrammesPage() {
  const { toasts, removeToast, success, error: showError, info } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState<ProgrammeFilterState>({})
  const [viewingProgrammeId, setViewingProgrammeId] = useState<string | null>(null)
  const [isAddingProgramme, setIsAddingProgramme] = useState(false)
  const deferredSearch = useDeferredValue(searchTerm)

  const programmeQuery = useFinancialProgrammes({
    page_no: currentPage,
    limit: rowsPerPage,
    search: deferredSearch || undefined,
    status: filters.status,
  })

  const createProgrammeMutation = useCreateFinancialProgramme()
  const deleteProgrammeMutation = useDeleteFinancialProgramme()

  const programmes = programmeQuery.data?.data ?? []
  const totalCount = programmeQuery.data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch, filters.status, rowsPerPage])

  const handleDeleteProgramme = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this programme?")) {
      return
    }

    try {
      await deleteProgrammeMutation.mutateAsync(id)
      success("Success", "Programme deleted successfully")

      if (programmes.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    } catch {
      showError("Error", "Failed to delete programme")
    }
  }

  const handleCreateProgramme = async (data: FinancialProgrammeFormData) => {
    try {
      await createProgrammeMutation.mutateAsync(data)
      success("Success", "Programme created successfully")
      setIsAddingProgramme(false)
    } catch {
      showError("Error", "Failed to create programme")
    }
  }

  if (viewingProgrammeId) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <FinancialProgrammeView
          programmeId={viewingProgrammeId}
          onEdit={(programmeId) =>
            info("Info", `Edit flow for programme ${programmeId} can be added next.`)
          }
        />
      </>
    )
  }

  if (isAddingProgramme) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <AddProgrammeView
          onBack={() => setIsAddingProgramme(false)}
          onSave={handleCreateProgramme}
        />
      </>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />

      <div className="flex-1 overflow-y-auto bg-gray-50 p-8 pt-[80px]">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <span>Content Management</span>
            <span className="mx-2">{">"}</span>
            <span className="font-medium text-gray-900">Financial Programmes</span>
          </div>

          <Button
            onClick={() => setIsAddingProgramme(true)}
            className="flex items-center gap-2 rounded-full bg-black px-6 py-2 text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Create New Programme
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-end">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search Financial Programmes"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="rounded-full border-[#B3B3B3] pl-10 focus:border-[#B3B3B3]"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilterModal(true)}
                className="ml-4 rounded-lg border-[#B3B3B3] hover:border-[#B3B3B3]"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#B3B3B3]" />
              </Button>
            </div>
          </div>

          {showFilterModal && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50">
              <div className="flex h-full w-80 flex-col rounded-l-2xl bg-white shadow-lg">
                <div className="flex-1 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Filter by</h2>
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
                      value={filters.status || ""}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          status:
                            (event.target.value as ProgrammeFilterState["status"]) ||
                            undefined,
                        }))
                      }
                      className="w-full rounded-2xl border px-3 py-2 text-sm"
                    >
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 p-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-2xl"
                      onClick={() => {
                        setFilters({})
                        setShowFilterModal(false)
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      className="flex-1 rounded-2xl bg-black text-white hover:bg-gray-800"
                      onClick={() => setShowFilterModal(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {programmeQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : programmeQuery.isError ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-red-500">
                Failed to load financial programmes.
              </p>
            </div>
          ) : programmes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="mb-2 text-gray-500">No financial programmes found</p>
                <Button onClick={() => setIsAddingProgramme(true)} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create One
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white">
                    <tr>
                      <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Programme
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Goal
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Progress
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {programmes.map((programme) => (
                      <tr
                        key={programme._id}
                        className="border-t border-gray-200 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {programme.programme}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {programme.goal}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {programme.progress}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge
                            className={`${getStatusColor(programme.status)} capitalize`}
                          >
                            {programme.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-1"
                              onClick={() => setViewingProgrammeId(programme._id)}
                              title="View"
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
                            >
                              <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={() => setViewingProgrammeId(programme._id)}
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={() => handleDeleteProgramme(programme._id)}
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

              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(event) => setRowsPerPage(Number(event.target.value))}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
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
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
      </div>
    </div>
  )
}
