import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TopBar } from "@/components/custom/top-bar"
import { AddNotificationForm } from "@/components/custom/contentManagment/add-notification-form"
import { NotificationViewDialog } from "@/components/custom/contentManagment/notification-view"
import { useNotifications, useDeleteNotification } from "@/hooks/useNotifications"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import type { Notification } from "@/types/notification"
import { 
  Search, 
  Plus, 
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react"

export function NotificationsPage() {
  const { toasts, removeToast, success, error: showError } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showAddNotificationForm, setShowAddNotificationForm] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [viewingNotificationId, setViewingNotificationId] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)


  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [filters, setFilters] = useState<{
    status?: string
    start_date?: string
    end_date?: string
  }>({})
  const queryParams = useMemo(() => ({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    status: filters.status ? [filters.status] : undefined,
    start_date: filters.start_date,
    end_date: filters.end_date
  }), [currentPage, rowsPerPage, searchTerm, filters])

  const { data: notificationsResponse, isLoading, error, refetch } = useNotifications(queryParams)
  const deleteNotificationMutation = useDeleteNotification()
  
  const notifications = notificationsResponse?.data || []
  const totalCount = notificationsResponse?.total_count || 0

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        const target = event.target as Element
        if (!target.closest('.dropdown-container')) {
          setOpenDropdown(null)
        }
      }
    }

    if (openDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  const handleAddNotification = () => {
    setEditingNotification(null)
    setShowAddNotificationForm(true)
  }

  const handleDropdownToggle = (notificationId: string) => {
    setOpenDropdown(openDropdown === notificationId ? null : notificationId)
  }

  const handleEditNotification = (id: string) => {
    const notification = notifications.find(n => n._id === id)
    if (notification) {
      setEditingNotification(notification)
      setShowAddNotificationForm(true)
    }
    setOpenDropdown(null)
  }

  const handleDeleteNotification = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotificationMutation.mutateAsync(id)
        success('Success', 'Notification deleted successfully')
        refetch()
      } catch (err: any) {
        console.error('Failed to delete notification:', err)
        const errorMessage = err?.response?.data?.message || 'Failed to delete notification. Please try again.'
        showError('Error', errorMessage)
      }
    }
    setOpenDropdown(null)
  }

  const handleViewNotification = (id: string) => {
    setViewingNotificationId(id)
  }

  const handleBackToList = () => {
    setShowAddNotificationForm(false)
    setEditingNotification(null)
  }

  const handleSaveNotification = (notificationData: any) => {
    console.log("Notification data:", notificationData)
    setShowAddNotificationForm(false)
    setEditingNotification(null)
    refetch()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
      case "sended":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">{status === 'sended' ? 'Published' : status}</Badge>
      case "drafted":
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs px-3 py-1 rounded-full">Unpublished</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const getChannelDisplay = (types: string[]) => {
    const channelMap: { [key: string]: string } = {
      'in-app': 'In app',
      'whatsapp': 'Whatsapp'
    }
    return types.map(type => channelMap[type] || type).join(',')
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' | ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const filteredNotifications = notifications.filter(notification => 
    notification.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.type.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalPages = Math.ceil(totalCount / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage

  if (showAddNotificationForm) {
    return (
      <AddNotificationForm 
        onBack={handleBackToList} 
        onSave={handleSaveNotification}
        notificationId={editingNotification?._id}
        mode={editingNotification ? 'edit' : 'create'}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
        {showFilterDrawer && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="flex-1 bg-black/30"
              onClick={() => setShowFilterDrawer(false)}
            />

            {/* Drawer */}
            <div className="w-80 bg-white shadow-xl rounded-l-2xl flex flex-col">
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b">
                <h3 className="text-lg font-medium">Filter By</h3>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Start Date */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={filters.start_date || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        start_date: e.target.value || undefined,
                      }))
                    }
                    className="rounded-xl"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">End Date</label>
                  <Input
                    type="date"
                    value={filters.end_date || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        end_date: e.target.value || undefined,
                      }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({})
                    setShowFilterDrawer(false)
                  }}
                  className="flex-1 rounded-full"
                >
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    if (filters.start_date && !filters.end_date) {
                      showError("Error", "Please select end date")
                      return
                    }
                    setCurrentPage(1)
                    setShowFilterDrawer(false)
                  }}
                  className="flex-1 rounded-full bg-black text-white hover:bg-gray-800"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}


        {/* Main Table Card */}
        <div className="bg-white rounded-2xl border border-gray-200">
          {/* Search Bar - Inside the card, above the table */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notifications"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#B3B3B3] focus:border-[#B3B3B3] rounded-full"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilterDrawer(true)}
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading notifications...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-red-600">
                      Error loading notifications. Please try again.
                    </td>
                  </tr>
                ) : filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No notifications found.
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((notification, index) => (
                    <tr 
                      key={notification._id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                      }`}
                    >
                      <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{notification.subject}</td>
                      <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">
                        {notification.content.length > 50 
                          ? `${notification.content.substring(0, 50)}...` 
                          : notification.content
                        }
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">
                        {getChannelDisplay(notification.type)}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">
                        {formatDateTime(notification.createdAt)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(notification.status)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => handleViewNotification(notification._id)}
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </Button>
                          <div className="relative dropdown-container">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1 h-8 w-8"
                              onClick={() => handleDropdownToggle(notification._id)}
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </Button>
                            
                            {/* Dropdown Menu */}
                            {openDropdown === notification._id && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[120px]">
                                <button
                                  onClick={() => handleEditNotification(notification._id)}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteNotification(notification._id)}
                                  disabled={deleteNotificationMutation.isPending}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {deleteNotificationMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            )}
                          </div>
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

      {/* View Notification Dialog */}
      {viewingNotificationId && (
        <NotificationViewDialog
          open={!!viewingNotificationId}
          onClose={() => setViewingNotificationId(null)}
          notificationId={viewingNotificationId}
        />
      )}
    </div>
  )
}