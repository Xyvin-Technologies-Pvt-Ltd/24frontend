import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { TopBar } from "@/components/custom/top-bar"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import { getApiErrorMessage } from "@/lib/utils"
import {
  useCertificatePreview,
  useDownloadParticipants,
  useInitiative,
  useInitiativeAnalytics,
  useInitiativeParticipants,
  useUpdateInitiativeStatus,
} from "@/hooks/useInitiatives"
import type { InitiativeParticipant } from "@/types/initiative"
import { ChevronLeft, ChevronRight, Download, Edit, Eye, Loader2, Search, X } from "lucide-react"

interface InitiativeViewProps {
  initiativeId: string
  onBack: () => void
  onEdit: (id: string) => void
}

const formatDateTime = (value?: string | null) => {
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

export function InitiativeView({ initiativeId, onBack, onEdit }: InitiativeViewProps) {
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [photoPreview, setPhotoPreview] = useState<InitiativeParticipant | null>(null)
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null)

  const { data: initiativeResponse, isLoading } = useInitiative(initiativeId)
  const { data: analyticsResponse } = useInitiativeAnalytics(initiativeId)
  const participantParams = {
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  }
  const { data: participantsResponse, isLoading: participantsLoading } = useInitiativeParticipants(
    initiativeId,
    participantParams
  )
  const statusMutation = useUpdateInitiativeStatus()
  const downloadMutation = useDownloadParticipants()
  const previewMutation = useCertificatePreview()

  const initiative = initiativeResponse?.data
  const analytics = analyticsResponse?.data
  const participants = participantsResponse?.data || []
  const totalCount = participantsResponse?.total_count || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const startIndex = (currentPage - 1) * rowsPerPage

  useEffect(() => {
    return () => {
      if (certificatePreview) URL.revokeObjectURL(certificatePreview)
    }
  }, [certificatePreview])

  const handleToggleStatus = async (checked: boolean) => {
    if (!initiative) return
    try {
      const response = await statusMutation.mutateAsync({ id: initiative._id, status: checked ? "active" : "inactive" })
      showSuccess("Success", response.message)
    } catch (error) {
      showError("Error", getApiErrorMessage(error, "Failed to update campaign status"))
    }
  }

  const handleDownload = async () => {
    if (!initiative) return
    try {
      await downloadMutation.mutateAsync({
        id: initiative._id,
        params: { search: searchTerm || undefined, start_date: startDate || undefined, end_date: endDate || undefined },
        fileName: `${initiative.title.en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-participants`,
      })
      showSuccess("Success", "Participants downloaded successfully")
    } catch (error) {
      showError("Error", getApiErrorMessage(error, "Failed to download participants. Please try again."))
    }
  }

  const handlePreviewCertificate = async () => {
    if (!initiative) return
    try {
      const blob = await previewMutation.mutateAsync({
        title: { en: initiative.title.en },
        certificate: {
          template_image: initiative.certificate?.template_image || "",
          id_prefix: initiative.certificate?.id_prefix,
          layout: initiative.certificate?.layout,
        },
      })
      if (certificatePreview) URL.revokeObjectURL(certificatePreview)
      setCertificatePreview(URL.createObjectURL(blob))
    } catch {
      showError("Preview Failed", "Failed to render the certificate preview")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!initiative) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Campaign not found</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: "Total Sign-ups", value: analytics?.total_signups ?? 0, bg: "bg-[#EDEEFC]" },
    { label: "Certificate Downloads", value: analytics?.certificate_downloads ?? 0, bg: "bg-[#E6F1FD]" },
    { label: "Sign-ups Today", value: analytics?.signups_today ?? 0, bg: "bg-[#EDEEFC]" },
    { label: "Shares", value: analytics?.shares ?? 0, bg: "bg-[#E6F1FD]" },
  ]

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />

      <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <button onClick={onBack} className="hover:text-gray-900">
            Content Management
          </button>
          <span className="mx-2">›</span>
          <button onClick={onBack} className="hover:text-gray-900">
            Initiatives
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{initiative.title.en}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex gap-6">
          {initiative.banner_image && (
            <img src={initiative.banner_image} alt={initiative.title.en} className="w-56 h-32 object-cover rounded-xl" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">{initiative.title.en}</h1>
              <Badge
                className={`text-xs px-3 py-1 rounded-full ${
                  initiative.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                }`}
              >
                {initiative.status === "active" ? "On" : "Off"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 line-clamp-3">{initiative.description.en}</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">
                {initiative.status === "active" ? "Campaign On" : "Campaign Off"}
              </span>
              <Switch
                checked={initiative.status === "active"}
                disabled={statusMutation.isPending}
                onCheckedChange={handleToggleStatus}
                className={initiative.status === "active" ? "bg-green-500" : "bg-gray-300"}
              />
            </div>
            <Button variant="outline" onClick={() => onEdit(initiative._id)} className="rounded-full flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className={`${card.bg} rounded-2xl p-6 border border-gray-200`}>
              <p className="text-sm text-gray-600 mb-1">{card.label}</p>
              <p className="text-3xl font-semibold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Participants */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-40 border-[#B3B3B3] rounded-lg"
                title="Joined from"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-40 border-[#B3B3B3] rounded-lg"
                title="Joined until"
              />
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search name, phone, location"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 border-[#B3B3B3] rounded-full"
                />
              </div>
              {(searchTerm || startDate || endDate) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="p-1 h-8 w-8" title="Clear filters">
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={handleDownload}
                disabled={downloadMutation.isPending}
                variant="outline"
                className="border-gray-300 hover:border-gray-400 rounded-full px-6 py-2 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {downloadMutation.isPending ? "Downloading..." : "Export CSV"}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  {["Photo", "Name", "Phone", "Location", "Joined On", "Certificate ID", "Downloads"].map((heading) => (
                    <th key={heading} className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participantsLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : participants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No participants yet
                    </td>
                  </tr>
                ) : (
                  participants.map((participant, index) => (
                    <tr
                      key={participant._id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}`}
                    >
                      <td className="py-3 px-6">
                        <button type="button" onClick={() => setPhotoPreview(participant)}>
                          <img src={participant.photo} alt={participant.full_name} className="w-10 h-10 rounded-full object-cover" />
                        </button>
                      </td>
                      <td className="py-3 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">{participant.full_name}</td>
                      <td className="py-3 px-6 text-sm text-gray-600 whitespace-nowrap">{participant.phone || "N/A"}</td>
                      <td className="py-3 px-6 text-sm text-gray-600">{participant.location}</td>
                      <td className="py-3 px-6 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(participant.joined_at)}</td>
                      <td className="py-3 px-6 text-sm text-gray-600 whitespace-nowrap">
                        {participant.certificate?.png_url ? (
                          <a
                            href={participant.certificate.png_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {participant.certificate_id}
                          </a>
                        ) : (
                          participant.certificate_id
                        )}
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-600 whitespace-nowrap">
                        {(participant.downloads?.png || 0) + (participant.downloads?.pdf || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

        {/* Certificate preview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Certificate</h2>
              <p className="text-xs text-gray-500">
                {initiative.certificate?.template_image ? "Custom template" : "Default template"} · Change the template from Edit
              </p>
            </div>
            <Button
              onClick={handlePreviewCertificate}
              disabled={previewMutation.isPending}
              className="bg-black hover:bg-gray-800 text-white rounded-full px-6 flex items-center gap-2"
            >
              {previewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Preview
            </Button>
          </div>
          {certificatePreview && (
            <img src={certificatePreview} alt="Certificate preview" className="w-full max-w-3xl mx-auto rounded shadow" />
          )}
        </div>
      </div>

      {/* Photo modal */}
      {photoPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setPhotoPreview(null)}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{photoPreview.full_name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setPhotoPreview(null)} className="p-1 h-8 w-8">
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
            <img src={photoPreview.photo} alt={photoPreview.full_name} className="w-full rounded-xl object-cover mb-4" />
            <div className="flex gap-3">
              <a href={photoPreview.photo} target="_blank" rel="noreferrer" className="flex-1">
                <Button variant="outline" className="w-full rounded-full">
                  Open Photo
                </Button>
              </a>
              {photoPreview.certificate?.png_url && (
                <a href={photoPreview.certificate.png_url} target="_blank" rel="noreferrer" className="flex-1">
                  <Button className="w-full bg-black hover:bg-gray-800 text-white rounded-full">View Certificate</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
