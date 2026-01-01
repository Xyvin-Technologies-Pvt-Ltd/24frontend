import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { AddEventForm } from "@/components/custom/contentManagment/add-event-form"
import { EventView } from "@/components/custom/contentManagment/event-view"
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Calendar
} from "lucide-react"

interface Event {
  id: string
  eventName: string
  date: string
  time: string
  duration: string
  organiserName: string
  status: "Live" | "Upcoming" | "Completed"
  mode: "Online" | "Offline"
  participants: number
}

interface EventHistory {
  id: string
  eventName: string
  date: string
  time: string
  organiserName: string
  type: "Online" | "Offline"
  media: string
}

const mockEventHistory: EventHistory[] = [
  {
    id: "1",
    eventName: "Tech Summit 2025",
    date: "23/03/2025",
    time: "09.30 pm",
    organiserName: "Marvel Mike",
    type: "Online",
    media: "www.youtube/lorel/iouj"
  },
  {
    id: "2",
    eventName: "Cafe Aroma",
    date: "15/06/2025",
    time: "02.00 pm",
    organiserName: "Pixar Paul",
    type: "Offline",
    media: "www.cafearoma.com/events"
  },
  {
    id: "3",
    eventName: "Music Fest",
    date: "30/08/2025",
    time: "10.00 am",
    organiserName: "DreamWorks Diana",
    type: "Online",
    media: "www.techsummit2025.com"
  },
  {
    id: "4",
    eventName: "Art & Soul",
    date: "12/11/2025",
    time: "06.30 pm",
    organiserName: "Warner Wendy",
    type: "Online",
    media: "www.artsoul.com/gallery"
  },
  {
    id: "5",
    eventName: "Art & Soul",
    date: "07/02/2026",
    time: "01.15 pm",
    organiserName: "Universal Uma",
    type: "Online",
    media: "www.musicfest.com/2026"
  },
  {
    id: "6",
    eventName: "Music Fest",
    date: "22/04/2026",
    time: "05.00 pm",
    organiserName: "Sony Sam",
    type: "Offline",
    media: "www.naturewalks.org/events"
  },
  {
    id: "7",
    eventName: "Music Fest",
    date: "07/02/2026",
    time: "01.15 pm",
    organiserName: "Paramount Pam",
    type: "Online",
    media: "www.musicfest.com/2026"
  },
  {
    id: "8",
    eventName: "Music Fest",
    date: "22/04/2026",
    time: "05.00 pm",
    organiserName: "Lionsgate Leo",
    type: "Offline",
    media: "www.naturewalks.org/events"
  },
  {
    id: "9",
    eventName: "Music Fest",
    date: "07/02/2026",
    time: "01.15 pm",
    organiserName: "Focus Features Fiona",
    type: "Online",
    media: "www.musicfest.com/2026"
  }
]
const mockEvents: Event[] = [
  {
    id: "1",
    eventName: "SKN40 - Rise Again",
    date: "23/03/2025",
    time: "09:30 pm",
    duration: "3 hrs",
    organiserName: "Disney Dane",
    status: "Live",
    mode: "Online",
    participants: 23
  },
  {
    id: "2",
    eventName: "Tech Summit 2025",
    date: "23/03/2025",
    time: "09:30 pm",
    duration: "3 hrs",
    organiserName: "Disney Dane",
    status: "Upcoming",
    mode: "Offline",
    participants: 23
  },
  {
    id: "3",
    eventName: "Tech Summit 2025",
    date: "23/03/2025",
    time: "09:30 pm",
    duration: "3 hrs",
    organiserName: "Disney Dane",
    status: "Upcoming",
    mode: "Offline",
    participants: 23
  },
  {
    id: "4",
    eventName: "Tech Summit 2025",
    date: "23/03/2025",
    time: "09:30 pm",
    duration: "3 hrs",
    organiserName: "Disney Dane",
    status: "Completed",
    mode: "Offline",
    participants: 23
  },
  {
    id: "5",
    eventName: "Tech Summit 2025",
    date: "23/03/2025",
    time: "09:30 pm",
    duration: "3 hrs",
    organiserName: "Disney Dane",
    status: "Completed",
    mode: "Online",
    participants: 23
  },
  {
    id: "6",
    eventName: "Tech Summit 2025",
    date: "23/03/2025",
    time: "09:30 pm",
    duration: "3 hrs",
    organiserName: "Disney Dane",
    status: "Completed",
    mode: "Online",
    participants: 23
  },
  {
    id: "7",
    eventName: "Tech Summit 2025",
    date: "23/03/2025",
    time: "09:30 pm",
    duration: "3 hrs",
    organiserName: "Disney Dane",
    status: "Completed",
    mode: "Online",
    participants: 23
  },
  {
    id: "8",
    eventName: "Tech Summit 2025",
    date: "23/03/2025",
    time: "09:30 pm",
    duration: "3 hrs",
    organiserName: "Disney Dane",
    status: "Completed",
    mode: "Online",
    participants: 23
  },
  {
    id: "9",
    eventName: "Tech Summit 2025",
    date: "23/03/2025",
    time: "09:30 pm",
    duration: "3 hrs",
    organiserName: "Disney Dane",
    status: "Completed",
    mode: "Online",
    participants: 23
  }
]

export function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [events] = useState(mockEvents)
  const [eventHistory] = useState(mockEventHistory)
  const [activeTab, setActiveTab] = useState("event-list")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    sortBy: "",
    startDate: "",
    endDate: "",
    organiser: ""
  })

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1) // Reset to first page when switching tabs
  }

  const handleAddEvent = () => {
    setShowAddEventForm(true)
  }

  const handleBackToList = () => {
    setShowAddEventForm(false)
    setSelectedEventId(null)
  }

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId)
  }

  const handleSaveEvent = (eventData: any) => {
    // Handle saving the new event data here
    console.log("New event data:", eventData)
    // You can add API call or state update here
    setShowAddEventForm(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      sortBy: "",
      startDate: "",
      endDate: "",
      organiser: ""
    })
  }

  const applyFilters = () => {
    setIsFilterOpen(false)
    setCurrentPage(1) // Reset to first page when applying filters
  }

  // Get unique values for filter options
  const uniqueOrganisers = [...new Set([...events.map(event => event.organiserName), ...eventHistory.map(event => event.organiserName)])]

  // Show add event form if requested
  if (showAddEventForm) {
    return <AddEventForm onBack={handleBackToList} onSave={handleSaveEvent} />
  }

  // Show event view if an event is selected
  if (selectedEventId) {
    return <EventView onBack={handleBackToList} eventId={selectedEventId} />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Live":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "Upcoming":
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "Completed":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organiserName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredEventHistory = eventHistory.filter(event => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organiserName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(
    (activeTab === "event-list" ? filteredEvents.length : filteredEventHistory.length) / rowsPerPage
  )
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + rowsPerPage)
  const paginatedEventHistory = filteredEventHistory.slice(startIndex, startIndex + rowsPerPage)

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <span>Content Management</span>
            <span className="mx-2">›</span>
            <span>Events</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">
              {activeTab === "event-list" ? "Event List" : "Event History"}
            </span>
          </div>
          <Button 
            className="bg-black rounded-full hover:bg-gray-800 text-white"
            onClick={handleAddEvent}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Events
          </Button>
        </div>
      
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-transparent border-b border-gray-200 rounded-none p-0 h-auto">
            <button
              onClick={() => handleTabChange("event-list")}
              className={`px-0 py-3 mr-8 border-b-2 rounded-none bg-transparent ${
                activeTab === "event-list" 
                  ? "border-red-500 text-red-500" 
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Event List
            </button>
            <button
              onClick={() => handleTabChange("event-history")}
              className={`px-0 py-3 border-b-2 rounded-none bg-transparent ${
                activeTab === "event-history" 
                  ? "border-red-500 text-red-500" 
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Event History
            </button>
          </div>

          {/* Event List Tab Content */}
          {activeTab === "event-list" && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl border border-gray-200">
                {/* Search Bar - Inside the card, above the table */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-end">
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search members"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-[#B3B3B3] focus:border-[#B3B3B3] rounded-full"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      className="ml-4 border-[#B3B3B3] hover:border-[#B3B3B3] rounded-lg"
                      onClick={() => setIsFilterOpen(true)}
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#B3B3B3]" />
                    </Button>
                  </div>
                </div>

                {/* Events Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr className="">
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Event Name</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Date</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Time</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Duration</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Organiser Name</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Mode</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Participants</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEvents.map((event, index) => (
                        <tr 
                          key={event.id} 
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                          }`}
                        >
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="text-gray-900 text-sm">{event.eventName}</div>
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.date}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.time}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.duration}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.organiserName}</td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            {getStatusBadge(event.status)}
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.mode}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.participants}</td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-1 h-8 w-8"
                                onClick={() => handleViewEvent(event.id)}
                              >
                                <Eye className="w-4 h-4 text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
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
                    <span className="text-sm text-gray-600">
                      {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredEvents.length)} of {filteredEvents.length}
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
          )}

          {/* Event History Tab Content */}
          {activeTab === "event-history" && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl border border-gray-200">
                {/* Search Bar - Inside the card, above the table */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-end">
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search members"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-[#B3B3B3] focus:border-[#B3B3B3] rounded-full"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      className="ml-4 border-[#B3B3B3] hover:border-[#B3B3B3] rounded-lg"
                      onClick={() => setIsFilterOpen(true)}
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#B3B3B3]" />
                    </Button>
                  </div>
                </div>

                {/* Event History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr className="">
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Event Name</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Date</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Time</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Organiser Name</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Type</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Media</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEventHistory.map((event, index) => (
                        <tr 
                          key={event.id} 
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                          }`}
                        >
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="text-gray-900 text-sm">{event.eventName}</div>
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.date}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.time}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.organiserName}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.type}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{event.media}</td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-1 h-8 w-8"
                                onClick={() => handleViewEvent(event.id)}
                              >
                                <Eye className="w-4 h-4 text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
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
                    <span className="text-sm text-gray-600">
                      {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredEventHistory.length)} of {filteredEventHistory.length}
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
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-80 h-full shadow-lg rounded-l-2xl flex flex-col">
            <div className="p-6 flex-1">
              {/* Header with Sort by */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Sort by</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Filter Options */}
              <div className="space-y-6">
                {/* Sort by Section */}
                <div>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.sortBy === "all"}
                        onChange={(e) => handleFilterChange("sortBy", e.target.checked ? "all" : "")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">All</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.sortBy === "live"}
                        onChange={(e) => handleFilterChange("sortBy", e.target.checked ? "live" : "")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Live</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.sortBy === "upcoming"}
                        onChange={(e) => handleFilterChange("sortBy", e.target.checked ? "upcoming" : "")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Upcoming</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.sortBy === "completed"}
                        onChange={(e) => handleFilterChange("sortBy", e.target.checked ? "completed" : "")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Completed</span>
                    </label>
                  </div>
                </div>

                {/* Filter by Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Filter by</h3>
                  
                  {/* Date Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Date</h4>
                    
                    {/* Start Date */}
                    <div className="mb-4">
                      <label className="block text-sm text-gray-600 mb-2">Start Date</label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="dd/mm/yyyy"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange("startDate", e.target.value)}
                          className="w-full pr-10 border-gray-300 rounded-lg"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="mb-4">
                      <label className="block text-sm text-gray-600 mb-2">End Date</label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="dd/mm/yyyy"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange("endDate", e.target.value)}
                          className="w-full pr-10 border-gray-300 rounded-lg"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Organiser Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organiser
                    </label>
                    <Select 
                      value={filters.organiser} 
                      onChange={(e) => handleFilterChange("organiser", e.target.value)}
                      placeholder="Select"
                      className="w-full rounded-lg"
                    >
                      <option value="">Select</option>
                      {uniqueOrganisers.map((organiser) => (
                        <option key={organiser} value={organiser}>
                          {organiser}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="p-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
                >
                  Reset
                </Button>
                <Button
                  onClick={applyFilters}
                  className="flex-1 bg-black hover:bg-gray-800 text-white rounded-full"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}