import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "@/components/custom/top-bar"
import { AddResourceForm } from "@/components/custom/contentManagment/add-resource-form"
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react"

interface Resource {
  id: string
  contentName: string
  category: string
  content: string
}

const mockResources: Resource[] = [
  {
    id: "1",
    contentName: "Cultural and contextual",
    category: "Documents",
    content: "http://symbolism.web.in"
  },
  {
    id: "2",
    contentName: "Cultural and contextual",
    category: "Learning Materials",
    content: "www.cafearoma.com/events"
  },
  {
    id: "3",
    contentName: "Local Festivals",
    category: "Event Highlights",
    content: "www.localfestivals.com/2023"
  },
  {
    id: "4",
    contentName: "Art Exhibitions",
    category: "Learning Materials",
    content: "www.artworld.com/exhibitions"
  },
  {
    id: "5",
    contentName: "Historical Tours",
    category: "Learning Materials",
    content: "www.historytours.com/guide"
  },
  {
    id: "6",
    contentName: "Culinary Workshops",
    category: "Learning Materials",
    content: "www.cookingclasses.com/workshops"
  },
  {
    id: "7",
    contentName: "Music Concerts",
    category: "Learning Materials",
    content: "www.musiclive.com/concerts"
  },
  {
    id: "8",
    contentName: "Theater Performances",
    category: "Documents",
    content: "www.theaterworld.com/shows"
  },
  {
    id: "9",
    contentName: "Nature Trails",
    category: "Documents",
    content: "www.naturehikes.com/trails"
  },
  {
    id: "10",
    contentName: "Sports Events",
    category: "Documents",
    content: "www.sportsevents.com/schedule"
  }
]

export function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [resources] = useState(mockResources)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showAddResourceForm, setShowAddResourceForm] = useState(false)

  const handleAddResource = () => {
    setShowAddResourceForm(true)
  }

  const handleBackToList = () => {
    setShowAddResourceForm(false)
  }

  const handleSaveResource = (resourceData: any) => {
    // Handle saving the new resource data here
    console.log("New resource data:", resourceData)
    // You can add API call or state update here
    setShowAddResourceForm(false)
  }

  // Show add resource form if requested
  if (showAddResourceForm) {
    return <AddResourceForm onBack={handleBackToList} onSave={handleSaveResource} />
  }

  const filteredResources = resources.filter(resource => 
    resource.contentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredResources.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedResources = filteredResources.slice(startIndex, startIndex + rowsPerPage)

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
                {paginatedResources.map((resource, index) => (
                  <tr 
                    key={resource.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{resource.contentName}</td>
                    <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{resource.category}</td>
                    <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{resource.content}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1 h-8 w-8"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </Button>
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredResources.length)} of {filteredResources.length}
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
  )
}