import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { AddPromotionForm } from "@/components/custom/contentManagment/add-promotion-form"
import { usePromotions, useDeletePromotion } from "@/hooks/usePromotions"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ViewPromotionModal } from "@/components/custom/contentManagment/view-promotion-modal"
import { MoreHorizontal, Edit } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import type { Promotion } from "@/types/promotion"
import {
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
  Trash2
} from "lucide-react"

export function PromotionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showAddPromotionForm, setShowAddPromotionForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    startDate: "",
    endDate: ""
  })

  // TanStack Query for fetching promotions
  const queryParams = useMemo(() => ({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    status: (filters.status as 'published' | 'unpublished' | 'expired' | undefined) || undefined,
    type: (filters.type as 'poster' | undefined) || undefined,
    start_date: filters.startDate || undefined,
    end_date: filters.endDate || undefined,
  }), [currentPage, rowsPerPage, searchTerm, filters])

  const { data: promotionsResponse, isLoading, error, refetch } = usePromotions(queryParams)
  const deletePromotionMutation = useDeletePromotion()

  const promotions = promotionsResponse?.data || []
  const totalCount = promotionsResponse?.total_count || 0

  const handleAddPromotion = () => {
    setShowAddPromotionForm(true)
  }

  const handleBackToList = () => {
    setShowAddPromotionForm(false)
    setSelectedPromotion(null)
  }

  const handleSavePromotion = (promotionData: any) => {
    console.log("New promotion data:", promotionData)
    setShowAddPromotionForm(false)
    // Refetch promotions after adding new promotion
    refetch()
  }

  const handleViewPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setShowViewModal(true)
  }

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      await deletePromotionMutation.mutateAsync(promotionId)
    } catch (error) {
      console.error('Failed to delete promotion:', error)
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
      status: "",
      type: "",
      startDate: "",
      endDate: ""
    })
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "unpublished":
        return <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Show add promotion form if requested
  if (showAddPromotionForm) {
    return <AddPromotionForm
      onBack={handleBackToList}
      onSave={handleSavePromotion}
      initialData={selectedPromotion}
    />
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
            <span className="text-gray-900">Promotions</span>
          </div>
          <Button 
            className="bg-black rounded-full hover:bg-gray-800 text-white"
            onClick={handleAddPromotion}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Promotions
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
                  placeholder="Search promotions"
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

          {/* Promotions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Type</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Start Date</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">End Date</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Banner Image</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading promotions...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-red-600">
                      Error loading promotions. Please try again.
                    </td>
                  </tr>
                ) : promotions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No promotions found.
                    </td>
                  </tr>
                ) : (
                  promotions.map((promotion, index) => (
                    <tr 
                      key={promotion._id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                      }`}
                    >
                      <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap capitalize">{promotion.type}</td>
                      <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{formatDate(promotion.start_date)}</td>
                      <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{formatDate(promotion.end_date)}</td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(promotion.status)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {promotion.media ? (
                            <img 
                              src={promotion.media} 
                              alt={`${promotion.type} banner`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400 text-xs">No Image</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => handleViewPromotion(promotion)}
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </Button>
                          {/* 3-dot menu */}
                          <DropdownMenu
                            trigger={
                              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                              </Button>
                            }
                          >
                            <DropdownMenuItem
                              className="flex items-center gap-2 px-3 py-2 text-sm"
                              onClick={() => {
                                setSelectedPromotion(promotion)
                                setShowAddPromotionForm(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="flex items-center gap-2 px-3 py-2 text-sm"
                              onClick={() => handleDeletePromotion(promotion._id)}
                            >
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
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select 
                      value={filters.status} 
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      placeholder="Select status"
                      className="w-full rounded-2xl"
                    >
                      <option value="">All Statuses</option>
                      <option value="published">Published</option>
                      <option value="unpublished">Unpublished</option>
                      <option value="expired">Expired</option>
                    </Select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <Select 
                      value={filters.type} 
                      onChange={(e) => handleFilterChange("type", e.target.value)}
                      placeholder="Select type"
                      className="w-full rounded-2xl"
                    >
                      <option value="">All Types</option>
                      <option value="poster">Poster</option>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <DatePicker
                      selected={filters.startDate ? new Date(filters.startDate) : null}
                      onChange={(date: Date | null) =>
                        handleFilterChange(
                          "startDate",
                          date ? date.toISOString().split("T")[0] : ""
                        )
                      }
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      wrapperClassName="w-full"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-0 focus:border-gray-300 hover:border-gray-300"
                      calendarClassName="rounded-2xl border border-gray-300 bg-white"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <DatePicker
                      selected={filters.endDate ? new Date(filters.endDate) : null}
                      onChange={(date: Date | null) =>
                        handleFilterChange(
                          "endDate",
                          date ? date.toISOString().split("T")[0] : ""
                        )
                      }
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      wrapperClassName="w-full"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-0 focus:border-gray-300 hover:border-gray-300"
                      calendarClassName="rounded-2xl border border-gray-300 bg-white"
                    />
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
      <ViewPromotionModal
        isOpen={showViewModal}
        promotion={selectedPromotion}
        onClose={() => {
          setShowViewModal(false)
          setSelectedPromotion(null)
        }}
      />
    </div>
  )
}