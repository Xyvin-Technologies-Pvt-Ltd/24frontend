import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { TopBar } from "@/components/custom/top-bar"
import { AddLevelForm } from "@/components/custom/levels/add-level-form"
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Edit,
  Trash2
} from "lucide-react"

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

const mockDistricts: District[] = [
  {
    id: "1",
    districtName: "Kochi",
    districtId: "ID-KC002",
    dateCreated: "25/04/2024",
    totalCampuses: 15,
    totalMembers: 75
  },
  {
    id: "2",
    districtName: "Malappuram",
    districtId: "ID-MP003",
    dateCreated: "26/04/2024",
    totalCampuses: 20,
    totalMembers: 60
  },
  {
    id: "3",
    districtName: "Kottayam",
    districtId: "ID-KT004",
    dateCreated: "27/04/2024",
    totalCampuses: 8,
    totalMembers: 92
  },
  {
    id: "4",
    districtName: "Alappuzha",
    districtId: "ID-AP005",
    dateCreated: "28/04/2024",
    totalCampuses: 12,
    totalMembers: 85
  },
  {
    id: "5",
    districtName: "Pathanamthitta",
    districtId: "ID-PT006",
    dateCreated: "29/04/2024",
    totalCampuses: 30,
    totalMembers: 70
  },
  {
    id: "6",
    districtName: "Idukki",
    districtId: "ID-ID007",
    dateCreated: "30/04/2024",
    totalCampuses: 18,
    totalMembers: 65
  },
  {
    id: "7",
    districtName: "Ernakulam",
    districtId: "ID-ER008",
    dateCreated: "01/05/2024",
    totalCampuses: 25,
    totalMembers: 80
  },
  {
    id: "8",
    districtName: "Wayanad",
    districtId: "ID-WD009",
    dateCreated: "02/05/2024",
    totalCampuses: 22,
    totalMembers: 78
  },
  {
    id: "9",
    districtName: "Palakkad",
    districtId: "ID-PK010",
    dateCreated: "03/05/2024",
    totalCampuses: 17,
    totalMembers: 66
  }
]

const mockCampuses: Campus[] = [
  {
    id: "1",
    campusName: "Sunset Valley Campus",
    campusId: "ID-CMG002",
    district: "Kochi",
    dateCreated: "30/05/2024",
    totalMembers: 85
  },
  {
    id: "2",
    campusName: "Mountain Ridge Campus",
    campusId: "ID-CMG003",
    district: "Kozhikode",
    dateCreated: "15/06/2024",
    totalMembers: 90
  },
  {
    id: "3",
    campusName: "Lakeside Campus",
    campusId: "ID-CMG004",
    district: "Alappuzha",
    dateCreated: "20/07/2024",
    totalMembers: 80
  },
  {
    id: "4",
    campusName: "Coastal View Campus",
    campusId: "ID-CMG005",
    district: "Malappuram",
    dateCreated: "10/08/2024",
    totalMembers: 70
  },
  {
    id: "5",
    campusName: "Hilltop Academy",
    campusId: "ID-CMG006",
    district: "Idukki",
    dateCreated: "05/09/2024",
    totalMembers: 65
  },
  {
    id: "6",
    campusName: "Riverside Institute",
    campusId: "ID-CMG007",
    district: "Palakkad",
    dateCreated: "12/10/2024",
    totalMembers: 78
  },
  {
    id: "7",
    campusName: "Desert Bloom Campus",
    campusId: "ID-CMG008",
    district: "Wayanad",
    dateCreated: "18/11/2024",
    totalMembers: 88
  },
  {
    id: "8",
    campusName: "Forest Edge Campus",
    campusId: "ID-CMG009",
    district: "Pathanamthitta",
    dateCreated: "22/12/2024",
    totalMembers: 92
  },
  {
    id: "9",
    campusName: "Urban Heights Campus",
    campusId: "ID-CMG010",
    district: "Ernakulam",
    dateCreated: "28/01/2025",
    totalMembers: 77
  }
]

const mockUnlistedCampuses: UnlistedCampus[] = [
  {
    id: "1",
    campusName: "Sunset Valley Campus",
    district: "Kochi"
  },
  {
    id: "2",
    campusName: "Sunset Valley Campus",
    district: "Kochi"
  },
  {
    id: "3",
    campusName: "Hilltop Academy",
    district: "Alappuzha"
  },
  {
    id: "4",
    campusName: "Sunset Valley Campus",
    district: "Kochi"
  },
  {
    id: "5",
    campusName: "Hilltop Academy",
    district: "Alappuzha"
  },
  {
    id: "6",
    campusName: "Riverside Institute",
    district: "Palakkad"
  },
  {
    id: "7",
    campusName: "Desert Bloom Campus",
    district: "Wayanad"
  },
  {
    id: "8",
    campusName: "Forest Edge Campus",
    district: "Pathanamthitta"
  },
  {
    id: "9",
    campusName: "Urban Heights Campus",
    district: "Ernakulam"
  }
]

export function LevelsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("district")
  const [campusSubTab, setCampusSubTab] = useState("listed")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showAddForm, setShowAddForm] = useState(false)
  const [districts, setDistricts] = useState(mockDistricts)
  const [campuses, setCampuses] = useState(mockCampuses)
  const [unlistedCampuses, setUnlistedCampuses] = useState(mockUnlistedCampuses)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
  }

  const handleCampusSubTabChange = (value: string) => {
    setCampusSubTab(value)
    setCurrentPage(1)
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
    // You can implement edit functionality here
  }

  const handleDeleteLevel = (levelId: string) => {
    // Handle delete functionality
    console.log("Delete level:", levelId)
    if (activeTab === "district") {
      setDistricts(prev => prev.filter(district => district.id !== levelId))
    } else if (campusSubTab === "listed") {
      setCampuses(prev => prev.filter(campus => campus.id !== levelId))
    } else {
      setUnlistedCampuses(prev => prev.filter(campus => campus.id !== levelId))
    }
  }

  const handleSaveLevel = (levelData: any) => {
    if (levelData.type === "district") {
      const newDistrict: District = {
        id: levelData.id,
        districtName: levelData.levelName,
        districtId: `ID-${levelData.levelName.substring(0, 2).toUpperCase()}${String(districts.length + 1).padStart(3, '0')}`,
        dateCreated: levelData.dateCreated,
        totalCampuses: levelData.totalCampuses,
        totalMembers: levelData.totalMembers
      }
      setDistricts(prev => [...prev, newDistrict])
    } else {
      const newCampus: Campus = {
        id: levelData.id,
        campusName: levelData.levelName,
        campusId: `ID-CMG${String(campuses.length + 1).padStart(3, '0')}`,
        district: levelData.district || "Unassigned",
        dateCreated: levelData.dateCreated,
        totalMembers: levelData.totalMembers
      }
      setCampuses(prev => [...prev, newCampus])
    }
    setShowAddForm(false)
  }

  const filteredDistricts = districts.filter(district => {
    const matchesSearch = district.districtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         district.districtId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredCampuses = campuses.filter(campus => {
    const matchesSearch = campus.campusName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campus.campusId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campus.district.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredUnlistedCampuses = unlistedCampuses.filter(campus => {
    const matchesSearch = campus.campusName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campus.district.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getCurrentData = () => {
    if (activeTab === "district") {
      return filteredDistricts
    } else if (campusSubTab === "listed") {
      return filteredCampuses
    } else {
      return filteredUnlistedCampuses
    }
  }

  const currentData = getCurrentData()
  const totalPages = Math.ceil(currentData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedData = currentData.slice(startIndex, startIndex + rowsPerPage)

  // Show add level form if requested
  if (showAddForm) {
    return (
      <AddLevelForm 
        onBack={handleBackToList} 
        onSave={handleSaveLevel}
        levelType={activeTab as "district" | "campus"}
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
              className={`px-0 py-3 mr-8 border-b-2 rounded-none bg-transparent ${
                activeTab === "district" 
                  ? "border-red-500 text-red-500" 
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              District
            </button>
            <button
              onClick={() => handleTabChange("campus")}
              className={`px-0 py-3 border-b-2 rounded-none bg-transparent ${
                activeTab === "campus" 
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
                  className={`text-sm font-medium ${
                    campusSubTab === "listed" 
                      ? "text-red-500" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Listed Campus
                </button>
                <button
                  onClick={() => handleCampusSubTabChange("unlisted")}
                  className={`text-sm font-medium ${
                    campusSubTab === "unlisted" 
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
                    {activeTab === "district" && (paginatedData as District[]).map((district, index) => (
                      <tr 
                        key={district.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
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
                                className="flex items-center gap-2 px-3 py-2 text-sm"
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

                    {activeTab === "campus" && campusSubTab === "listed" && (paginatedData as Campus[]).map((campus, index) => (
                      <tr 
                        key={campus.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
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
                                className="flex items-center gap-2 px-3 py-2 text-sm"
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

                    {activeTab === "campus" && campusSubTab === "unlisted" && (paginatedData as UnlistedCampus[]).map((campus, index) => (
                      <tr 
                        key={campus.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
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
                                className="flex items-center gap-2 px-3 py-2 text-sm"
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
                    {startIndex + 1}-{Math.min(startIndex + rowsPerPage, currentData.length)} of {currentData.length}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}