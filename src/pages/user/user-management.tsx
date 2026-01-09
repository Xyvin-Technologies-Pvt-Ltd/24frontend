import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { AddMemberForm } from "@/components/custom/userManagement/add-member-form"
import { EditMemberForm } from "@/components/custom/userManagement/edit-member-form"
import { useUsers, useUpdateUserStatus } from "@/hooks/useUsers"
import type { User } from "@/types/user"
import { 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  Edit,
  UserX,
  SlidersHorizontal,
  X,
  UserRound,
  Cake,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Loader2,
} from "lucide-react"

export function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [filters, setFilters] = useState({
    status: "",
    campus: "",
    district: ""
  })

  // TanStack Query for fetching users
  const queryParams = useMemo(() => ({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    status: filters.status || undefined,
    gender: undefined,
  }), [currentPage, rowsPerPage, searchTerm, filters.status])

  const { data: usersResponse, isLoading, error, refetch } = useUsers(queryParams)
  const updateUserStatusMutation = useUpdateUserStatus()

  const users = usersResponse?.data || []
  const totalCount = usersResponse?.total_count || 0

  // Calculate stats from actual data
  const activeMembers = users.filter(user => user.status === "active").length
  const inactiveMembers = users.filter(user => user.status === "inactive" || user.status === "suspended").length

  // Get unique values for filter options from actual data
  const uniqueStatuses = [...new Set(users.map(user => user.status))]
  const uniqueCampuses = [...new Set(users.map(user => user.campus || "N/A").filter(Boolean))]
  const uniqueDistricts = [...new Set(users.map(user => user.district || "N/A").filter(Boolean))]

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
  }

  const handleBackToList = () => {
    setSelectedUser(null)
    setShowAddMemberForm(false)
    setEditingUser(null)
  }

  const handleAddMember = () => {
    setShowAddMemberForm(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
  }

  const handleSaveMember = (memberData: any) => {
    console.log("New member data:", memberData)
    setShowAddMemberForm(false)
    // Refetch users after adding new member
    refetch()
  }

  const handleUpdateUser = () => {
    setEditingUser(null)
    // Refetch users after updating
    refetch()
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const resetFilters = () => {
    setFilters({
      status: "",
      campus: "",
      district: ""
    })
    setCurrentPage(1)
  }

  const applyFilters = () => {
    setIsFilterOpen(false)
    setCurrentPage(1)
  }

  const handleDeactivateUser = async (userId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: userId,
        statusData: { status: 'suspended' }
      })
    } catch (error) {
      console.error('Failed to deactivate user:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "inactive":
        return <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  // Client-side filtering for campus and district (since API doesn't support these filters)
  const filteredUsers = users.filter(user => {
    const matchesCampus = !filters.campus || (user.campus && user.campus.includes(filters.campus))
    const matchesDistrict = !filters.district || (user.district && user.district.includes(filters.district))
    return matchesCampus && matchesDistrict
  })

  const totalPages = Math.ceil(totalCount / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage

  // User Profile Component
  const UserProfileView = ({ user }: { user: User }) => {
    const [activeTab, setActiveTab] = useState<"overview" | "referrals">("overview")
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const handleMarkAsPosted = () => {
      setShowConfirmModal(true)
    }

    const handleConfirmPosted = () => {
      // Handle the confirmation logic here
      setShowConfirmModal(false)
      // You can add API call or state update here
    }

    const handleCancelPosted = () => {
      setShowConfirmModal(false)
    }

    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        
        {/* Main content with top padding to account for fixed header */}
        <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-600 mb-6">
            <button 
              onClick={handleBackToList}
              className="hover:text-gray-900"
            >
              Member Management
            </button>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Profile</span>
          </div>

          {/* Profile Header */}
          <div className="bg-[#E6F1FD] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                  <img 
                    src="/Ellipse 3226.png" 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
                    <Badge className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Student ID : {user.userId}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Active</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-500 rounded grid grid-cols-3 gap-0.5 p-1">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-sm"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === "overview"
                    ? "border-red-500 text-red-500"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("referrals")}
                className={`px-4 py-2 text-sm font-medium border-b-2 ml-8 ${
                  activeTab === "referrals"
                    ? "border-red-500 text-red-500"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Referrals
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  5
                </span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="bg-white rounded-2xl p-6">
              <div className="mb-6 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Bio</h3>
                <p className="text-gray-900">Growing. Learning. Becoming better.</p>
              </div>

              {/* First Line: Gender and Date of Birth */}
              <div className="grid grid-cols-4 gap-8 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-gray-400"><UserRound/></div>
                  <span className="text-gray-900">Male</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-gray-400"><Cake/></div>
                  <span className="text-gray-900">Born June 26, 1980</span>
                </div>
              </div>

              {/* Second Line: Campus, District, Email, Phone */}
              <div className="grid grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-gray-400"><GraduationCap/></div>
                  <span className="text-gray-900">{user.campus}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-gray-400"><MapPin/></div>
                  <span className="text-gray-900">{user.district}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-gray-400"><Mail/></div>
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-gray-400"><Phone/></div>
                  <span className="text-gray-900">{user.phone}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "referrals" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              {/* Referral Summary Section */}
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6 pb-4 border-b border-gray-200">Referral Summary</h3>
              
              <div className="grid grid-cols-2 gap-8 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Referral Code :</span>
                  <span className="font-medium text-gray-900">#code123456</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Delivery Address:</span>
                  <span className="font-medium text-gray-900">Flat 23B, XYZ Apartments, Ernakulam, Kerala - 682020</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600">Reward Status :</p>
                  <Badge className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
                    {user.rewardStatus || user.status}
                  </Badge>
                </div>
                <Button 
                  className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
                  onClick={handleMarkAsPosted}
                >
                  Mark As Posted
                </Button>
              </div>
              </div>

              {/* Referral List Section */}
              <h3 className="text-lg font-medium text-gray-900 mb-6">Referral List</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Referrals Names</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Phone Number</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Campus</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">District</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Date Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((referral, index) => (
                      <tr 
                        key={referral._id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                        }`}
                      >
                        <td className="py-3 text-sm text-gray-900">{referral.name}</td>
                        <td className="py-3 text-sm text-gray-600">{referral.email}</td>
                        <td className="py-3 text-sm text-gray-600">{referral.phone}</td>
                        <td className="py-3 text-sm text-gray-600">{referral.campus || 'N/A'}</td>
                        <td className="py-3 text-sm text-gray-600">{referral.district || 'N/A'}</td>
                        <td className="py-3 text-sm text-gray-600">02/03/2025</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value={10}>10</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">1-5 of 13</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mark As Posted</h2>
              <p className="text-gray-600 mb-8">Are you sure you want to mark this reward as posted?</p>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleCancelPosted}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full py-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPosted}
                  className="flex-1 bg-black hover:bg-gray-800 text-white rounded-full py-3"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show edit member form if requested
  if (editingUser) {
    return <EditMemberForm user={editingUser} onBack={handleBackToList} onSave={handleUpdateUser} />
  }

  // Show add member form if requested
  if (showAddMemberForm) {
    return <AddMemberForm onBack={handleBackToList} onSave={handleSaveMember} />
  }

  // Show profile view if user is selected
  if (selectedUser) {
    return <UserProfileView user={selectedUser} />
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <Button 
            className="bg-black rounded-full hover:bg-gray-800 text-white"
            onClick={handleAddMember}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="flex gap-6 mb-8">
          <div className="bg-[#EDEEFC] rounded-2xl p-6 border border-gray-200 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Members</p>
                <p className="text-3xl text-gray-900">{activeMembers}</p>
              </div>
              <div className="flex items-center text-black">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+11.01%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#E6F1FD] rounded-2xl p-6 border border-gray-200 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inactive Members</p>
                <p className="text-3xl  text-gray-900">{inactiveMembers}</p>
              </div>
              <div className="flex items-center text-black">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">-0.03%</span>
              </div>
            </div>
          </div>
        </div>
          
        {/* Table with Search */}
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

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr className="">
                  <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">User Name</th>
                  <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">ID</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600 text-sm whitespace-nowrap">Email</th>
                  <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Phone Number</th>
                  <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Campus</th>
                  <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">District</th>
                  <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Referrals</th>
                  <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Reward Status</th>
                  <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-red-600">
                      Error loading users. Please try again.
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr 
                      key={user._id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                      }`}
                    >
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                      </td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{user._id.slice(-6)}</td>
                      <td className="py-4 px-2 text-gray-600 text-sm whitespace-nowrap">{user.email}</td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{user.phone}</td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{user.campus || 'N/A'}</td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{user.district || 'N/A'}</td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">N/A</td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </Button>
                          <DropdownMenu
                            trigger={
                              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                              </Button>
                            }
                          >
                            <DropdownMenuItem 
                              className="flex items-center gap-2 px-3 py-2 text-sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 px-3 py-2 text-sm"
                              onClick={() => handleDeactivateUser(user._id)}
                            >
                              <UserX className="w-4 h-4" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenu>
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
                  disabled={currentPage === 1 || isLoading}
                  className="p-1 h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className="p-1 h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
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
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select 
                    value={filters.status} 
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    placeholder="Select"
                    className="w-full rounded-2xl"
                  >
                    <option value="">Select</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Campus Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campus
                  </label>
                  <Select 
                    value={filters.campus} 
                    onChange={(e) => handleFilterChange("campus", e.target.value)}
                    placeholder="Select"
                    className="w-full rounded-2xl"
                  >
                    <option value="">Select</option>
                    {uniqueCampuses.map((campus) => (
                      <option key={campus} value={campus}>
                        {campus}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* District Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <Select 
                    value={filters.district} 
                    onChange={(e) => handleFilterChange("district", e.target.value)}
                    placeholder="Select"
                    className="w-full rounded-2xl"
                  >
                    <option value="">Select</option>
                    {uniqueDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="p-6 ">
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