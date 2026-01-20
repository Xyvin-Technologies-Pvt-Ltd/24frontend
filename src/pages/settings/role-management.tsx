import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TopBar } from "@/components/custom/top-bar"
import { AddRoleForm } from "@/components/custom/settings/add-role-form"
import { ToastContainer } from "@/components/ui/toast"
import { useRoles, useDeleteRole } from "@/hooks/useRoles"
import { useToast } from "@/hooks/useToast"
import type { Role } from "@/types/role"
import { 
  Search, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Edit,
  Trash2
} from "lucide-react"

export function RoleManagementPage() {
  const { toasts, removeToast, success, error: showError } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const { data: rolesResponse, isLoading } = useRoles({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined
  })

  const deleteRoleMutation = useDeleteRole()

  const roles = rolesResponse?.data || []
  const totalCount = rolesResponse?.total_count || 0

  const handleAddRole = () => {
    setEditingRole(null)
    setShowAddForm(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setShowAddForm(true)
  }

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRoleMutation.mutateAsync(roleId)
        success("Role deleted successfully")
      } catch (error: any) {
        showError("Failed to delete role", error?.response?.data?.message)
      }
    }
  }

  const handleSaveRole = (roleData: any) => {
    console.log("Role saved:", roleData)
    setShowAddForm(false)
    setEditingRole(null)
  }

  const handleBackFromForm = () => {
    setShowAddForm(false)
    setEditingRole(null)
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">
        Active
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs px-3 py-1 rounded-full">
        Inactive
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatPermissions = (permissions: string[]) => {
    if (permissions.length === 0) return "No permissions"
    
    const permissionGroups: { [key: string]: string[] } = {}
    const moduleMap: { [key: string]: string } = {
      'dashboard_management': 'Dashboard',
      'user_management': 'User Management',
      'events_management': 'Event Management',
      'promotions_management': 'Promotions',
      'resources_management': 'Resources',
      'campaigns_management': 'Campaigns',
      'notifications_management': 'Notifications',
      'levels_management': 'Levels',
      'post_approvals': 'Post Approvals',
      'campaign_approvals': 'Campaign Approvals',
      'admin_management': 'Admin Management',
      'role_management': 'Role Management'
    }
    
    permissions.forEach(permission => {
      const parts = permission.split('_')
      const type = parts.pop()
      const moduleKey = parts.join('_')
      
      const moduleName = moduleMap[moduleKey] || moduleKey
      if (!permissionGroups[moduleName]) {
        permissionGroups[moduleName] = []
      }
      if (type === 'view' || type === 'modify') {
        permissionGroups[moduleName].push(type)
      }
    })

    const formattedPermissions = Object.entries(permissionGroups).map(([module, types]) => {
      if (types.includes('view') && types.includes('modify')) {
        return `${module} (View & Modify)`
      } else if (types.includes('view')) {
        return `${module} (View)`
      } else if (types.includes('modify')) {
        return `${module} (Modify)`
      }
      return module
    })

    if (formattedPermissions.length <= 2) {
      return formattedPermissions.join(", ")
    }
    return `${formattedPermissions.slice(0, 2).join(", ")} +${formattedPermissions.length - 2} more`
  }

  const totalPages = Math.ceil(totalCount / rowsPerPage)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) 
  }

  if (showAddForm) {
    return (
      <AddRoleForm 
        onBack={handleBackFromForm} 
        onSave={handleSaveRole}
        editRole={editingRole || undefined}
        isEdit={!!editingRole}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <TopBar />
      
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <span>Settings</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Role Management</span>
          </div>
          <Button 
            className="bg-black rounded-full hover:bg-gray-800 text-white"
            onClick={handleAddRole}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search roles"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
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

          <div className="overflow-x-auto">
            {roles.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">No roles found</div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-white">
                  <tr className="">
                    <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Role Name</th>
                    <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Created on</th>
                    <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Access</th>
                    <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Description</th>
                    <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                    <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role, index) => (
                    <tr 
                      key={role._id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                      }`}
                    >
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="text-gray-900 text-sm font-medium">{role.role_name}</div>
                      </td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                        {formatDate(role.createdAt)}
                      </td>
                      <td className="py-4 px-3 text-gray-600 text-sm">
                        <div className="max-w-[200px] truncate" title={role.permissions.join(", ")}>
                          {formatPermissions(role.permissions)}
                        </div>
                      </td>
                      <td className="py-4 px-3 text-gray-600 text-sm">
                        <div className="max-w-[200px] truncate" title={role.description}>
                          {role.description}
                        </div>
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        {getStatusBadge(role.status)}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                            className="p-1 h-8 w-8 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRole(role._id)}
                            disabled={deleteRoleMutation.isPending}
                            className="p-1 h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                {totalCount > 0 ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, totalCount)} of ${totalCount}` : '0 of 0'}
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
    </div>
  )
}