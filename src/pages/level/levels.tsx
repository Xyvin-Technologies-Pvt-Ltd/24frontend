import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { TopBar } from "@/components/custom/top-bar"
import { AddLevelForm } from "@/components/custom/levels/add-level-form"
import { districtService } from "@/services/district.service"
import { campusService } from "@/services/campus.service"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Edit,
  Trash2,
  X,
  Loader2
} from "lucide-react"
import { Select } from "@/components/ui/select"

interface District {
  id: string
  districtName: string
  districtId: string
  dateCreated: string
  totalCampuses: number
  totalMembers: number
}

interface Campus {
  id: string
  campusName: string
  campusId: string
  district: string
  dateCreated: string
  totalMembers: number
}

interface UnlistedCampus {
  id: string
  campusName: string
  district: string
}

export function LevelsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("district")
  const [campusSubTab, setCampusSubTab] = useState("listed")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showAddForm, setShowAddForm] = useState(false)

  const [districts, setDistricts] = useState<District[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [unlistedCampuses, setUnlistedCampuses] = useState<UnlistedCampus[]>([])

  // Lookup list for dropdowns and name mapping
  const [allDistrictsData, setAllDistrictsData] = useState<{ id: string, name: string }[]>([])

  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    minCampuses: "",
    maxCampuses: "",
    minMembers: "",
    maxMembers: "",
    district: "" // for campus tab
  })

  // Applied filters state (to trigger re-fetch only on Apply)
  const [appliedFilters, setAppliedFilters] = useState(filters)

  // Fetch all districts for lookup purposes (mapping IDs to names)
  useEffect(() => {
    const fetchAllDistricts = async () => {
      try {
        const response = await districtService.getDistricts({ full_data: true, status: 'active' })
        if (response.data) {
          setAllDistrictsData(response.data.map((d: any) => ({ id: d._id, name: d.name })))
        }
      } catch (error) {
        console.error("Failed to fetch all districts", error)
      }
    }
    fetchAllDistricts()
  }, [])

  // Main Data Fetching Effect
  useEffect(() => {
    fetchData()
  }, [activeTab, campusSubTab, currentPage, rowsPerPage, searchTerm, appliedFilters])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === "district") {
        const res = await districtService.getDistricts({
          page_no: currentPage,
          limit: rowsPerPage,
          search: searchTerm,
          status: 'active'
        })

        // Map data first
        let mappedDistricts = await Promise.all((res.data || []).map(async (d: any) => {
          let campusCount = 0;
          try {
            // Fetch campus count for this district
            const campusRes = await campusService.getCampuses({
              district: d._id,
              limit: 1 // We only need the total_count
            });
            campusCount = campusRes.total_count || 0;
          } catch (err) {
            console.error(`Failed to fetch campus count for district ${d.name}`, err);
          }

          return {
            id: d._id,
            districtName: d.name,
            districtId: d.uid,
            dateCreated: new Date(d.createdAt).toLocaleDateString("en-GB"),
            totalCampuses: campusCount,
            totalMembers: d.totalMembers || d.memberCount || 0
          };
        }));

        // Client-side filtering for District stats
        if (appliedFilters.minCampuses || appliedFilters.maxCampuses || appliedFilters.minMembers || appliedFilters.maxMembers) {
          mappedDistricts = mappedDistricts.filter((d: any) => {
            const minC = appliedFilters.minCampuses ? parseInt(appliedFilters.minCampuses) : -1
            const maxC = appliedFilters.maxCampuses ? parseInt(appliedFilters.maxCampuses) : Infinity
            const minM = appliedFilters.minMembers ? parseInt(appliedFilters.minMembers) : -1
            const maxM = appliedFilters.maxMembers ? parseInt(appliedFilters.maxMembers) : Infinity

            const checkCampuses = d.totalCampuses >= minC && d.totalCampuses <= maxC
            const checkMembers = d.totalMembers >= minM && d.totalMembers <= maxM

            return checkCampuses && checkMembers
          })
          // Note: Pagination counts will be inaccurate with client-side filtering on server-side paginated data.
          // Ideally, this should be done on the backend.
        }

        setDistricts(mappedDistricts)
        setTotalItems(res.total_count || 0)

      } else if (activeTab === "campus") {
        const status = campusSubTab === "listed" ? "listed" : "unlisted"
        const res = await campusService.getCampuses({
          page_no: currentPage,
          limit: rowsPerPage,
          search: searchTerm,
          status: status,
          district: appliedFilters.district || undefined // Pass district filter to API
        })

        if (status === "listed") {
          const mappedCampuses = (res.data || []).map((c: any) => {
            // Find district name from allDistrictsData
            const districtObj = allDistrictsData.find(d => d.id === c.district)
            return {
              id: c._id,
              campusName: c.name,
              campusId: c.uid,
              district: districtObj ? districtObj.name : "Unknown",
              dateCreated: new Date(c.createdAt).toLocaleDateString("en-GB"),
              totalMembers: c.totalMembers || c.memberCount || 0
            }
          })
          setCampuses(mappedCampuses)
        } else {
          // Unlisted
          const mappedUnlisted = (res.data || []).map((c: any) => {
            const districtObj = allDistrictsData.find(d => d.id === c.district)
            return {
              id: c._id,
              campusName: c.name,
              district: districtObj ? districtObj.name : "Unknown",
            }
          })
          setUnlistedCampuses(mappedUnlisted)
        }
        setTotalItems(res.total_count || 0)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
    setSearchTerm("")
    // Reset filters when changing main tabs? Depending on UX requirements.
    // Usually good practice to valid invalid filters for the new tab.
    resetFilters()
  }

  const handleCampusSubTabChange = (value: string) => {
    setCampusSubTab(value)
    setCurrentPage(1)
    setSearchTerm("")
  }

  const handleAddLevel = () => {
    setShowAddForm(true)
  }

  const handleBackToList = () => {
    setShowAddForm(false)
  }

  const handleEditLevel = (levelId: string) => {
    // Handle edit functionality
    console.log("Edit level:", levelId)
    // TODO: Implement edit functionality
  }

  const handleDeleteLevel = async (levelId: string) => {
    // Optimistic update or wait for API? Let's wait for API to be safe
    if (!confirm("Are you sure you want to delete this level?")) return

    try {
      if (activeTab === "district") {
        await districtService.deleteDistrict(levelId)
      } else {
        await campusService.deleteCampus(levelId)
      }
      // Refresh data
      fetchData()
    } catch (error) {
      console.error("Failed to delete level", error)
      alert("Failed to delete level")
    }
  }

  const handleSaveLevel = async (levelData: any) => {
    try {
      if (levelData.type === "district") {
        await districtService.createDistrict({
          name: levelData.levelName
        })
        // Refresh all districts list as well since a new one was added
        const res = await districtService.getDistricts({ full_data: true, status: 'active' })
        if (res.data) {
          setAllDistrictsData(res.data.map((d: any) => ({ id: d._id, name: d.name })))
        }

      } else {
        await campusService.createCampus({
          name: levelData.levelName,
          district: levelData.district
        })
      }

      setShowAddForm(false)
      fetchData()
    } catch (error: any) {
      console.error("Failed to save level", error)
      alert(error.response?.data?.message || "Failed to save level")
    }
  }

  // Filter Handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      minCampuses: "",
      maxCampuses: "",
      minMembers: "",
      maxMembers: "",
      district: ""
    })
    setAppliedFilters({
      minCampuses: "",
      maxCampuses: "",
      minMembers: "",
      maxMembers: "",
      district: ""
    })
    setCurrentPage(1)
  }

  const applyFilters = () => {
    setAppliedFilters(filters)
    setIsFilterOpen(false)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalItems / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage

  // Show add level form if requested
  if (showAddForm) {
    return (
      <AddLevelForm
        onBack={handleBackToList}
        onSave={handleSaveLevel}
        levelType={activeTab as "district" | "campus"}
        districts={allDistrictsData}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Levels</h1>
          <Button
            className="bg-black rounded-full hover:bg-gray-800 text-white"
            onClick={handleAddLevel}
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === "district" ? "Add District" : "Add Campus"}
          </Button>
        </div>

        {/* Main Tabs */}
        <div className="mb-6">
          <div className="bg-transparent border-b border-gray-200 rounded-none p-0 h-auto">
            <button
              onClick={() => handleTabChange("district")}
              className={`px-0 py-3 mr-8 border-b-2 rounded-none bg-transparent ${activeTab === "district"
                ? "border-red-500 text-red-500"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              District
            </button>
            <button
              onClick={() => handleTabChange("campus")}
              className={`px-0 py-3 border-b-2 rounded-none bg-transparent ${activeTab === "campus"
                ? "border-red-500 text-red-500"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Campus
            </button>
          </div>

          {/* Campus Sub-tabs */}
          {activeTab === "campus" && (
            <div className="mt-6 mb-4">
              <div className="flex gap-8">
                <button
                  onClick={() => handleCampusSubTabChange("listed")}
                  className={`text-sm font-medium ${campusSubTab === "listed"
                    ? "text-red-500"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Listed Campus
                </button>
                <button
                  onClick={() => handleCampusSubTabChange("unlisted")}
                  className={`text-sm font-medium ${campusSubTab === "unlisted"
                    ? "text-red-500"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Unlisted Campus
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mt-6">
            <div className="bg-white rounded-2xl border border-gray-200">
              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-end">
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search..."
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

              {/* Table */}
              <div className="overflow-x-auto relative min-h-[400px]">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <Loader2 className="animate-spin h-8 w-8 border-gray-900 text-gray-900" />
                  </div>
                )}
                <table className="w-full">
                  <thead className="bg-white">
                    <tr>
                      {activeTab === "district" ? (
                        <>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">District Name</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">District ID</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Date Created</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Total Campuses</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Total Members</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                        </>
                      ) : campusSubTab === "listed" ? (
                        <>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Campus Name</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Campus ID</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">District</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Date Created</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Total Members</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                        </>
                      ) : (
                        <>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Campus Name</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">District</th>
                          <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === "district" && districts.map((district, index) => (
                      <tr
                        key={district.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                          }`}
                      >
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="text-gray-900 text-sm">{district.districtName}</div>
                        </td>
                        <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{district.districtId}</td>
                        <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{district.dateCreated}</td>
                        <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{district.totalCampuses}</td>
                        <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{district.totalMembers}</td>
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
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
                                onClick={() => handleEditLevel(district.id)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600"
                                onClick={() => handleDeleteLevel(district.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {activeTab === "campus" && campusSubTab === "listed" && campuses.map((campus, index) => (
                      <tr
                        key={campus.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                          }`}
                      >
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="text-gray-900 text-sm">{campus.campusName}</div>
                        </td>
                        <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{campus.campusId}</td>
                        <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{campus.district}</td>
                        <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{campus.dateCreated}</td>
                        <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{campus.totalMembers}</td>
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
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
                                onClick={() => handleEditLevel(campus.id)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600"
                                onClick={() => handleDeleteLevel(campus.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {activeTab === "campus" && campusSubTab === "unlisted" && unlistedCampuses.map((campus, index) => (
                      <tr
                        key={campus.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                          }`}
                      >
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="text-gray-900 text-sm">{campus.campusName}</div>
                        </td>
                        <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">{campus.district}</td>
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <DropdownMenu
                              trigger={
                                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </Button>
                              }
                            >
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm"
                                onClick={() => handleEditLevel(campus.id)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600"
                                onClick={() => handleDeleteLevel(campus.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && totalItems === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No {activeTab === "district" ? "districts" : "campuses"} found
                        </td>
                      </tr>
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
                    {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems}
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
                      disabled={currentPage >= totalPages}
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
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-80 h-full shadow-lg rounded-l-2xl flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
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

                {activeTab === "district" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Campuses
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minCampuses}
                          onChange={(e) => handleFilterChange("minCampuses", e.target.value)}
                          className="w-full rounded-2xl"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxCampuses}
                          onChange={(e) => handleFilterChange("maxCampuses", e.target.value)}
                          className="w-full rounded-2xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Members
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minMembers}
                          onChange={(e) => handleFilterChange("minMembers", e.target.value)}
                          className="w-full rounded-2xl"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxMembers}
                          onChange={(e) => handleFilterChange("maxMembers", e.target.value)}
                          className="w-full rounded-2xl"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "campus" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    <Select
                      value={filters.district}
                      onChange={(e) => handleFilterChange("district", e.target.value)}
                      placeholder="Select District"
                      className="w-full rounded-2xl"
                    >
                      {allDistrictsData.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="p-6 border-t border-gray-100">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
                >
                  Clear
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
    </div>
  )
}