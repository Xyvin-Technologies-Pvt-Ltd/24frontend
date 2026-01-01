import { useState, useRef, useEffect } from "react"
import { TopBar } from "@/components/custom/top-bar"
import { CampaignsChart } from "@/components/custom/contentManagment/campaigns-chart"
import { AddCampaignForm } from "@/components/custom/contentManagment/add-campaign-form"
import { CampaignView } from "@/components/custom/contentManagment/campaign-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Plus, Search, SlidersHorizontal, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Edit, Trash2 } from "lucide-react"

export function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<"analytics" | "listOfCampaigns">("analytics")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateRange, setDateRange] = useState("Jan 2024 - Dec 2024")
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)
  const [viewingCampaign, setViewingCampaign] = useState<string | null>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)

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

  const stats = [
    {
      title: "Total Campaigns Created",
      value: "104",
      bgColor: "bg-[#EDEEFC]", // Light purple
    },
    {
      title: "Active Campaigns",
      value: "48",
      bgColor: "bg-[#E6F1FD]", // Light blue
    },
    {
      title: "Total Target Amount",
      value: "₹10,00,000",
      bgColor: "bg-[#EDEEFC]", // Light purple
    },
    {
      title: "Total Donors",
      value: "760",
      bgColor: "bg-[#E6F1FD]", // Light blue
    }
  ]

  // Sample campaigns data
  const campaigns = [
    {
      id: 1,
      name: "Campaign Name",
      status: "Active",
      targetAmount: "₹1,00,000",
      raisedSoFar: "₹1,00,000",
      donors: 52,
      deadline: "10/10/2024",
      category: "#Health"
    },
    {
      id: 2,
      name: "Campaign Name",
      status: "Closed",
      targetAmount: "₹1,00,000",
      raisedSoFar: "₹1,00,000",
      donors: 32,
      deadline: "10/10/2024",
      category: "#Medical"
    },
    {
      id: 3,
      name: "Campaign Name",
      status: "Active",
      targetAmount: "₹1,00,000",
      raisedSoFar: "₹1,00,000",
      donors: 59,
      deadline: "10/10/2024",
      category: "#Health"
    },
    {
      id: 4,
      name: "Campaign Name",
      status: "Active",
      targetAmount: "₹1,00,000",
      raisedSoFar: "₹1,00,000",
      donors: 22,
      deadline: "10/10/2024",
      category: "#Social"
    },
    {
      id: 5,
      name: "Campaign Name",
      status: "Closed",
      targetAmount: "₹1,00,000",
      raisedSoFar: "₹1,00,000",
      donors: 52,
      deadline: "10/10/2024",
      category: "#Health"
    },
    {
      id: 6,
      name: "Campaign Name",
      status: "Active",
      targetAmount: "₹1,00,000",
      raisedSoFar: "₹1,00,000",
      donors: 12,
      deadline: "10/10/2024",
      category: "#Education"
    },
    {
      id: 7,
      name: "Campaign Name",
      status: "Active",
      targetAmount: "₹1,00,000",
      raisedSoFar: "₹1,00,000",
      donors: 92,
      deadline: "10/10/2024",
      category: "#Health"
    },
    {
      id: 8,
      name: "Campaign Name",
      status: "Active",
      targetAmount: "₹1,00,000",
      raisedSoFar: "₹1,00,000",
      donors: 55,
      deadline: "10/10/2024",
      category: "#Health"
    }
  ]

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
    const campaign = campaigns.find(c => c.id === parseInt(campaignId))
    if (campaign) {
      setEditingCampaign(campaign)
      setViewingCampaign(null)
      setShowAddForm(true)
    }
  }

  const handleViewCampaign = (campaignId: number) => {
    setViewingCampaign(campaignId.toString())
  }

  const handleDropdownToggle = (campaignId: number) => {
    setOpenDropdown(openDropdown === campaignId ? null : campaignId)
  }

  const handleEditCampaign = (campaignId: number) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      setEditingCampaign(campaign)
      setShowAddForm(true)
    }
    setOpenDropdown(null)
  }

  const handleDeleteCampaign = (campaignId: number) => {
    console.log("Delete campaign:", campaignId)
    setOpenDropdown(null)
    // Add delete logic here
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
          
          <Button 
            onClick={handleAddCampaign}
            className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Campaign
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
              activeTab === "analytics"
                ? "text-red-500 border-red-500"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("listOfCampaigns")}
            className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
              activeTab === "listOfCampaigns"
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
                  <p className="text-3xl text-[#718EBF]">₹2,40,800</p>
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
                      <span className="text-sm text-gray-600">{dateRange}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* Date Picker Dropdown */}
                    {showDatePicker && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-[200px]">
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setDateRange("Jan 2024 - Dec 2024")
                              setShowDatePicker(false)
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                          >
                            Jan 2024 - Dec 2024
                          </button>
                          <button
                            onClick={() => {
                              setDateRange("Jan 2023 - Dec 2023")
                              setShowDatePicker(false)
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                          >
                            Jan 2023 - Dec 2023
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <CampaignsChart />
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
                    placeholder="Search members"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Table */}
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
                  {campaigns.map((campaign, index) => (
                    <tr 
                      key={campaign.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                      }`}
                    >
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="text-gray-900 text-sm">{campaign.name}</div>
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status === "Active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{campaign.targetAmount}</td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{campaign.raisedSoFar}</td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{campaign.donors}</td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{campaign.deadline}</td>
                      <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{campaign.category}</td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => handleViewCampaign(campaign.id)}
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </Button>
                          <div className="relative dropdown-container">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1 h-8 w-8"
                              onClick={() => handleDropdownToggle(campaign.id)}
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </Button>
                            
                            {/* Dropdown Menu */}
                            {openDropdown === campaign.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[120px]">
                                <button
                                  onClick={() => handleEditCampaign(campaign.id)}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCampaign(campaign.id)}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                  1-{Math.min(rowsPerPage, campaigns.length)} of {campaigns.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-1 h-8 w-8"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-1 h-8 w-8"
                  >
                    <ChevronRight className="w-4 h-4" />
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