import { useState } from "react"
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
  SlidersHorizontal
} from "lucide-react"

interface Admin {
  id: string
  adminName: string
  phone: string
  email: string
  role: "Super Admin" | "Sub Admin"
  designation: string
  status: "Active" | "Inactive"
}

interface AdminActivity {
  id: string
  adminName: string
  role: "Super Admin" | "Sub Admin"
  sessionStartTime: string
  sessionFinishTime: string
  sessionDevice: string
  ipAddress: string
}

const mockAdmins: Admin[] = [
  {
    id: "1",
    adminName: "Vinod",
    phone: "99878 98765",
    email: "vinod@example.com",
    role: "Super Admin",
    designation: "Manager",
    status: "Active"
  },
  {
    id: "2",
    adminName: "Sarah",
    phone: "12345 67890",
    email: "sarah@example.com",
    role: "Sub Admin",
    designation: "Editor",
    status: "Active"
  },
  {
    id: "3",
    adminName: "Mike",
    phone: "23456 78901",
    email: "mike@example.com",
    role: "Sub Admin",
    designation: "Engineer",
    status: "Active"
  },
  {
    id: "4",
    adminName: "Jessica",
    phone: "34567 89012",
    email: "jessica@example.com",
    role: "Sub Admin",
    designation: "Lead Designer",
    status: "Active"
  },
  {
    id: "5",
    adminName: "Tom",
    phone: "45678 90123",
    email: "tom@example.com",
    role: "Super Admin",
    designation: "Manager",
    status: "Active"
  },
  {
    id: "6",
    adminName: "Emily",
    phone: "56789 01234",
    email: "emily@example.com",
    role: "Sub Admin",
    designation: "Tester",
    status: "Active"
  },
  {
    id: "7",
    adminName: "James",
    phone: "67890 12345",
    email: "james@example.com",
    role: "Sub Admin",
    designation: "Analyst",
    status: "Active"
  },
  {
    id: "8",
    adminName: "Natalie",
    phone: "78901 23456",
    email: "natalie@example.com",
    role: "Sub Admin",
    designation: "Support",
    status: "Active"
  }
]

const mockAdminActivity: AdminActivity[] = [
  {
    id: "1",
    adminName: "Vinod",
    role: "Super Admin",
    sessionStartTime: "02:30 pm",
    sessionFinishTime: "05:30 pm",
    sessionDevice: "QWE Laptop",
    ipAddress: "2401:4900:1cdff"
  },
  {
    id: "2",
    adminName: "Aisha",
    role: "Sub Admin",
    sessionStartTime: "08:00 am",
    sessionFinishTime: "04:00 pm",
    sessionDevice: "ASUS Desktop",
    ipAddress: "192.168.1.10"
  },
  {
    id: "3",
    adminName: "Raj",
    role: "Super Admin",
    sessionStartTime: "09:00 am",
    sessionFinishTime: "05:00 pm",
    sessionDevice: "HP Laptop",
    ipAddress: "10.0.0.15"
  },
  {
    id: "4",
    adminName: "Emma",
    role: "Super Admin",
    sessionStartTime: "10:00 am",
    sessionFinishTime: "06:00 pm",
    sessionDevice: "Dell Monitor",
    ipAddress: "172.16.254.1"
  },
  {
    id: "5",
    adminName: "Ming",
    role: "Super Admin",
    sessionStartTime: "11:00 am",
    sessionFinishTime: "07:00 pm",
    sessionDevice: "Lenovo Laptop",
    ipAddress: "192.168.100.2"
  },
  {
    id: "6",
    adminName: "Carlos",
    role: "Super Admin",
    sessionStartTime: "09:30 am",
    sessionFinishTime: "05:30 pm",
    sessionDevice: "Acer Desktop",
    ipAddress: "10.0.1.20"
  },
  {
    id: "7",
    adminName: "Sophia",
    role: "Super Admin",
    sessionStartTime: "08:30 am",
    sessionFinishTime: "04:30 pm",
    sessionDevice: "Apple MacBook",
    ipAddress: "203.0.113.5"
  },
  {
    id: "8",
    adminName: "David",
    role: "Super Admin",
    sessionStartTime: "12:00 pm",
    sessionFinishTime: "08:00 pm",
    sessionDevice: "Microsoft Surface",
    ipAddress: "192.0.2.30"
  },
  {
    id: "9",
    adminName: "Lila",
    role: "Super Admin",
    sessionStartTime: "09:15 am",
    sessionFinishTime: "05:15 pm",
    sessionDevice: "Razer Laptop",
    ipAddress: "198.51.100.25"
  }
]

export function AdminManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [admins] = useState(mockAdmins)
  const [adminActivity] = useState(mockAdminActivity)
  const [activeTab, setActiveTab] = useState("admin-list")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any>(null)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1) // Reset to first page when switching tabs
  }

  const handleAddAdmin = () => {
    setEditingAdmin(null)
    setShowAddForm(true)
  }

  const handleSaveAdmin = (adminData: any) => {
    console.log("Admin saved:", adminData)
    setShowAddForm(false)
    setEditingAdmin(null)
  }

  const handleBackFromForm = () => {
    setShowAddForm(false)
    setEditingAdmin(null)
  }



  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "Inactive":
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.phone.includes(searchTerm)
    return matchesSearch
  })

  const filteredAdminActivity = adminActivity.filter(activity => {
    const matchesSearch = activity.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.sessionDevice.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.ipAddress.includes(searchTerm)
    return matchesSearch
  })

  const totalPages = Math.ceil(
    (activeTab === "admin-list" ? filteredAdmins.length : filteredAdminActivity.length) / rowsPerPage
  )
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedAdmins = filteredAdmins.slice(startIndex, startIndex + rowsPerPage)
  const paginatedAdminActivity = filteredAdminActivity.slice(startIndex, startIndex + rowsPerPage)

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
              className={`px-0 py-3 mr-8 border-b-2 rounded-none bg-transparent ${
                activeTab === "admin-list" 
                  ? "border-red-500 text-red-500" 
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin List
            </button>
            <button
              onClick={() => handleTabChange("admin-activity")}
              className={`px-0 py-3 border-b-2 rounded-none bg-transparent ${
                activeTab === "admin-activity" 
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
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAdmins.map((admin, index) => (
                        <tr 
                          key={admin.id} 
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                          }`}
                        >
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="text-gray-900 text-sm">{admin.adminName}</div>
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{admin.phone}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{admin.email}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{admin.role}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{admin.designation}</td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            {getStatusBadge(admin.status)}
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
                      {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredAdmins.length)} of {filteredAdmins.length}
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
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Session Start time</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Session finish time</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Session device</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAdminActivity.map((activity, index) => (
                        <tr 
                          key={activity.id} 
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                          }`}
                        >
                          <td className="py-4 px-3 whitespace-nowrap">
                            <div className="text-gray-900 text-sm">{activity.adminName}</div>
                          </td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{activity.role}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{activity.sessionStartTime}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{activity.sessionFinishTime}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{activity.sessionDevice}</td>
                          <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{activity.ipAddress}</td>
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
                      {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredAdminActivity.length)} of {filteredAdminActivity.length}
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
    </div>
  )
}