import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "@/components/custom/top-bar"
import { AddPromotionForm } from "@/components/custom/contentManagment/add-promotion-form"
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react"

interface Promotion {
  id: string
  startDate: string
  endDate: string
  bannerImage: string
  bannerAlt: string
}

const mockPromotions: Promotion[] = [
  {
    id: "1",
    startDate: "12/03/2025",
    endDate: "12/03/2025",
    bannerImage: "/sk.png",
    bannerAlt: "SKN40 Promotion Banner"
  },
  {
    id: "2",
    startDate: "12/03/2025",
    endDate: "12/03/2025",
    bannerImage: "/sk.png",
    bannerAlt: "Event Promotion Banner"
  },
  {
    id: "3",
    startDate: "12/03/2025",
    endDate: "12/03/2025",
    bannerImage: "/sk.png",
    bannerAlt: "Special Offer Banner"
  },
  {
    id: "4",
    startDate: "12/03/2025",
    endDate: "12/03/2025",
    bannerImage: "/sk.png",
    bannerAlt: "Campaign Banner"
  },
  {
    id: "5",
    startDate: "12/03/2025",
    endDate: "12/03/2025",
    bannerImage: "/sk.png",
    bannerAlt: "Marketing Banner"
  },
  {
    id: "6",
    startDate: "12/03/2025",
    endDate: "12/03/2025",
    bannerImage: "/sk.png",
    bannerAlt: "Promotional Campaign"
  }
]

export function PromotionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [promotions] = useState(mockPromotions)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showAddPromotionForm, setShowAddPromotionForm] = useState(false)

  const handleAddPromotion = () => {
    setShowAddPromotionForm(true)
  }

  const handleBackToList = () => {
    setShowAddPromotionForm(false)
  }

  const handleSavePromotion = (promotionData: any) => {
    // Handle saving the new promotion data here
    console.log("New promotion data:", promotionData)
    // You can add API call or state update here
    setShowAddPromotionForm(false)
  }

  // Show add promotion form if requested
  if (showAddPromotionForm) {
    return <AddPromotionForm onBack={handleBackToList} onSave={handleSavePromotion} />
  }

  const filteredPromotions = promotions.filter(promotion => 
    promotion.startDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.endDate.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPromotions.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedPromotions = filteredPromotions.slice(startIndex, startIndex + rowsPerPage)

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
          <div className="p-6 ">
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

          {/* Promotions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Start Date</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">End Date</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Banner Image</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPromotions.map((promotion, index) => (
                  <tr 
                    key={promotion.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{promotion.startDate}</td>
                    <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">{promotion.endDate}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img 
                          src={promotion.bannerImage} 
                          alt={promotion.bannerAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredPromotions.length)} of {filteredPromotions.length}
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