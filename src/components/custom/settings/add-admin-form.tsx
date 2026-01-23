  import { useState, useEffect } from "react"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Select } from "@/components/ui/select"
  import { TopBar } from "@/components/custom/top-bar"
  import { useQuery } from "@tanstack/react-query"
  import { roleService } from "@/services/roleService"
  import { User, CreateUserData } from "@/types/user"
  import { Role } from "@/types/role"

interface AddAdminFormProps {
  onBack: () => void
  onSave: (adminData: CreateUserData) => void
  editAdmin?: User
  isEdit?: boolean
}

  export function AddAdminForm({ onBack, onSave, editAdmin, isEdit = false }: AddAdminFormProps) {
    const [formData, setFormData] = useState({
      adminName: editAdmin?.name || "",
      designation: editAdmin?.profession || "",
      role: editAdmin?.admin_role?._id || "",
      email: editAdmin?.email || "",
      phoneNumber: editAdmin?.phone || ""
    })
    
    useEffect(() => {
      if (isEdit && editAdmin) {
        setFormData({
          adminName: editAdmin.name || "",
          designation: editAdmin.profession || "",
          role: editAdmin.admin_role?._id || "",
          email: editAdmin.email || "",
          phoneNumber: editAdmin.phone || ""
        })
      }
    }, [isEdit, editAdmin])

  // Fetch roles
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getRoles()
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    const adminData: CreateUserData = {
      name: formData.adminName,
      profession: formData.designation,
      admin_role: formData.role,
      email: formData.email,
      phone: formData.phoneNumber,
      status: "active"
    }
    onSave(adminData)
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
          <span>Admin Management</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{isEdit ? "Edit Admin" : "Add Admin"}</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 w-full">
          <div className="space-y-6">
            {/* Admin Name - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Name
              </label>
              <Input
                placeholder="Enter admin name"
                value={formData.adminName}
                onChange={(e) => handleInputChange("adminName", e.target.value)}
                className="w-full border-gray-300 rounded-lg h-12"
              />
            </div>

            {/* Designation and Role Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <Input
                  placeholder="Enter designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  className="w-full border-gray-300 rounded-lg h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  placeholder="Select"
                  className="w-full border-gray-300 rounded-lg h-12"
                >
                  <option value="">Select</option>
                  {roles?.data?.map((role: Role) => (
                    <option key={role._id} value={role._id}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Email and Phone Number Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full border-gray-300 rounded-lg h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className="w-full border-gray-300 rounded-lg h-12"
                />
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
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}