import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { TopBar } from "@/components/custom/top-bar"
import { ConfirmationModal } from "@/components/custom/confirmation-modal"
import { ViewCampaignModal } from "@/components/custom/approvals/view-campaign-modal"
import { campaignService } from "@/services/campaignService"
import type { Campaign } from "@/types/campaign"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
  Search,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react"

interface CampaignDisplay {
  id: string
  campaignName: string
  createdBy: string
  startDate: string
  endDate: string
  campaignType: string
  targetAmount: string
  status: "pending" | "approved" | "rejected"
  originalData: Campaign
}

export function CampaignsApprovalPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [campaigns, setCampaigns] = useState<CampaignDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDisplay | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  })

  const transformCampaignData = (backendCampaign: Campaign): CampaignDisplay => {
    try {
      return {
        id: backendCampaign._id,
        campaignName: backendCampaign.title || "Untitled Campaign",
        createdBy: backendCampaign.organized_by || "Unknown",
        startDate: backendCampaign.start_date ? 
          new Date(backendCampaign.start_date).toLocaleDateString('en-GB') + " | " + 
          new Date(backendCampaign.start_date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
          }) : "Not specified",
        endDate: backendCampaign.target_date ? 
          new Date(backendCampaign.target_date).toLocaleDateString('en-GB') + " | " + 
          new Date(backendCampaign.target_date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
          }) : "Not specified",
        campaignType: backendCampaign.tag || "General",
        targetAmount: `₹${(backendCampaign.target_amount || 0).toLocaleString('en-IN')}`,
        status: (backendCampaign.approval_status || 'pending') as "pending" | "approved" | "rejected",
        originalData: backendCampaign
      }
    } catch (error) {
      return {
        id: backendCampaign._id || 'unknown',
        campaignName: "Error loading campaign",
        createdBy: "Unknown",
        startDate: "Not specified",
        endDate: "Not specified",
        campaignType: "General",
        targetAmount: "₹0",
        status: "pending",
        originalData: backendCampaign
      }
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await campaignService.getCampaigns({
        page_no: currentPage,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        approval_status: 'pending',
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
      })
      
      if (response && response.data && Array.isArray(response.data)) {
        const transformedCampaigns = response.data.map(transformCampaignData)
        setCampaigns(transformedCampaigns)
        setTotalCount(response.total_count || 0)
      } else {
        setCampaigns([])
        setTotalCount(0)
      }
    } catch (error) {
      setCampaigns([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [currentPage, rowsPerPage])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchCampaigns()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleViewCampaign = (campaign: CampaignDisplay) => {
    setSelectedCampaign(campaign)
    setShowViewModal(true)
  }

  const handleApproveClick = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      setSelectedCampaign(campaign)
      setShowApproveModal(true)
    }
  }

  const handleRejectClick = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      setSelectedCampaign(campaign)
      setShowRejectModal(true)
    }
  }

  const handleConfirmApprove = async () => {
    if (!selectedCampaign) return
    
    try {
      setActionLoading(true)
      await campaignService.approveCampaign(selectedCampaign.id, {
        approval_status: 'approved'
      })
      
      setCampaigns(prev => prev.filter(campaign => campaign.id !== selectedCampaign.id))
      setTotalCount(prev => prev - 1)
    } catch (error) {
      alert('Failed to approve campaign. Please try again.')
    } finally {
      setActionLoading(false)
      setShowApproveModal(false)
      setSelectedCampaign(null)
    }
  }

  const handleConfirmReject = async () => {
    if (!selectedCampaign) return
    
    try {
      setActionLoading(true)
      await campaignService.approveCampaign(selectedCampaign.id, {
        approval_status: 'rejected'
      })
      
      setCampaigns(prev => prev.filter(campaign => campaign.id !== selectedCampaign.id))
      setTotalCount(prev => prev - 1)
    } catch (error) {
      alert('Failed to reject campaign. Please try again.')
    } finally {
      setActionLoading(false)
      setShowRejectModal(false)
      setSelectedCampaign(null)
    }
  }

  const handleCloseModals = () => {
    setShowApproveModal(false)
    setShowRejectModal(false)
    setShowViewModal(false)
    setSelectedCampaign(null)
  }

  
  // Helper function to parse YYYY-MM-DD as local date
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return null
    const [year, month, day] = dateStr.split("-").map(Number)
    return new Date(year, month - 1, day)
  }
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: ""
    })
  }

  const applyFilters = () => {
    setIsFilterOpen(false)
    setCurrentPage(1)
    fetchCampaigns()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-xs px-3 py-1 rounded-full">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const totalPages = Math.ceil(totalCount / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <span>Approvals</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Campaigns</span>
        </div>
        
        {/* Main Table Card */}
        <div className="bg-white rounded-2xl border border-gray-200">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search campaigns"
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

          {!loading && campaigns.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-gray-400 text-lg mb-2">No pending campaigns found</div>
                <div className="text-gray-500 text-sm">All campaigns have been reviewed or no campaigns match your search.</div>
              </div>
            </div>
          )}

          {/* Campaigns Table */}
          {!loading && campaigns.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Campaign Name</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Created by</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Start Date</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">End Date</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Campaign Type</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Target Amount</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign, index) => (
                    <tr 
                      key={campaign.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                      }`}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-900 text-sm font-medium">{campaign.campaignName}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-600 text-sm">{campaign.createdBy}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-600 text-sm">{campaign.startDate}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-600 text-sm">{campaign.endDate}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-600 text-sm">{campaign.campaignType}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-600 text-sm font-medium">{campaign.targetAmount}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => handleViewCampaign(campaign)}
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
                              onClick={() => handleApproveClick(campaign.id)}
                            >
                              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 px-3 py-2 text-sm"
                              onClick={() => handleRejectClick(campaign.id)}
                            >
                              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && campaigns.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select 
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
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
          )}
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

                {/* Start Date */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Start Date</label>
                  <DatePicker
                    selected={parseLocalDate(filters.startDate)}
                    onChange={(date: Date | null) =>
                      handleFilterChange(
                        "startDate",
                        date ? date.toISOString().split("T")[0] : ""
                      )
                    }
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select"
                    maxDate={new Date()}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    wrapperClassName="w-full"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-gray-900 text-sm focus:outline-none focus:ring-0 hover:border-gray-300"
                  />
                </div>

                {/* End Date */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">End Date</label>
                  <DatePicker
                    selected={parseLocalDate(filters.endDate)}
                    onChange={(date: Date | null) =>
                      handleFilterChange(
                        "endDate",
                        date ? date.toISOString().split("T")[0] : ""
                      )
                    }
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select"
                    maxDate={new Date()}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    wrapperClassName="w-full"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-gray-900 text-sm focus:outline-none focus:ring-0 hover:border-gray-300"
                  />
                </div>

               

      
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="p-6">
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

      {/* Modals */}
      <ViewCampaignModal
        isOpen={showViewModal}
        onClose={handleCloseModals}
        campaign={selectedCampaign?.originalData || null}
      />

      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={handleCloseModals}
        onConfirm={handleConfirmApprove}
        title="Approve Campaign"
        message={`Are you sure you want to approve the campaign "${selectedCampaign?.campaignName}"?`}
        confirmText={actionLoading ? "Approving..." : "Confirm"}
        cancelText="Cancel"
        disabled={actionLoading}
      />

      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={handleCloseModals}
        onConfirm={handleConfirmReject}
        title="Reject Campaign"
        message={`Are you sure you want to reject the campaign "${selectedCampaign?.campaignName}"?`}
        confirmText={actionLoading ? "Rejecting..." : "Confirm"}
        cancelText="Cancel"
        disabled={actionLoading}
      />
    </div>
  )
}