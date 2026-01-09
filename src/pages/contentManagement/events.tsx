import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { AddEventForm } from "@/components/custom/contentManagment/add-event-form"
import { EventView } from "@/components/custom/contentManagment/event-view"
import { useEvents, useDeleteEvent } from "@/hooks/useEvents"
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Calendar,
  Loader2,
  Edit,
  Trash2
} from "lucide-react"

export function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("event-list")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    organiser: ""
  })

  // TanStack Query for fetching events
  const queryParams = useMemo(() => ({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    status: filters.status || undefined,
  }), [currentPage, rowsPerPage, searchTerm, filters.status])

  const { data: eventsResponse, isLoading, error, refetch } = useEvents(queryParams)
  const { data: completedEventsResponse } = useEvents({ 
    ...queryParams, 
    status: 'completed' 
  })
  const deleteEventMutation = useDeleteEvent()

  const events = eventsResponse?.data || []
  const completedEvents = completedEventsResponse?.data || []
  const totalCount = eventsResponse?.total_count || 0

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
    console.log("New event data:", eventData)
    setShowAddEventForm(false)
    // Refetch events after adding new event
    refetch()
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync(eventId)
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      organiser: ""
    })
    setCurrentPage(1)
  }

  const applyFilters = () => {
    setIsFilterOpen(false)
    setCurrentPage(1)
  }

  // Get unique values for filter options from actual data
  const uniqueOrganisers = [...new Set([...events.map(event => event.organiser_name), ...completedEvents.map(event => event.organiser_name)])]

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
      case "live":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">Live</Badge>
      case "upcomming":
      case "pending":
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs px-3 py-1 rounded-full">Upcoming</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs px-3 py-1 rounded-full">Cancelled</Badge>
      case "review":
        return <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-200 text-xs px-3 py-1 rounded-full">Review</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">Rejected</Badge>
      case "postponed":
        return <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-xs px-3 py-1 rounded-full">Postponed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    return `${diffHours} hrs`
  }

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organiser_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredEventHistory = completedEvents.filter(event => {
    const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organiser_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(totalCount / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage

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
                      {isLoading ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center">
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin mr-2" />
                              Loading events...
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-red-600">
                            Error loading events. Please try again.
                          </td>
                        </tr>
                      ) : filteredEvents.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-500">
                            No events found.
                          </td>
                        </tr>
                      ) : (
                        filteredEvents.map((event, index) => (
                          <tr 
                            key={event._id} 
                            className={`border-b border-gray-100 hover:bg-gray-50 ${
                              index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                            }`}
                          >
                            <td className="py-4 px-3 whitespace-nowrap">
                              <div className="text-gray-900 text-sm">{event.event_name}</div>
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {formatDate(event.event_start_date)}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {formatTime(event.event_start_date)}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {calculateDuration(event.event_start_date, event.event_end_date)}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {event.organiser_name}
                            </td>
                            <td className="py-4 px-3 whitespace-nowrap">
                              {getStatusBadge(event.status)}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {event.type}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {event.rsvp?.length || 0}
                            </td>
                            <td className="py-4 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-1 h-8 w-8"
                                  onClick={() => handleViewEvent(event._id)}
                                >
                                  <Eye className="w-4 h-4 text-gray-400" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-1 h-8 w-8"
                                  onClick={() => console.log('Edit event:', event._id)}
                                >
                                  <Edit className="w-4 h-4 text-gray-400" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-1 h-8 w-8"
                                  onClick={() => handleDeleteEvent(event._id)}
                                  disabled={deleteEventMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-gray-400" />
                                </Button>
                              </div>
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
                      {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalCount)} of {totalCount}
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
                      {filteredEventHistory.map((event, index) => (
                        <tr 
                          key={event._id} 
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                          }`}
                        >
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="text-gray-900 text-sm">{event.event_name}</div>
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                            {formatDate(event.event_start_date)}
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                            {formatTime(event.event_start_date)}
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                            {event.organiser_name}
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                            {event.type}
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                            {event.link || event.venue || 'N/A'}
                          </td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-1 h-8 w-8"
                                onClick={() => handleViewEvent(event._id)}
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
                        checked={filters.status === "all"}
                        onChange={(e) => handleFilterChange("status", e.target.checked ? "all" : "")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">All</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status === "live"}
                        onChange={(e) => handleFilterChange("status", e.target.checked ? "live" : "")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Live</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status === "upcomming"}
                        onChange={(e) => handleFilterChange("status", e.target.checked ? "upcomming" : "")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Upcoming</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status === "completed"}
                        onChange={(e) => handleFilterChange("status", e.target.checked ? "completed" : "")}
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