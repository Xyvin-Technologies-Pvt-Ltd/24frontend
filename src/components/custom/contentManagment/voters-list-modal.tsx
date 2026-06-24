import { useDeferredValue, useState } from "react"
import { Loader2, Search, Calendar, Phone, Mail, Download } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useContestantVoters } from "@/hooks/useVoting"
import type { Contestant } from "@/types/voting"
import { votingService } from "@/services/votingService"
import { generateExcel } from "@/utils/generateExcel"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/toast"

interface VotersListModalProps {
  isOpen: boolean
  onClose: () => void
  contestant: Contestant | null
}

export function VotersListModal({ isOpen, onClose, contestant }: VotersListModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10
  const deferredSearch = useDeferredValue(searchTerm)

  const [isExporting, setIsExporting] = useState(false)
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast()

  // Reset page when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const { data: response, isLoading } = useContestantVoters(
    contestant?._id ?? "",
    page,
    limit,
    deferredSearch
  )

  const votersData = response?.data
  const voters = votersData?.voters ?? []
  const totalCount = votersData?.total_count ?? 0
  const totalPages = Math.ceil(totalCount / limit)

  const formatVotedAt = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return Number.isNaN(date.getTime())
        ? dateString
        : date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
    } catch {
      return dateString
    }
  }

  const handleExportExcel = async () => {
    if (!contestant) return
    setIsExporting(true)
    try {
      const response = await votingService.getContestantVoters(
        contestant._id,
        1,
        totalCount || 1000000,
        deferredSearch
      )

      const votersToExport = response?.data?.voters ?? []
      if (votersToExport.length === 0) {
        showError("No voters to export")
        return
      }

      const headers = [
        { header: "Voter Name", key: "name" },
        { header: "Phone Number", key: "phone" },
        { header: "Email Address", key: "email" },
        { header: "Vote Date", key: "vote_date" },
        { header: "Voted At", key: "voted_at" },
      ]

      const body = votersToExport.map((voter) => ({
        name: voter.name,
        phone: voter.phone,
        email: voter.email,
        vote_date: voter.vote_date,
        voted_at: formatVotedAt(voter.voted_at),
      }))

      generateExcel(headers, body, `${contestant.name.en}_Voters`)
      showSuccess("Excel downloaded successfully")
    } catch (err: any) {
      console.error("Export to Excel failed:", err)
      showError("Export failed", err?.message || "An unexpected error occurred.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voters List"
      className="max-w-2xl md:max-w-3xl w-full"
    >
      {contestant && (
        <div className="space-y-6">
          {/* Candidate Card Summary */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-200 bg-white">
                <img
                  src={contestant.image || "/placeholder-image.jpg"}
                  alt={contestant.name.en}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">
                  {contestant.name.en}
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full ml-2">
                    Contestant #{contestant.contestant_no}
                  </span>
                </h4>
                {contestant.bio?.en && (
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {contestant.bio.en}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right sm:border-l sm:border-indigo-100 sm:pl-6 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
              <span className="text-xs text-gray-500 font-medium">Votes Polled</span>
              <span className="text-xl font-extrabold text-indigo-700">
                {(contestant.vote_count ?? totalCount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Search bar & Export */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search voters by name, phone or email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-11 border-gray-200 rounded-2xl text-[#6B89B3] placeholder:text-[#88A3C6] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <Button
              onClick={handleExportExcel}
              disabled={totalCount === 0 || isExporting}
              className="h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? "Exporting..." : "Export to Excel"}
            </Button>
          </div>

          {/* Voters list table */}
          <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/75 text-left text-gray-600 font-semibold">
                    <th className="py-3 px-4 font-semibold text-xs text-gray-600">Voter</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-600">Phone</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-600">Email</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-600 text-right">Voted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                          <span className="text-xs text-gray-500 font-medium">Loading voters...</span>
                        </div>
                      </td>
                    </tr>
                  ) : voters.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-400 text-xs">
                        No voters found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    voters.map((voter) => (
                      <tr key={voter.vote_id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-250 bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600">
                              {voter.image ? (
                                <img
                                  src={voter.image}
                                  alt={voter.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                voter.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="font-semibold text-gray-900">{voter.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-700 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {voter.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="max-w-[160px] truncate">{voter.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-gray-500 font-medium">
                          <div className="flex items-center justify-end gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatVotedAt(voter.voted_at)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {!isLoading && totalCount > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 p-4 bg-gray-50/50 text-xs">
                <span className="text-gray-500 font-medium">
                  Showing {Math.min((page - 1) * limit + 1, totalCount)} to{" "}
                  {Math.min(page * limit, totalCount)} of {totalCount} voters
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="h-8 rounded-lg text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="h-8 rounded-lg text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Modal>
  )
}
