import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { AddResourceForm } from "@/components/custom/contentManagment/add-resource-form"
import { useResources, useDeleteResource } from "@/hooks/useResources"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
  Trash2,
  MoreHorizontal,
  Edit
} from "lucide-react"

export function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showAddResourceForm, setShowAddResourceForm] = useState(false)
  const [editingResource, setEditingResource] = useState<any | null>(null)

  const [filters, setFilters] = useState({
    category: ""
  })

  // TanStack Query for fetching resources
  const queryParams = useMemo(() => ({
    page_no: currentPage,
    limit: rowsPerPage,
    category: filters.category || undefined,
  }), [currentPage, rowsPerPage, filters.category])

  const { data: resourcesResponse, isLoading, error, refetch } = useResources(queryParams)
  const deleteResourceMutation = useDeleteResource()

  const resources = resourcesResponse?.data || []
  const totalCount = resourcesResponse?.total_count || 0

  // Client-side search filtering since backend doesn't support search
  const filteredResources = resources.filter(resource => 
    !searchTerm || 
    resource.content_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique categories for filter options
  const uniqueCategories = [...new Set(resources.map(resource => resource.category).filter(Boolean))]

  const handleAddResource = () => {
    setEditingResource(null)
    setShowAddResourceForm(true)
  }

  const handleBackToList = () => {
    setShowAddResourceForm(false)
  }

  const handleSaveResource = (resourceData: any) => {
    console.log("New resource data:", resourceData)
    setEditingResource(null) 
    setShowAddResourceForm(false)
    // Refetch resources after adding new resource
    refetch()
  }

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await deleteResourceMutation.mutateAsync(resourceId)
    } catch (error) {
      console.error('Failed to delete resource:', error)
    }
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
      category: ""
    })
    setCurrentPage(1)
  }

  // Show add resource form if requested
  if (showAddResourceForm) {
    return <AddResourceForm
      onBack={handleBackToList}
      onSave={handleSaveResource}
      initialData={editingResource} />
  }

  const totalPages = Math.ceil(totalCount / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage

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
            <span className="text-gray-900">Resources</span>
          </div>
          <Button 
            className="bg-black rounded-full hover:bg-gray-800 text-white"
            onClick={handleAddResource}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
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
                  placeholder="Search resources"
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

          {/* Resources Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Content Name</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Category</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Content</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading resources...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-red-600">
                      Error loading resources. Please try again.
                    </td>
                  </tr>
                ) : filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No resources found.
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((resource, index) => (
                    <tr 
                      key={resource._id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                      }`}
                    >
                      <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{resource.content_name}</td>
                      <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{resource.category}</td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        <div className="max-w-xs truncate" title={resource.content}>
                          {resource.content}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => window.open(resource.content.startsWith('http') ? resource.content : `https://${resource.content}`, '_blank')}
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
                              onClick={() => {
                                setEditingResource(resource)
                                setShowAddResourceForm(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleDeleteResource(resource._id)}>
                              <Trash2 className="w-4 h-4" />
                              Delete
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
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select 
                      value={filters.category} 
                      onChange={(e) => handleFilterChange("category", e.target.value)}
                      placeholder="Select category"
                      className="w-full rounded-2xl"
                    >
                      <option value="">All Categories</option>
                      {uniqueCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
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
    </div>
  )
}