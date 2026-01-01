import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "@/components/custom/top-bar"

interface AddRoleFormProps {
  onBack: () => void
  onSave: (roleData: any) => void
  editRole?: any
  isEdit?: boolean
}

interface Permission {
  module: string
  view: boolean
  modify: boolean
}

const defaultPermissions: Permission[] = [
  { module: "Dashboard", view: true, modify: false },
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
  // isEdit flag determines form behavior and validation
  const isEditMode = isEdit || !!editRole
  const [formData, setFormData] = useState({
    roleName: editRole?.roleName || "",
    roleDescription: editRole?.roleDescription || ""
  })

  const [permissions, setPermissions] = useState<Permission[]>(
    editRole?.permissions || defaultPermissions
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

  const handleSave = () => {
    const roleData = {
      ...formData,
      permissions,
      status: "Active" // Default status for new role
    }
    onSave(roleData)
  }

  const handleCancel = () => {
    onBack()
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
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

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 w-full">
          <div className="space-y-6">
            {/* Role Name - Full Width */}
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

            {/* Role Description - Full Width */}
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

            {/* Designation Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Designation
              </label>
              
              {/* Permission Table - Reduced width */}
              <div className="max-w-md border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium text-gray-700"></div>
                    <div className="text-center text-sm font-medium text-gray-700">View</div>
                    <div className="text-center text-sm font-medium text-gray-700">Modify</div>
                  </div>
                </div>

                {/* Permission Rows */}
                <div className="divide-y divide-gray-200">
                  {permissions.map((permission, index) => (
                    <div key={permission.module} className="px-4 py-3">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm text-gray-900 pr-2">
                          {permission.module}
                        </div>
                        <div className="flex justify-center">
                          <input
                            type="radio"
                            name={`${permission.module}-permission`}
                            checked={permission.view && !permission.modify}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handlePermissionChange(index, 'view', true)
                                handlePermissionChange(index, 'modify', false)
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex justify-center">
                          <input
                            type="radio"
                            name={`${permission.module}-permission`}
                            checked={permission.modify}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handlePermissionChange(index, 'view', false)
                                handlePermissionChange(index, 'modify', true)
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full min-w-[120px]"
              >
                {isEditMode ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}