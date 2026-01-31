import { useState, useRef, useEffect, forwardRef } from "react"
import { TopBar } from "@/components/custom/top-bar"
import { CampaignsChart } from "@/components/custom/contentManagment/campaigns-chart"
import { AddCampaignForm } from "@/components/custom/contentManagment/add-campaign-form"
import { CampaignView } from "@/components/custom/contentManagment/campaign-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToastContainer } from "@/components/ui/toast"
import { ChevronDown, Plus, Search, SlidersHorizontal, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Edit, Trash2, Download, Calendar } from "lucide-react"
import { useCampaigns, useDeleteCampaign, useDownloadCampaigns } from "@/hooks/useCampaigns"
import { useToast } from "@/hooks/useToast"
import type { Campaign, CampaignsQueryParams } from "@/types/campaign"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
// Month-Year Input for custom picker
const MonthInput = forwardRef(({ value, onClick }: any, ref: any) => (
  <div className="relative w-full">
    <input
      type="text"
      readOnly
      value={value}
      onClick={onClick}
      ref={ref}
      className="w-full border border-gray-300 rounded-lg h-10 px-3 pr-10 text-gray-700 bg-white cursor-pointer"
    />
    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
))
MonthInput.displayName = "MonthInput"


export function CampaignsPage() {
  const { toasts, removeToast, success, error: showError } = useToast()

  const [activeTab, setActiveTab] = useState<"analytics" | "listOfCampaigns">("analytics")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear() - 1, 0, 1)) // Default to 1 year ago
  const [endDate, setEndDate] = useState<Date | null>(new Date()) // Default to today
  const [tempStart, setTempStart] = useState<Date | null>(new Date(new Date().getFullYear() - 1, 0, 1))
  const [tempEnd, setTempEnd] = useState<Date | null>(new Date())
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [viewingCampaign, setViewingCampaign] = useState<string | null>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)
  const [filters, setFilters] = useState<CampaignsQueryParams>({})
  const [showFilterModal, setShowFilterModal] = useState(false)

  const formatMonth = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }


  // API hooks - Include date filters by default
  const { data: campaignsData, isLoading, error: queryError } = useCampaigns({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    approval_status: filters.approval_status,
    start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
    end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
    my_campaigns: filters.my_campaigns
  })

  const deleteCampaignMutation = useDeleteCampaign()
  const downloadCampaignsMutation = useDownloadCampaigns()

  const campaigns = campaignsData?.data || []
  const totalCount = campaignsData?.total_count || 0

  // Calculate dynamic stats from campaigns data
  const totalTargetAmount = campaigns.reduce((sum, c) => sum + c.target_amount, 0)
  const totalRaisedAmount = campaigns.reduce((sum, c) => sum + (c.collected_amount || 0), 0)
  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length

  const stats = [
    {
      title: "Total Campaigns Created",
      value: totalCount.toString(),
      bgColor: "bg-[#EDEEFC]",
    },
    {
      title: "Active Campaigns",
      value: activeCampaignsCount.toString(),
      bgColor: "bg-[#E6F1FD]",
    },
    {
      title: "Total Target Amount",
      value: `₹${totalTargetAmount.toLocaleString()}`,
      bgColor: "bg-[#EDEEFC]",
    },
    {
      title: "Total Raised",
      value: `₹${totalRaisedAmount.toLocaleString()}`,
      bgColor: "bg-[#E6F1FD]",
    }
  ]

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
      // Close dropdown when clicking outside
      if (openDropdown !== null) {
        const target = event.target as Element
        if (!target.closest('.dropdown-container')) {
          setOpenDropdown(null)
        }
      }
    }

    if (showDatePicker || openDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker, openDropdown])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when searching
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, filters])

  const handleAddCampaign = () => {
    setEditingCampaign(null)
    setShowAddForm(true)
  }

  const handleSaveCampaign = (campaignData: any) => {
    console.log("Campaign saved:", campaignData)
    setShowAddForm(false)
  }

  const handleBackFromForm = () => {
    setShowAddForm(false)
    setEditingCampaign(null)
    setViewingCampaign(null)
  }

  const handleEditFromView = (campaignId: string) => {
    const campaign = campaigns.find(c => c._id === campaignId)
    if (campaign) {
      setEditingCampaign(campaign)
      setViewingCampaign(null)
      setShowAddForm(true)
    }
  }

  const handleViewCampaign = (campaignId: string) => {
    setViewingCampaign(campaignId)
  }

  const handleDropdownToggle = (campaignId: string) => {
    setOpenDropdown(openDropdown === campaignId ? null : campaignId)
  }

  const handleEditCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c._id === campaignId)
    if (campaign) {
      setEditingCampaign(campaign)
      setShowAddForm(true)
    }
    setOpenDropdown(null)
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaignMutation.mutateAsync(campaignId)
        success('Success', 'Campaign deleted successfully')
      } catch (err: any) {
        console.error('Failed to delete campaign:', err)
        const errorMessage = err?.response?.data?.message || 'Failed to delete campaign. Please try again.'
        showError('Error', errorMessage)
      }
    }
    setOpenDropdown(null)
  }

  const handleDownloadCampaigns = async () => {
    try {
      await downloadCampaignsMutation.mutateAsync({
        search: searchTerm || undefined,
        ...filters,
      })
      success('Success', 'Campaigns downloaded successfully')
    } catch (err: any) {
      console.error('Failed to download campaigns:', err)
      const errorMessage = err?.response?.data?.message || 'Failed to download campaigns. Please try again.'
      showError('Error', errorMessage)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  if (showAddForm) {
    return (
      <AddCampaignForm
        onBack={handleBackFromForm}
        onSave={handleSaveCampaign}
        editCampaign={editingCampaign}
        isEdit={!!editingCampaign}
      />
    )
  }

  if (viewingCampaign) {
    return (
      <CampaignView
        onBack={handleBackFromForm}
        onEdit={handleEditFromView}
        campaignId={viewingCampaign}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />

      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[80px] p-8 bg-gray-50 overflow-y-auto">
        {/* Header with breadcrumb and Add Campaign button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span>Content Management</span>
              <span className="mx-2">›</span>
              <span>Campaigns</span>
              <span className="mx-2">›</span>
              <span className="text-gray-900 font-medium">
                {activeTab === "analytics" ? "Analytics" : "List of Campaigns"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleDownloadCampaigns}
              disabled={downloadCampaignsMutation.isPending}
              variant="outline"
              className="border-gray-300 hover:border-gray-400 rounded-full px-6 py-2 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloadCampaignsMutation.isPending ? 'Downloading...' : 'Download'}
            </Button>

            <Button
              onClick={handleAddCampaign}
              className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Campaign
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`text-sm font-medium pb-3 border-b-2 transition-colors ${activeTab === "analytics"
                ? "text-red-500 border-red-500"
                : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("listOfCampaigns")}
            className={`text-sm font-medium pb-3 border-b-2 transition-colors ${activeTab === "listOfCampaigns"
                ? "text-red-500 border-red-500"
                : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
          >
            List of Campaigns
          </button>
        </div>

        {activeTab === "analytics" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border border-gray-200`}>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                    <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <h3 className="text-md font-semibold text-blue-600 mb-2">Total Amount Raised</h3>
                  <p className="text-3xl text-[#718EBF]">₹{totalRaisedAmount.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Legend */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Monthly Amount Raised</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Monthly Target Amount</span>
                    </div>
                  </div>

                  {/* Date Range Selector */}
                  <div className="relative" ref={datePickerRef}>
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                      <span className="text-sm text-gray-600">
                        {startDate ? formatMonth(startDate) : "Jan " + (new Date().getFullYear() - 1)} – {endDate ? formatMonth(endDate) : "Dec " + new Date().getFullYear()}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* Date Picker Dropdown */}
                    {showDatePicker && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-[300px]">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Select Date Range</span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Month</label>
                            <DatePicker
                              selected={tempStart}
                              onChange={(date: Date | null) => setTempStart(date)}
                              dateFormat="MMM yyyy"
                              showMonthYearPicker
                              customInput={<MonthInput />}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">End Month</label>
                            <DatePicker
                              selected={tempEnd}
                              onChange={(date: Date | null) => setTempEnd(date)}
                              dateFormat="MMM yyyy"
                              showMonthYearPicker
                              minDate={tempStart || undefined}
                              customInput={<MonthInput />}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setTempStart(startDate)
                              setTempEnd(endDate)
                              setShowDatePicker(false)
                            }}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setStartDate(tempStart)
                              setEndDate(tempEnd)
                              setShowDatePicker(false)
                              setCurrentPage(1) // Reset to first page when date range changes
                            }}
                            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <CampaignsChart startDate={startDate} endDate={endDate} />
            </div>
          </>
        )}

        {activeTab === "listOfCampaigns" && (
          <div className="bg-white rounded-2xl border border-gray-200">
            {/* Search Bar - Inside the card, above the table */}
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
                  onClick={() => setShowFilterModal(true)}
                  className="ml-4 border-[#B3B3B3] hover:border-[#B3B3B3] rounded-lg"
                >

                  <SlidersHorizontal className="w-4 h-4 text-[#B3B3B3]" />
                </Button>
              </div>
            </div>
            {/* Filter Drawer (Right Side) */}
            {showFilterModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                <div className="bg-white w-80 h-full shadow-lg rounded-l-2xl flex flex-col">
                  <div className="p-6 flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-medium text-gray-900">Filter by</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilterModal(false)}
                        className="p-1 h-8 w-8"
                      >
                        ✕
                      </Button>
                    </div>

                    {/* Filter Options */}
                    <div className="space-y-6">
                      {/* Approval Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Approval Status
                        </label>
                        <select
                          value={filters.approval_status || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === "approved" || value === "pending" || value === "rejected") {
                              setFilters(prev => ({ ...prev, approval_status: value }))
                            } else {
                              setFilters(prev => ({ ...prev, approval_status: undefined }))
                            }
                          }}
                          className="w-full border rounded-2xl px-3 py-2 text-sm"
                        >
                          <option value="">All</option>
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>


                      {/* Start Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <DatePicker
                          selected={filters.start_date ? new Date(filters.start_date) : null}
                          onChange={(date: Date | null) =>
                            setFilters(prev => ({
                              ...prev,
                              start_date: date ? date.toISOString().split("T")[0] : undefined
                            }))
                          }
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select"
                          maxDate={new Date()}
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={100}
                          wrapperClassName="w-full"
                          className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-0 focus:border-gray-300 hover:border-gray-300"
                          calendarClassName="rounded-2xl border border-gray-300 bg-white"
                        />
                      </div>

                      {/* End Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <DatePicker
                          selected={filters.end_date ? new Date(filters.end_date) : null}
                          onChange={(date: Date | null) =>
                            setFilters(prev => ({
                              ...prev,
                              end_date: date ? date.toISOString().split("T")[0] : undefined
                            }))
                          }
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Select"
                          maxDate={new Date()}
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={100}
                          wrapperClassName="w-full"
                          className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-0 focus:border-gray-300 hover:border-gray-300"
                          calendarClassName="rounded-2xl border border-gray-300 bg-white"
                        />
                      </div>

                      {/* My Campaigns */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!filters.my_campaigns}
                          onChange={(e) =>
                            setFilters(prev => ({ ...prev, my_campaigns: e.target.checked || undefined }))
                          }
                        />
                        <span className="text-sm">My campaigns only</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-2xl"
                        onClick={() => {
                          setFilters({})
                          setShowFilterModal(false)
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        className="flex-1 bg-black hover:bg-gray-800 text-white rounded-2xl"
                        onClick={() => {
                          if (filters.start_date && !filters.end_date) {
                            showError("Error", "Please select end date")
                            return
                          }
                          setCurrentPage(1)
                          setShowFilterModal(false)
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading campaigns...</div>
              </div>
            )}

            {/* Error State */}
            {queryError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-500">Failed to load campaigns. Please try again.</div>
              </div>
            )}

            {/* Table */}
            {!isLoading && !queryError && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr className="">
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Campaign Name</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Target Amount</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Raised so far</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Donors</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Deadline</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Category</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-gray-500">
                            No campaigns found
                          </td>
                        </tr>
                      ) : (
                        campaigns.map((campaign, index) => (
                          <tr
                            key={campaign._id}
                            className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                              }`}
                          >
                            <td className="py-4 px-3 whitespace-nowrap">
                              <div className="text-gray-900 text-sm">{campaign.title}</div>
                            </td>
                            <td className="py-4 px-3 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${campaign.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : campaign.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {formatCurrency(campaign.target_amount)}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {formatCurrency(campaign.collected_amount)}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {campaign.total_donor_count || 0}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {formatDate(campaign.target_date)}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              #{campaign.tag}
                            </td>
                            <td className="py-4 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-8 w-8"
                                  onClick={() => handleViewCampaign(campaign._id)}
                                >
                                  <Eye className="w-4 h-4 text-gray-400" />
                                </Button>
                                <div className="relative dropdown-container">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-8 w-8"
                                    onClick={() => handleDropdownToggle(campaign._id)}
                                  >
                                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                  </Button>

                                  {/* Dropdown Menu */}
                                  {openDropdown === campaign._id && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[120px]">
                                      <button
                                        onClick={() => handleEditCampaign(campaign._id)}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCampaign(campaign._id)}
                                        disabled={deleteCampaignMutation.isPending}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        {deleteCampaignMutation.isPending ? 'Deleting...' : 'Delete'}
                                      </button>
                                    </div>
                                  )}
                                </div>
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
                      {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-8 w-8"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-8 w-8"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage * rowsPerPage >= totalCount}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}