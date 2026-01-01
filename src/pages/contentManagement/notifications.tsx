import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TopBar } from "@/components/custom/top-bar"
import { AddNotificationForm } from "@/components/custom/contentManagment/add-notification-form"
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react"

interface Notification {
  id: string
  title: string
  subtitle: string
  channel: string
  dateTime: string
  status: "Published" | "Unpublished"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Marriage",
    subtitle: "Wedding Invitation: A&B",
    channel: "Whatsapp",
    dateTime: "02/02/2025 | 02:00PM",
    status: "Published"
  },
  {
    id: "2",
    title: "Birthday",
    subtitle: "Surprise Party: A&B",
    channel: "In app,Whatsapp",
    dateTime: "02/02/2025 | 02:00PM",
    status: "Unpublished"
  },
  {
    id: "3",
    title: "Housewarming",
    subtitle: "Party Invitation: A&B",
    channel: "Whatsapp",
    dateTime: "02/02/2025 | 02:00PM",
    status: "Published"
  },
  {
    id: "4",
    title: "Sangeet",
    subtitle: "Party Invitation: A&B",
    channel: "In app",
    dateTime: "02/02/2025 | 02:00PM",
    status: "Published"
  }
]

export function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications] = useState(mockNotifications)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showAddNotificationForm, setShowAddNotificationForm] = useState(false)

  const handleAddNotification = () => {
    setShowAddNotificationForm(true)
  }

  const handleBackToList = () => {
    setShowAddNotificationForm(false)
  }

  const handleSaveNotification = (notificationData: any) => {
    // Handle saving the new notification data here
    console.log("New notification data:", notificationData)
    // You can add API call or state update here
    setShowAddNotificationForm(false)
  }

  // Show add notification form if requested
  if (showAddNotificationForm) {
    return <AddNotificationForm onBack={handleBackToList} onSave={handleSaveNotification} />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "Unpublished":
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const filteredNotifications = notifications.filter(notification => 
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.channel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredNotifications.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + rowsPerPage)

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
            <span className="text-gray-900">Notification</span>
          </div>
          <Button 
            className="bg-black rounded-full hover:bg-gray-800 text-white"
            onClick={handleAddNotification}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Notification
          </Button>
        </div>
        
        {/* Main Table Card */}
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
              >
                <SlidersHorizontal className="w-4 h-4 text-[#B3B3B3]" />
              </Button>
            </div>
          </div>

          {/* Notifications Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Title</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Subtitle</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Channel</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Date & Time</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNotifications.map((notification, index) => (
                  <tr 
                    key={notification.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{notification.title}</td>
                    <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{notification.subtitle}</td>
                    <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{notification.channel}</td>
                    <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{notification.dateTime}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(notification.status)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1 h-8 w-8"
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredNotifications.length)} of {filteredNotifications.length}
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
  )
}