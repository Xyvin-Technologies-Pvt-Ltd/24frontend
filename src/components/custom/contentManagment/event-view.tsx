import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TopBar } from "@/components/custom/top-bar"
import { MediaFolderView } from "@/components/custom/contentManagment/media-folder-view"
import { AddFolderModal } from "@/components/custom/contentManagment/add-folder-modal"
import { ToastContainer } from "@/components/ui/toast"
import { useEvent } from "@/hooks/useEvents"
import { useToast } from "@/hooks/useToast"
import { 
  Search, 
  MapPin,
  Calendar,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Folder,
  MoreHorizontal,
  Plus,
  Loader2
} from "lucide-react"

interface EventViewProps {
  onBack: () => void
  eventId?: string
}

interface MediaFolder {
  id: string
  name: string
  lastModified: string
  fileSize: string
  type: "folder"
}

const mockMediaFolders: MediaFolder[] = [
  {
    id: "1",
    name: "Public Folder",
    lastModified: "02/10/2023",
    fileSize: "24 MB",
    type: "folder"
  },
  {
    id: "2",
    name: "Public Folder",
    lastModified: "03/10/2023",
    fileSize: "40 MB",
    type: "folder"
  },
  {
    id: "3",
    name: "Public Folder",
    lastModified: "04/10/2023",
    fileSize: "50 MB",
    type: "folder"
  },
  {
    id: "4",
    name: "Public Folder",
    lastModified: "05/10/2023",
    fileSize: "40 MB",
    type: "folder"
  },
  {
    id: "5",
    name: "Public Folder",
    lastModified: "06/10/2023",
    fileSize: "40 MB",
    type: "folder"
  }
]

export function EventView({ onBack, eventId }: EventViewProps) {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { toasts, removeToast, error: showError } = useToast()
  
  const [activeTab, setActiveTab] = useState("guests-list")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false)
  const [mediaFolders, setMediaFolders] = useState(mockMediaFolders)

  // TanStack Query hooks
  const { data: eventResponse, isLoading: eventLoading, error: eventError } = useEvent(eventId || '')

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
  }, [eventError, showError])

  // Reset page when switching tabs or searching - must be called unconditionally
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm])

  // NOW WE CAN HAVE CONDITIONAL LOGIC AND EARLY RETURNS
  const event = eventResponse?.data

  // Helper functions for formatting
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
  const handleViewFolder = (folderName: string) => {
    setSelectedFolder(folderName)
  }

  const handleBackFromFolder = () => {
    setSelectedFolder(null)
  }

  const handleAddFolder = () => {
    setIsAddFolderModalOpen(true)
  }

  const handleSaveFolder = (folderName: string) => {
    // Create new folder object
    const newFolder: MediaFolder = {
      id: (mediaFolders.length + 1).toString(),
      name: folderName,
      lastModified: new Date().toLocaleDateString('en-GB'),
      fileSize: "0 MB",
      type: "folder"
    }
    
    // Add to folders list
    setMediaFolders(prev => [...prev, newFolder])
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

  if (eventError || !event) {
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
    return <MediaFolderView onBack={handleBackFromFolder} folderName={selectedFolder} />
  }

  // Get real data from event API response
  const speakers = event?.speakers || []
  const guests = event?.guests || []
  const rsvpMembers = event?.rsvp || []
  const attendees = event?.attendence || []
  const coordinators = event?.coordinators || []

  // Filter data based on search term and active tab
  const filteredSpeakers = speakers.filter(speaker =>
    speaker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    speaker.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredGuests = guests.filter(guest =>
    guest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRSVPMembers = rsvpMembers.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAttendees = attendees.filter(attendee =>
    attendee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMediaFolders = mediaFolders.filter(folder =>
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
          <span className="text-gray-900 font-medium">{event?.event_name || 'Event Details'}</span>
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
                      src={event?.banner_image || "sk.png"} 
                      alt={`${event?.event_name} Event Banner`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback to default image if banner_image fails to load
                        (e.target as HTMLImageElement).src = "sk.png"
                      }}
                    />
                  </div>
                </div>
                
                {/* Right side - Event Details */}
                <div className="flex-1 flex flex-col justify-start space-y-3">
                  {getStatusBadge(event?.status || 'pending')}
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event?.type === 'Offline' ? (event?.venue || 'Venue TBD') : 'Online Event'}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event?.event_start_date && event?.event_end_date 
                      ? formatDateRange(event.event_start_date, event.event_end_date)
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
                          (e.target as HTMLImageElement).src = "/Ellipse 3226.png"
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
                  alt={event?.organiser_name || "Event Organiser"}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{event?.organiser_name || 'Event Organiser'}</p>
                  <p className="text-xs text-gray-500">Event Manager</p>
                </div>
              </div>
            </div>

            {/* About Event */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">About Event</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {event?.description || 'No description available for this event.'}
              </p>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Documents</h3>
              {event?.attachments && event.attachments.length > 0 ? (
                <div className="space-y-3">
                  {event.attachments.map((attachment, index) => (
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
                    className={`px-0 py-3 mr-8 border-b-2 text-sm font-medium ${
                      activeTab === "guests-list"
                        ? "border-red-500 text-red-500"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Guests List
                  </button>
                  <button
                    onClick={() => setActiveTab("rsvp-list")}
                    className={`px-0 py-3 mr-8 border-b-2 text-sm font-medium ${
                      activeTab === "rsvp-list"
                        ? "border-red-500 text-red-500"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    RSVP list
                  </button>
                  <button
                    onClick={() => setActiveTab("participants-list")}
                    className={`px-0 py-3 mr-8 border-b-2 text-sm font-medium ${
                      activeTab === "participants-list"
                        ? "border-red-500 text-red-500"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Participants list
                  </button>
                  <button
                    onClick={() => setActiveTab("media")}
                    className={`px-0 py-3 border-b-2 text-sm font-medium ${
                      activeTab === "media"
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
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search members"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-gray-400 rounded-full h-10"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 hover:border-gray-400 rounded-lg h-10 w-10 p-0"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                  </Button>
                  {activeTab === "media" ? (
                    <Button 
                      className="bg-[#F5F5F5] rounded-full h-10 w-10 p-0"
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                    </Button>
                  ) : (
                    <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-6 h-10">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {activeTab === "media" && (
                    <Button 
                      onClick={handleAddFolder}
                      className="bg-black hover:bg-gray-800 text-white rounded-full px-6 h-10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Folder
                    </Button>
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
                                    (e.target as HTMLImageElement).src = "/Ellipse 3226.png"
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
                                    (e.target as HTMLImageElement).src = "/Ellipse 3226.png"
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
                      (paginatedData as MediaFolder[]).map((folder) => (
                        <tr 
                          key={folder.id} 
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-0">
                            <div className="flex items-center">
                              <Folder className="w-5 h-5 text-blue-600 mr-3" />
                              <span className="text-gray-900 text-sm">{folder.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-0 text-gray-600 text-sm">{folder.lastModified}</td>
                          <td className="py-4 px-0 text-gray-600 text-sm">{folder.fileSize}</td>
                          <td className="py-4 px-0">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-1 h-8 w-8 hover:bg-gray-100"
                                onClick={() => handleViewFolder(folder.name)}
                              >
                                <Eye className="w-4 h-4 text-gray-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-1 h-8 w-8 hover:bg-gray-100"
                              >
                                <MoreHorizontal className="w-4 h-4 text-gray-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
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
                                    (e.target as HTMLImageElement).src = "/Ellipse 3226.png"
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
    </div>
  )
}