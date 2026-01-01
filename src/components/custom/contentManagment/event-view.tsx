import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TopBar } from "@/components/custom/top-bar"
import { MediaFolderView } from "@/components/custom/contentManagment/media-folder-view"
import { AddFolderModal } from "@/components/custom/contentManagment/add-folder-modal"
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
  Plus
} from "lucide-react"

interface EventViewProps {
  onBack: () => void
  eventId?: string
}

interface Performer {
  id: string
  name: string
  designation: string
  role: string
  avatar: string
}

interface RSVPMember {
  id: string
  name: string
  email: string
  phoneNumber: string
  avatar: string
}

interface MediaFolder {
  id: string
  name: string
  lastModified: string
  fileSize: string
  type: "folder"
}

const mockPerformers: Performer[] = [
  {
    id: "1",
    name: "Jagadish Natarajan",
    designation: "Guitarist",
    role: "Performer",
    avatar: "/Ellipse 3226.png"
  },
  {
    id: "2",
    name: "Anjali Sharma",
    designation: "Vocalist",
    role: "Performer",
    avatar: "/Ellipse 3226.png"
  },
  {
    id: "3",
    name: "Raj Patel",
    designation: "Drummer",
    role: "Performer",
    avatar: "/Ellipse 3226.png"
  },
  {
    id: "4",
    name: "Meera Kapoor",
    designation: "Pianist",
    role: "Performer",
    avatar: "/Ellipse 3226.png"
  },
  {
    id: "5",
    name: "Vikram Desai",
    designation: "Bassist",
    role: "Performer",
    avatar: "/Ellipse 3226.png"
  }
]

const mockRSVPMembers: RSVPMember[] = [
  {
    id: "1",
    name: "Jagadish Natarajan",
    email: "Guitarist",
    phoneNumber: "Performer",
    avatar: "/Ellipse 3226.png"
  },
  {
    id: "2",
    name: "Anjali Sharma",
    email: "Vocalist",
    phoneNumber: "Performer",
    avatar: "/Ellipse 3226.png"
  },
  {
    id: "3",
    name: "Raj Patel",
    email: "Drummer",
    phoneNumber: "Performer",
    avatar: "/Ellipse 3226.png"
  },
  {
    id: "4",
    name: "Meera Kapoor",
    email: "Pianist",
    phoneNumber: "Performer",
    avatar: "/Ellipse 3226.png"
  },
  {
    id: "5",
    name: "Vikram Desai",
    email: "Bassist",
    phoneNumber: "Performer",
    avatar: "/Ellipse 3226.png"
  }
]

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
  // eventId can be used for API calls or event-specific data fetching
  const currentEventId = eventId || "default-event"
  
  // Log current event for debugging (can be used for API calls)
  console.log('Viewing event:', currentEventId)
  
  const [activeTab, setActiveTab] = useState("guests-list")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false)
  const [mediaFolders, setMediaFolders] = useState(mockMediaFolders)

  // Reset page when switching tabs or searching
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm])

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

  // Show media folder view if a folder is selected
  if (selectedFolder) {
    return <MediaFolderView onBack={handleBackFromFolder} folderName={selectedFolder} />
  }

  const filteredPerformers = mockPerformers.filter(performer =>
    performer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    performer.designation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRSVPMembers = mockRSVPMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMediaFolders = mediaFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCurrentData = () => {
    switch (activeTab) {
      case "rsvp-list":
        return filteredRSVPMembers
      case "media":
        return filteredMediaFolders
      default:
        return filteredPerformers
    }
  }

  const currentData = getCurrentData()
  const totalPages = Math.ceil(currentData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedData = currentData.slice(startIndex, startIndex + rowsPerPage)

  return (
    <div className="flex flex-col h-screen">
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
          <span className="text-gray-900 font-medium">SKN40 - Rise Against Drugs</span>
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
                      src="sk.png" 
                      alt="SKN40 Event Banner"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                {/* Right side - Event Details */}
                <div className="flex-1 flex flex-col justify-start space-y-3">
                  <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs px-2 py-1 rounded-md w-fit">
                    Completed
                  </Badge>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    Aspinwall, Kochi
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    January 25 • 7:00 PM-9:00 PM
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
              
              <div className="flex items-center">
                <img 
                  src="/Ellipse 3226.png" 
                  alt="Fatima Al Zaabi"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Fatima Al Zaabi</p>
                  <p className="text-xs text-gray-500">Event Manager</p>
                </div>
              </div>
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
                  alt="Jennifer Lopez"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Jennifer Lopez</p>
                  <p className="text-xs text-gray-500">Event Manager</p>
                </div>
              </div>
            </div>

            {/* About Event */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">About Event</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                SKN40 is a youth-driven anti-drug initiative aimed at spreading awareness, promoting a clean lifestyle, and inspiring young minds to rise beyond addiction. 
                This year's edition brings a unique blend of purpose and music, highlighted by an electrifying live performance by AGAM Band, amplifying the message of hope and resilience.
              </p>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Documents</h3>
              <div className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <span className="text-sm text-gray-900">Brochure.pdf</span>
                </div>
                <Button variant="ghost" size="sm" className="p-1">
                  <Download className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
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
                      (paginatedData as RSVPMember[]).map((member) => (
                        <tr 
                          key={member.id} 
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-0">
                            <div className="flex items-center">
                              <img 
                                src={member.avatar} 
                                alt={member.name}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                              <span className="text-gray-900 text-sm">{member.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-0 text-gray-600 text-sm">{member.email}</td>
                          <td className="py-4 px-0 text-gray-600 text-sm">{member.phoneNumber}</td>
                        </tr>
                      ))
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
                      (paginatedData as Performer[]).map((performer) => (
                        <tr 
                          key={performer.id} 
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-0">
                            <div className="flex items-center">
                              <img 
                                src={performer.avatar} 
                                alt={performer.name}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                              <span className="text-gray-900 text-sm">{performer.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-0 text-gray-600 text-sm">{performer.designation}</td>
                          <td className="py-4 px-0 text-gray-600 text-sm">{performer.role}</td>
                        </tr>
                      ))
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