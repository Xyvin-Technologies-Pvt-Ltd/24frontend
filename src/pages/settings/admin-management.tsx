import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TopBar } from "@/components/custom/top-bar"
import { AddAdminForm } from "@/components/custom/settings/add-admin-form"
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  MoreHorizontal,
  Edit,
  Trash2,
  X
} from "lucide-react"
import {DropdownMenu, DropdownMenuItem} from "@/components/ui/dropdown-menu"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/services/userService"
import { authService } from "@/services/authService"
import { logService } from "@/services/logService"
import { format } from "date-fns"
import { Select } from "@/components/ui/select"
import type { LogsQueryParams } from '@/types/log'




export function AdminManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("admin-list")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [adminFilters, setAdminFilters] = useState({
    status: ""
  })
  const [logFilters, setLogFilters] = useState<{
    userType: "" | "admin" | "user"
    startDate: string
    endDate: string
  }>({
    userType: "",
    startDate: "",
    endDate: ""
  })


  const queryClient = useQueryClient()

  const handleAdminFilterChange = (key: keyof typeof adminFilters, value: string) => {
    setAdminFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleLogFilterChange = (
    key: keyof typeof logFilters,
    value: "" | "admin" | "user" | string
  ) => {
    setLogFilters(prev => ({ ...prev, [key]: value as any }))
    setCurrentPage(1)
  }

  const resetAdminFilters = () => {
    setAdminFilters({
      status: ""
    });
    setCurrentPage(1);
  };


  const resetLogFilters = () => {
    setLogFilters({
      userType: "",
      startDate: "",
      endDate: ""
    })
    setCurrentPage(1)
  }

  const handleTabChange = (value: "admin-list" | "admin-activity") => {
    setActiveTab(value)
    setSearchTerm("")
    setCurrentPage(1)
    resetAdminFilters()
    resetLogFilters()
  }

  //  Admin List query params with filters
  const adminQueryParams = useMemo(() => ({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    is_admin: true,
    status: adminFilters.status || undefined
  }), [currentPage, rowsPerPage, searchTerm, adminFilters])

  const { data: adminData } = useQuery({
    queryKey: ["admins", adminQueryParams],
    queryFn: () => userService.getUsers(adminQueryParams)
  })
  const logQueryParams: LogsQueryParams = useMemo(() => ({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    user_type: logFilters.userType || "admin",
    start_date: logFilters.startDate || undefined,
    end_date: logFilters.endDate || undefined,
  }), [currentPage, rowsPerPage, searchTerm, logFilters])

  const { data: logsData } = useQuery({
    queryKey: ["logs", logQueryParams],
    queryFn: () => logService.getLogs(logQueryParams),
    enabled: activeTab === "admin-activity"
  })

  // Create Admin Mutation
  const createAdminMutation = useMutation({
    mutationFn: authService.adminSignup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      setShowAddForm(false)
      setEditingAdmin(null)
    }
  })

  // Update Admin Mutation
  const updateAdminMutation = useMutation({
    mutationFn: (data: { id: string; data: any }) =>
      userService.updateUser(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      setShowAddForm(false)
      setEditingAdmin(null)
    }
  })

  // Delete Admin (Soft Delete)
  const deleteAdminMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
    }
  })


  const handleAddAdmin = () => {
    setEditingAdmin(null)
    setShowAddForm(true)
  }

  const handleEditAdmin = (admin: any) => {
    setEditingAdmin(admin)
    setShowAddForm(true)
  }

  const handleDeleteAdmin = (id: string) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      deleteAdminMutation.mutate(id)
    }
  }

  const handleSaveAdmin = (adminData: any) => {
    if (editingAdmin) {
      updateAdminMutation.mutate({ id: editingAdmin._id, data: adminData })
    } else {
      createAdminMutation.mutate(adminData)
    }
  }

  const handleBackFromForm = () => {
    setShowAddForm(false)
    setEditingAdmin(null)
  }



  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const admins = adminData?.data || []
  const totalCount = adminData?.total_count || 0
  const totalPages = Math.ceil(totalCount / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedAdmins = admins

  // Placeholder for activity - would need similar query setup
  const logs = logsData?.data || []
  const logsTotalCount = logsData?.total_count || 0
  const logsTotalPages = Math.ceil(logsTotalCount / rowsPerPage)

  // Show add admin form if requested
  if (showAddForm) {
    return (
      <AddAdminForm
        onBack={handleBackFromForm}
        onSave={handleSaveAdmin}
        editAdmin={editingAdmin}
        isEdit={!!editingAdmin}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <span>Settings</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Admin Management</span>
          </div>
          <Button
            className="bg-black rounded-full hover:bg-gray-800 text-white"
            onClick={handleAddAdmin}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-transparent border-b border-gray-200 rounded-none p-0 h-auto">
            <button
              onClick={() => handleTabChange("admin-list")}
              className={`px-0 py-3 mr-8 border-b-2 rounded-none bg-transparent ${activeTab === "admin-list"
                ? "border-red-500 text-red-500"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Admin List
            </button>
            <button
              onClick={() => handleTabChange("admin-activity")}
              className={`px-0 py-3 border-b-2 rounded-none bg-transparent ${activeTab === "admin-activity"
                ? "border-red-500 text-red-500"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Admin activity
            </button>
          </div>

          {/* Admin List Tab Content */}
          {activeTab === "admin-list" && (
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

                {/* Admin List Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr className="">
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Admin Name</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Phone</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Email</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Role</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Designation</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAdmins.map((admin: any, index: number) => (
                        <tr
                          key={admin._id}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                            }`}
                        >
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="text-gray-900 text-sm">{admin.name}</div>
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{admin.phone}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{admin.email}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{admin.admin_role?.role_name || '-'}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{admin.profession || '-'}</td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            {getStatusBadge(admin.status)}
                          </td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            <DropdownMenu
                              trigger={
                                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </Button>
                              }
                            >
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm"
                                onClick={() => handleEditAdmin(admin)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600"
                                onClick={() => handleDeleteAdmin(admin._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenu>
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

          {/* Admin Activity Tab Content */}
          {activeTab === "admin-activity" && (
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

                {/* Admin Activity Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr className="">
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Admin Name</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Role</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Action</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Date & Time</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Device</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, index) => (
                        <tr
                          key={log._id}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                            }`}
                        >
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="text-gray-900 text-sm">{log.user_name}</div>
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{log.user_type}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap max-w-[200px] truncate" title={log.action}>{log.action || log.method + ' ' + log.route}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                            {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap max-w-[150px] truncate" title={log.user_agent}>{log.user_agent}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{log.ip}</td>
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
                      {logsTotalCount === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + rowsPerPage, logsTotalCount)} of {logsTotalCount}
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
                        onClick={() => setCurrentPage(prev => Math.min(logsTotalPages, prev + 1))}
                        disabled={currentPage === logsTotalPages || logsTotalPages === 0}
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
      {/* FILTER DRAWER UI   */}

      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-80 h-full shadow-lg rounded-l-2xl flex flex-col">
            <div className="p-6 flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Filter by</h2>
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
                {/* ADMIN LIST FILTER */}
                {activeTab === "admin-list" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <Select
                        value={adminFilters.status}
                        onChange={(e) => handleAdminFilterChange("status", e.target.value)}
                        className="w-full rounded-2xl"
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="deleted">Deleted</option>
                        <option value="suspended">Suspended</option>
                        <option value="rejected">Rejected</option>
                      </Select>
                    </div>


                  </>
                )}

                {/* ADMIN ACTIVITY FILTERS */}

                {activeTab === "admin-activity" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Type
                      </label>
                      <Select
                        value={logFilters.userType}
                        onChange={(e) => handleLogFilterChange("userType", e.target.value)}
                        className="w-full rounded-2xl"
                      >
                        <option value="">All</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={logFilters.startDate}
                        onChange={(e) => handleLogFilterChange("startDate", e.target.value)}
                        className="w-full rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={logFilters.endDate}
                        onChange={(e) => handleLogFilterChange("endDate", e.target.value)}
                        className="w-full rounded-2xl"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={activeTab === "admin-list" ? resetAdminFilters : resetLogFilters}
                  className="flex-1 rounded-2xl"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 bg-black hover:bg-gray-800 text-white rounded-2xl"
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