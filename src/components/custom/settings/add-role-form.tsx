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

const permissionsList = [
  { id: "dashboard_management", name: "Dashboard" },
  { id: "user_management", name: "User Management" },
  { id: "events_management", name: "Event Management" },
  { id: "promotions_management", name: "Promotions" },
  { id: "resources_management", name: "Resources" },
  { id: "campaigns_management", name: "Campaigns" },
  { id: "notifications_management", name: "Notifications" },
  { id: "levels_management", name: "Levels" },
  { id: "post_approvals", name: "Post Approvals" },
  { id: "campaign_approvals", name: "Campaign Approvals" },
  { id: "admin_management", name: "Admin Management" },
  { id: "survey_management", name: "Survey Management" }, 
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

  const [permissions, setPermissions] = useState<string[]>(
    editRole?.permissions || []
  )

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePermissionChange = (permissionId: string, type: 'view' | 'modify') => {
    const permissionKey = `${permissionId}_${type}`
    setPermissions(prev =>
      prev.includes(permissionKey)
        ? prev.filter(p => p !== permissionKey)
        : [...prev, permissionKey]
    )
  }

  const isPermissionSelected = (permissionId: string, type: 'view' | 'modify') => {
    return permissions.includes(`${permissionId}_${type}`)
  }

  const handleSave = async () => {
    if (!formData.roleName.trim() || !formData.roleDescription.trim()) {
      showError("Validation Error", "Please fill in all required fields")
      return
    }

    if (permissions.length === 0) {
      showError("Validation Error", "Please select at least one permission")
      return
    }

    try {
      const roleData: CreateRoleData | UpdateRoleData = {
        role_name: formData.roleName.trim(),
        description: formData.roleDescription.trim(),
        permissions: permissions
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
                  {permissionsList.map((permission) => (
                    <div key={permission.id} className="px-4 py-3">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm text-gray-900 pr-2">
                          {permission.name}
                        </div>
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={isPermissionSelected(permission.id, 'view')}
                            onChange={() => handlePermissionChange(permission.id, 'view')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                          />
                        </div>
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={isPermissionSelected(permission.id, 'modify')}
                            onChange={() => handlePermissionChange(permission.id, 'modify')}
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