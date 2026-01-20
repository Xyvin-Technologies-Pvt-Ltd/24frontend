import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "@/components/custom/top-bar"
import { useCreateRole, useUpdateRole } from "@/hooks/useRoles"
import { useToast } from "@/hooks/useToast"
import type { Role, CreateRoleData, UpdateRoleData } from "@/types/role"

interface AddRoleFormProps {
  onBack: () => void
  onSave: (roleData: any) => void
  editRole?: Role
  isEdit?: boolean
}

interface Permission {
  module: string
  view: boolean
  modify: boolean
}

const defaultPermissions: Permission[] = [
  { module: "Dashboard", view: false, modify: false },
  { module: "User Management", view: false, modify: false },
  { module: "Event Management", view: false, modify: false },
  { module: "Promotions", view: false, modify: false },
  { module: "Resources", view: false, modify: false },
  { module: "Campaigns", view: false, modify: false },
  { module: "Notifications", view: false, modify: false },
  { module: "Levels", view: false, modify: false },
  { module: "Post Approvals", view: false, modify: false },
  { module: "Campaign Approvals", view: false, modify: false },
  { module: "Admin Management", view: false, modify: false },
  { module: "Role Management", view: false, modify: false }
]

export function AddRoleForm({ onBack, onSave, editRole, isEdit = false }: AddRoleFormProps) {
  const { success, error: showError } = useToast()
  const createRoleMutation = useCreateRole()
  const updateRoleMutation = useUpdateRole()
  
  const isEditMode = isEdit || !!editRole
  const [formData, setFormData] = useState({
    roleName: editRole?.role_name || "",
    roleDescription: editRole?.description || ""
  })

  const convertBackendToUIPermissions = (backendPermissions: string[]): Permission[] => {
    const uiPermissions = defaultPermissions.map(p => ({ ...p }))

    backendPermissions.forEach(permission => {
      const parts = permission.split('_')
      const type = parts.pop() 
      const moduleKey = parts.join('_')

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

      const moduleName = moduleMap[moduleKey]
      if (moduleName && (type === 'view' || type === 'modify')) {
        const permissionIndex = uiPermissions.findIndex(p => p.module === moduleName)
        if (permissionIndex !== -1) {
          uiPermissions[permissionIndex][type] = true
        }
      }
    })

    return uiPermissions
  }

  const [permissions, setPermissions] = useState<Permission[]>(
    editRole?.permissions ? convertBackendToUIPermissions(editRole.permissions) : defaultPermissions.map(p => ({ ...p }))
  )

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePermissionChange = (moduleIndex: number, permissionType: 'view' | 'modify', checked: boolean) => {
    setPermissions(prev => prev.map((permission, index) => {
      if (index === moduleIndex) {
        return {
          ...permission,
          [permissionType]: checked
        }
      }
      return permission
    }))
  }

  const convertUIToBackendPermissions = (uiPermissions: Permission[]): string[] => {
    const backendPermissions: string[] = []
    const moduleMap: { [key: string]: string } = {
      'Dashboard': 'dashboard_management',
      'User Management': 'user_management',
      'Event Management': 'events_management',
      'Promotions': 'promotions_management',
      'Resources': 'resources_management',
      'Campaigns': 'campaigns_management',
      'Notifications': 'notifications_management',
      'Levels': 'levels_management',
      'Post Approvals': 'post_approvals',
      'Campaign Approvals': 'campaign_approvals',
      'Admin Management': 'admin_management',
      'Role Management': 'role_management'
    }

    uiPermissions.forEach(permission => {
      const moduleKey = moduleMap[permission.module]
      if (moduleKey) {
        if (permission.view) {
          backendPermissions.push(`${moduleKey}_view`)
        }
        if (permission.modify) {
          backendPermissions.push(`${moduleKey}_modify`)
        }
      }
    })

    return backendPermissions
  }

  const handleSave = async () => {
    if (!formData.roleName.trim() || !formData.roleDescription.trim()) {
      showError("Validation Error", "Please fill in all required fields")
      return
    }

    const backendPermissions = convertUIToBackendPermissions(permissions)
    if (backendPermissions.length === 0) {
      showError("Validation Error", "Please select at least one permission")
      return
    }

    try {
      const roleData: CreateRoleData | UpdateRoleData = {
        role_name: formData.roleName.trim(),
        description: formData.roleDescription.trim(),
        permissions: backendPermissions
      }

      if (isEditMode && editRole) {
        await updateRoleMutation.mutateAsync({
          id: editRole._id,
          roleData: roleData as UpdateRoleData
        })
        success("Role updated successfully")
      } else {
        await createRoleMutation.mutateAsync(roleData as CreateRoleData)
        success("Role created successfully")
      }

      onSave(roleData)
    } catch (error: any) {
      showError("Operation Failed", error?.response?.data?.message || "Something went wrong")
    }
  }

  const handleCancel = () => {
    onBack()
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        <div className="flex items-center text-sm text-gray-600 mb-8">
          <button
            onClick={onBack}
            className="hover:text-gray-900"
          >
            Settings
          </button>
          <span className="mx-2">›</span>
          <span>Role Management</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{isEditMode ? 'Edit Role' : 'Add Role'}</span>
        </div>

        <div className="bg-white rounded-2xl p-8 w-full">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name
              </label>
              <Input
                placeholder="Enter role name"
                value={formData.roleName}
                onChange={(e) => handleInputChange("roleName", e.target.value)}
                className="w-full border-gray-300 rounded-lg h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role description
              </label>
              <Input
                placeholder="Enter Role Description"
                value={formData.roleDescription}
                onChange={(e) => handleInputChange("roleDescription", e.target.value)}
                className="w-full border-gray-300 rounded-lg h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Designation
              </label>

              <div className="max-w-md border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium text-gray-700"></div>
                    <div className="text-center text-sm font-medium text-gray-700">View</div>
                    <div className="text-center text-sm font-medium text-gray-700">Modify</div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {permissions.map((permission, index) => (
                    <div key={permission.module} className="px-4 py-3">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm text-gray-900 pr-2">
                          {permission.module}
                        </div>
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={permission.view}
                            onChange={(e) => handlePermissionChange(index, 'view', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                          />
                        </div>
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={permission.modify}
                            onChange={(e) => handlePermissionChange(index, 'modify', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full min-w-[120px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full min-w-[120px] disabled:opacity-50"
              >
                {createRoleMutation.isPending || updateRoleMutation.isPending
                  ? "Saving..."
                  : isEditMode ? 'Update' : 'Save'
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}