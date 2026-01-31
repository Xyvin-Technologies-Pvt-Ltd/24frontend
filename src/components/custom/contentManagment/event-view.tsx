import { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { TopBar } from "@/components/custom/top-bar"
import { MediaFolderView } from "@/components/custom/contentManagment/media-folder-view"
import { AddFolderModal } from "@/components/custom/contentManagment/add-folder-modal"
import { EditFolderModal } from "@/components/custom/contentManagment/edit-folder-modal"
import { UploadMediaModal } from "@/components/custom/contentManagment/upload-media-modal"
import { ConfirmationModal } from "@/components/custom/confirmation-modal"
import { ToastContainer } from "@/components/ui/toast"
import { useEvent } from "@/hooks/useEvents"
import { useToast } from "@/hooks/useToast"
import {
  useFoldersByEventId,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder
} from "@/hooks/useFolders"
import { uploadService } from "@/services/uploadService"
import {
  Search,
  MapPin,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Folder,
  MoreHorizontal,
  Plus,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react"

interface EventViewProps {
  onBack: () => void
  eventId?: string
}

export function EventView({ onBack, eventId }: EventViewProps) {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast()

  const [activeTab, setActiveTab] = useState("guests-list")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedFolder, setSelectedFolder] = useState<{ id: string, name: string } | null>(null)
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false)
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false)
  const [isUploadMediaModalOpen, setIsUploadMediaModalOpen] = useState(false)
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<any>(null)
  const [deletingFolder, setDeletingFolder] = useState<any>(null)

  // TanStack Query hooks
  const { data: eventResponse, isLoading: eventLoading, error: eventError } = useEvent(eventId || '')

  // Folder hooks
  const {
    data: foldersResponse,
    isLoading: foldersLoading,
    error: foldersError
  } = useFoldersByEventId(eventId || '', {
    page_no: 1,
    limit: 100,
    search: searchTerm
  })

  const createFolderMutation = useCreateFolder()
  const updateFolderMutation = useUpdateFolder()
  const deleteFolderMutation = useDeleteFolder()

  // Handle error toast messages - must be called unconditionally
  useEffect(() => {
    if (eventError) {
      const isAuthError = (eventError as any)?.response?.status === 401
      const isPermissionError = (eventError as any)?.response?.status === 403

      if (isAuthError) {
        showError('Your session has expired. Please refresh the page to log in again.')
      } else if (isPermissionError) {
        showError("You don't have permission to view this event.")
      } else {
        showError('Error loading event details. Please try again.')
      }
    }

    if (foldersError) {
      showError('Error loading folders. Please try again.')
    }
  }, [eventError, foldersError, showError])

  // Reset page when switching tabs or searching - must be called unconditionally
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm])

  // NOW WE CAN HAVE CONDITIONAL LOGIC AND EARLY RETURNS
  const eventData = eventResponse?.data

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)

    const startMonth = start.toLocaleDateString('en-US', { month: 'long' })
    const startDay = start.getDate()
    const startTime = formatTime(startDate)
    const endTime = formatTime(endDate)

    return `${startMonth} ${startDay} • ${startTime}-${endTime}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">Live</Badge>
      case "upcomming":
      case "pending":
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs px-3 py-1 rounded-full">Upcoming</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs px-3 py-1 rounded-full">Cancelled</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  // Handle folder view navigation
  const handleViewFolder = (folderId: string, folderName: string) => {
    setSelectedFolder({ id: folderId, name: folderName })
  }

  const handleBackFromFolder = () => {
    setSelectedFolder(null)
  }

  const handleAddFolder = () => {
    setIsAddFolderModalOpen(true)
  }

  const handleSaveFolder = async (folderName: string) => {
    if (!eventId) return

    try {
      await createFolderMutation.mutateAsync({
        name: folderName,
        event: eventId
      })
      showSuccess('Folder created successfully!')
      setIsAddFolderModalOpen(false)
    } catch (error) {
      showError('Failed to create folder. Please try again.')
    }
  }

  const handleEditFolder = (folder: any) => {
    setEditingFolder(folder)
    setIsEditFolderModalOpen(true)
  }

  const handleUpdateFolder = async (folderName: string) => {
    if (!editingFolder) return

    try {
      await updateFolderMutation.mutateAsync({
        id: editingFolder._id,
        folderData: { name: folderName }
      })
      showSuccess('Folder updated successfully!')
      setIsEditFolderModalOpen(false)
      setEditingFolder(null)
    } catch (error) {
      showError('Failed to update folder. Please try again.')
    }
  }

  const handleDeleteFolder = (folder: any) => {
    setDeletingFolder(folder)
    setIsDeleteConfirmModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingFolder) return

    try {
      await deleteFolderMutation.mutateAsync(deletingFolder._id)
      showSuccess('Folder deleted successfully!')
      setIsDeleteConfirmModalOpen(false)
      setDeletingFolder(null)
    } catch (error) {
      showError('Failed to delete folder. Please try again.')
    }
  }



  const handleUploadFiles = async (files: File[]) => {
    try {
      // Upload files to server first
      const uploadPromises = files.map(file =>
        uploadService.uploadFile(file, 'events')
      )

      const uploadResults = await Promise.all(uploadPromises)

      // Prepare files data for adding to public folder
      const uploadedFilesData = uploadResults.map(result => ({
        type: result.data.filename.toLowerCase().includes('.mp4') ||
          result.data.filename.toLowerCase().includes('.mov') ||
          result.data.filename.toLowerCase().includes('.avi') ? 'video' as const : 'image' as const,
        url: result.data.url
      }))

      // For now, we'll just show success - you might want to add to a specific folder
      console.log('Uploaded files:', uploadedFilesData)
      showSuccess(`${files.length} file(s) uploaded successfully!`)
      setIsUploadMediaModalOpen(false)

    } catch (error) {
      showError('Failed to upload files. Please try again.')
    }
  }

  if (eventLoading) {
    return (
      <div className="flex flex-col h-screen">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <TopBar />
        <div className="flex-1 pt-[100px] p-8 bg-gray-50 flex items-center justify-center">
          <div className="flex items-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading event details...
          </div>
        </div>
      </div>
    )
  }

  if (eventError || !eventData) {
    const isAuthError = (eventError as any)?.response?.status === 401
    const isPermissionError = (eventError as any)?.response?.status === 403

    return (
      <div className="flex flex-col h-screen">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <TopBar />
        <div className="flex-1 pt-[100px] p-8 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              {isAuthError
                ? "Your session has expired. Please refresh the page to log in again."
                : isPermissionError
                  ? "You don't have permission to view this event."
                  : "Error loading event details"}
            </p>
            <div className="space-x-4">
              <Button onClick={onBack} variant="outline">Go Back</Button>
              {isAuthError && (
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show media folder view if a folder is selected
  if (selectedFolder) {
    return <MediaFolderView onBack={handleBackFromFolder} folderId={selectedFolder.id} folderName={selectedFolder.name} />
  }

  // Get real data from event API response
  const folders = foldersResponse?.data || []
  const speakers = eventData?.speakers || []
  const guests = eventData?.guests || []
  const rsvpMembers = eventData?.rsvp || []
  const attendees = eventData?.attendence || []
  const coordinators = eventData?.coordinators || []

  // Helper function to format folder data for display
  const formatFolderSize = (folder: any) => {
    const totalFiles = (folder.image_count || 0) + (folder.video_count || 0)
    return totalFiles > 0 ? `${totalFiles} files` : '0 files'
  }

  const formatFolderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  // Filter data based on search term and active tab
  const filteredSpeakers = speakers.filter(speaker =>
    (speaker.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (speaker.designation || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredGuests = guests.filter(guest =>
    (guest.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (guest.designation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (guest.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRSVPMembers = rsvpMembers.filter(member =>
    (member.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.member_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAttendees = attendees.filter(attendee =>
    (attendee.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (attendee.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (attendee.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (attendee.member_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMediaFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCurrentData = () => {
    switch (activeTab) {
      case "rsvp-list":
        return filteredRSVPMembers
      case "participants-list":
        return filteredAttendees
      case "media":
        return filteredMediaFolders
      default: // guests-list
        // Combine speakers and guests for the guests list
        return [...filteredSpeakers.map(s => ({ ...s, type: 'speaker' })), ...filteredGuests.map(g => ({ ...g, type: 'guest' }))]
    }
  }

  const handleDownload = () => {
    let dataToExport: any[] = []
    let fileName = `${eventData?.event_name || 'Event'}_${activeTab}.xlsx`

    const currentData = getCurrentData()

    if (activeTab === "guests-list") {
      dataToExport = currentData.map((guest: any) => ({
        Name: guest.name,
        Designation: guest.designation,
        Role: guest.role || guest.type,
      }))
    } else if (activeTab === "rsvp-list" || activeTab === "participants-list") {
      dataToExport = currentData.map((member: any) => ({
        "Member Name": member.name,
        Email: member.email,
        "Phone Number": member.phone,
        "Member ID": member.member_id,
      }))
    } else {
      // Logic for Media or other undefined tabs if necessary
      return
    }

    if (dataToExport.length === 0) {
      showError("No data to download.")
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    XLSX.writeFile(workbook, fileName)
  }

  const currentData = getCurrentData()
  const totalPages = Math.ceil(currentData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedData = currentData.slice(startIndex, startIndex + rowsPerPage)

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />

      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] bg-[#F8F9FA] overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6 px-6">
          <button
            onClick={onBack}
            className="hover:text-gray-700"
          >
            Content Management
          </button>
          <span className="mx-2">›</span>
          <span>Events</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">{eventData?.event_name || 'Event Details'}</span>
        </div>

        <div className="bg-white mx-6 rounded-lg shadow-sm">
          {/* Top Section - Two Equal Cards */}
          <div className="grid grid-cols-2 gap-8 p-8 pb-6">
            {/* Event Banner Card */}
            <div className="bg-[#F5F5F5] rounded-2xl p-3">
              <div className="flex gap-4 h-full">
                {/* Left side - Event Image */}
                <div className="flex">
                  <div className="relative w-full overflow-hidden">
                    <img
                      src={eventData?.banner_image || "/placeholder-banner.png"}
                      alt={`${eventData?.event_name} Event Banner`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Prevent infinite loop by setting to a known valid default
                        if ((e.target as HTMLImageElement).src.includes("placeholder-banner.png")) return;
                        (e.target as HTMLImageElement).src = "/placeholder-banner.png";
                      }}
                    />
                  </div>
                </div>

                {/* Right side - Event Details */}
                <div className="flex-1 flex flex-col justify-start space-y-3">
                  {getStatusBadge(eventData?.status || 'pending')}
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    {eventData?.type === 'Offline' ? (eventData?.venue || 'Venue TBD') : 'Online Event'}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {eventData?.event_start_date && eventData?.event_end_date
                      ? formatDateRange(eventData.event_start_date, eventData.event_end_date)
                      : 'Date TBD'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Event Coordinators Card */}
            <div className="bg-[#F5F5F5] rounded-2xl p-6 h-64">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Event Coordinators</h3>
                <Button variant="ghost" size="sm" className="p-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                </Button>
              </div>

              {coordinators.length > 0 ? (
                <div className="space-y-3">
                  {coordinators.slice(0, 3).map((coordinator, index) => (
                    <div key={index} className="flex items-center">
                      <img
                        src={coordinator.image || "/Ellipse 3226.png"}
                        alt={coordinator.name}
                        className="w-10 h-10 rounded-full mr-3"
                        onError={(e) => {
                          // Prevent infinite loop
                          if ((e.target as HTMLImageElement).src.includes("Ellipse 3226.png")) return;
                          (e.target as HTMLImageElement).src = "/Ellipse 3226.png";
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{coordinator.name}</p>
                        <p className="text-xs text-gray-500">{coordinator.designation}</p>
                      </div>
                    </div>
                  ))}
                  {coordinators.length > 3 && (
                    <p className="text-xs text-gray-500 mt-2">+{coordinators.length - 3} more coordinators</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  <img
                    src="/Ellipse 3226.png"
                    alt="Default Coordinator"
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Event Coordinator</p>
                    <p className="text-xs text-gray-500">Event Manager</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Sections */}
          <div className="-space-y-5 px-4 pb-8">
            {/* Event Organiser */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Event Organiser</h3>
              <div className="flex items-center">
                <img
                  src="/Ellipse 3226.png"
                  alt={eventData?.organiser_name || "Event Organiser"}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{eventData?.organiser_name || 'Event Organiser'}</p>
                  <p className="text-xs text-gray-500">Event Manager</p>
                </div>
              </div>
            </div>

            {/* About Event */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">About Event</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {eventData?.description || 'No description available for this event.'}
              </p>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Documents</h3>
              {eventData?.attachments && eventData.attachments.length > 0 ? (
                <div className="space-y-3">
                  {eventData.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-bold">PDF</span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {attachment.split('/').pop() || `Document ${index + 1}`}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => window.open(attachment, '_blank')}
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">--</span>
                    </div>
                    <span className="text-sm text-gray-500">No documents available</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-lg p-6">
              {/* Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("guests-list")}
                    className={`px-0 py-3 mr-8 border-b-2 text-sm font-medium ${activeTab === "guests-list"
                      ? "border-red-500 text-red-500"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Guests List
                  </button>
                  <button
                    onClick={() => setActiveTab("rsvp-list")}
                    className={`px-0 py-3 mr-8 border-b-2 text-sm font-medium ${activeTab === "rsvp-list"
                      ? "border-red-500 text-red-500"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    RSVP list
                  </button>
                  <button
                    onClick={() => setActiveTab("participants-list")}
                    className={`px-0 py-3 mr-8 border-b-2 text-sm font-medium ${activeTab === "participants-list"
                      ? "border-red-500 text-red-500"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Participants list
                  </button>
                  <button
                    onClick={() => setActiveTab("media")}
                    className={`px-0 py-3 border-b-2 text-sm font-medium ${activeTab === "media"
                      ? "border-red-500 text-red-500"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Media
                  </button>
                </div>
              </div>

              {/* Search and Actions */}
              <div className="flex items-center justify-end mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-80" key="event-view-search-container">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="event-view-search"
                      key="event-view-search"
                      placeholder="Search members"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-gray-400 rounded-full h-10"
                    />
                  </div>

                  {activeTab === "media" ? (
                    <Button
                      onClick={handleDownload}
                      className="bg-[#F5F5F5] rounded-full h-10 w-10 p-0"
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDownload}
                      className="bg-black hover:bg-gray-800 text-white rounded-full px-6 h-10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {activeTab === "media" && (
                    <>

                      <Button
                        onClick={handleAddFolder}
                        className="bg-black hover:bg-gray-800 text-white rounded-full px-6 h-10"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Folder
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {activeTab === "rsvp-list" ? (
                        <>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Member Name</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Email</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Phone Number</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Member ID</th>
                        </>
                      ) : activeTab === "participants-list" ? (
                        <>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Member Name</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Email</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Phone Number</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Member ID</th>
                        </>
                      ) : activeTab === "media" ? (
                        <>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Folder Name</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Last Modified</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">File Size</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Action</th>
                        </>
                      ) : (
                        <>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Name</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Designation</th>
                          <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Role</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === "rsvp-list" ? (
                      paginatedData.length > 0 ? (
                        (paginatedData as any[]).map((member, index) => (
                          <tr
                            key={member._id || index}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-0">
                              <div className="flex items-center">
                                <img
                                  src={member.image || "/Ellipse 3226.png"}
                                  alt={member.name}
                                  className="w-8 h-8 rounded-full mr-3"
                                  onError={(e) => {
                                    // Prevent infinite loop
                                    if ((e.target as HTMLImageElement).src.includes("Ellipse 3226.png")) return;
                                    (e.target as HTMLImageElement).src = "/Ellipse 3226.png";
                                  }}
                                />
                                <span className="text-gray-900 text-sm">{member.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-0 text-gray-600 text-sm">{member.email || 'N/A'}</td>
                            <td className="py-4 px-0 text-gray-600 text-sm">{member.phone || 'N/A'}</td>
                            <td className="py-4 px-0 text-gray-600 text-sm">{member.member_id || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            No RSVP members found.
                          </td>
                        </tr>
                      )
                    ) : activeTab === "participants-list" ? (
                      paginatedData.length > 0 ? (
                        (paginatedData as any[]).map((attendee, index) => (
                          <tr
                            key={attendee._id || index}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-0">
                              <div className="flex items-center">
                                <img
                                  src={attendee.image || "/Ellipse 3226.png"}
                                  alt={attendee.name}
                                  className="w-8 h-8 rounded-full mr-3"
                                  onError={(e) => {
                                    // Prevent infinite loop
                                    if ((e.target as HTMLImageElement).src.includes("Ellipse 3226.png")) return;
                                    (e.target as HTMLImageElement).src = "/Ellipse 3226.png";
                                  }}
                                />
                                <span className="text-gray-900 text-sm">{attendee.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-0 text-gray-600 text-sm">{attendee.email || 'N/A'}</td>
                            <td className="py-4 px-0 text-gray-600 text-sm">{attendee.phone || 'N/A'}</td>
                            <td className="py-4 px-0 text-gray-600 text-sm">{attendee.member_id || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            No participants found.
                          </td>
                        </tr>
                      )
                    ) : activeTab === "media" ? (
                      foldersLoading && folders.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center">
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin mr-2" />
                              Loading folders...
                            </div>
                          </td>
                        </tr>
                      ) : paginatedData.length > 0 ? (
                        (paginatedData as any[]).map((folder) => (
                          <tr
                            key={folder._id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-0">
                              <div className="flex items-center">
                                <Folder className="w-5 h-5 text-blue-600 mr-3" />
                                <span className="text-gray-900 text-sm">{folder.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-0 text-gray-600 text-sm">
                              {formatFolderDate(folder.updatedAt)}
                            </td>
                            <td className="py-4 px-0 text-gray-600 text-sm">
                              {formatFolderSize(folder)}
                            </td>
                            <td className="py-4 px-0">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-8 w-8 hover:bg-gray-100"
                                  onClick={() => handleViewFolder(folder._id, folder.name)}
                                >
                                  <Eye className="w-4 h-4 text-gray-500" />
                                </Button>
                                <DropdownMenu
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-1 h-8 w-8 hover:bg-gray-100"
                                    >
                                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                    </Button>
                                  }
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleEditFolder(folder)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteFolder(folder)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            No folders found. Create your first folder to organize media files.
                          </td>
                        </tr>
                      )
                    ) : (
                      paginatedData.length > 0 ? (
                        (paginatedData as any[]).map((person, index) => (
                          <tr
                            key={`${person.name}-${index}`}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-0">
                              <div className="flex items-center">
                                <img
                                  src={person.image || "/Ellipse 3226.png"}
                                  alt={person.name}
                                  className="w-8 h-8 rounded-full mr-3"
                                  onError={(e) => {
                                    // Prevent infinite loop
                                    if ((e.target as HTMLImageElement).src.includes("Ellipse 3226.png")) return;
                                    (e.target as HTMLImageElement).src = "/Ellipse 3226.png";
                                  }}
                                />
                                <span className="text-gray-900 text-sm">{person.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-0 text-gray-600 text-sm">{person.designation || 'N/A'}</td>
                            <td className="py-4 px-0 text-gray-600 text-sm">
                              {person.role || (person.type === 'speaker' ? 'Speaker' : 'Guest')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-gray-500">
                            No guests or speakers found.
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {startIndex + 1}-{Math.min(startIndex + rowsPerPage, currentData.length)} of {currentData.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1 h-8 w-8"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
        </div>
      </div>

      {/* Add Folder Modal */}
      <AddFolderModal
        isOpen={isAddFolderModalOpen}
        onClose={() => setIsAddFolderModalOpen(false)}
        onSave={handleSaveFolder}
      />

      {/* Edit Folder Modal */}
      <EditFolderModal
        isOpen={isEditFolderModalOpen}
        onClose={() => {
          setIsEditFolderModalOpen(false)
          setEditingFolder(null)
        }}
        onSave={handleUpdateFolder}
        folder={editingFolder}
        isLoading={updateFolderMutation.isPending}
      />

      {/* Upload Media Modal */}
      <UploadMediaModal
        isOpen={isUploadMediaModalOpen}
        onClose={() => setIsUploadMediaModalOpen(false)}
        onUpload={handleUploadFiles}
        isLoading={false}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => {
          setIsDeleteConfirmModalOpen(false)
          setDeletingFolder(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Folder"
        message={`Are you sure you want to delete "${deletingFolder?.name}"? This action cannot be undone and all files in this folder will be permanently removed.`}
        confirmText={deleteFolderMutation.isPending ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        disabled={deleteFolderMutation.isPending}
      />
    </div>
  )
}