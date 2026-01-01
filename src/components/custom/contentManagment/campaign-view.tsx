import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TopBar } from "@/components/custom/top-bar"
import { 
  Search, 
  Calendar,
  Edit,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Upload
} from "lucide-react"

interface CampaignViewProps {
  onBack: () => void
  onEdit: (campaignId: string) => void
  campaignId?: string
}

interface Transaction {
  id: string
  date: string
  donor: string
  amount: string
  status: "Success" | "Pending" | "Failed"
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "20 January, 2025",
    donor: "Manaf Abdul",
    amount: "₹1,500",
    status: "Success"
  },
  {
    id: "2",
    date: "20 January, 2025",
    donor: "Manaf Abdul",
    amount: "₹1,500",
    status: "Success"
  },
  {
    id: "3",
    date: "20 January, 2025",
    donor: "Manaf Abdul",
    amount: "₹1,500",
    status: "Success"
  },
  {
    id: "4",
    date: "20 January, 2025",
    donor: "Manaf Abdul",
    amount: "₹1,500",
    status: "Success"
  }
]

export function CampaignView({ onBack, onEdit, campaignId }: CampaignViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleEditClick = () => {
    if (campaignId) {
      onEdit(campaignId)
    }
  }

  const filteredTransactions = mockTransactions.filter(transaction =>
    transaction.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amount.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + rowsPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "Failed":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <button 
            onClick={onBack}
            className="hover:text-gray-900"
          >
            Content Management
          </button>
          <span className="mx-2">›</span>
          <span>Campaigns</span>
          <span className="mx-2">›</span>
          <span>List of Campaigns</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Campaign Detail Page</span>
        </div>

        {/* Campaign Header */}
        <div className="bg-white rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-900">Child Health & Nutrition Program</h1>
              <Badge className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
                Active
              </Badge>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleEditClick}
            >
              Edit
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          {/* Date Information */}
          <div className="flex items-center gap-8 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Start date: 02/02/1998</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Target Date: 02/02/1998</span>
            </div>
          </div>

          {/* Cover Image Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Cover Image</h3>
              <Button 
                variant="ghost" 
                className="text-red-500 hover:text-red-600 text-sm flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload new image
              </Button>
            </div>
            
            {/* Campaign Image */}
            <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src="/placeholder-campaign.jpg" 
                alt="Child Health & Nutrition Program"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-lg font-medium">Child Health & Nutrition Program</div>';
                }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-900 font-medium">₹2500 raised</span>
              <span className="text-gray-600">of</span>
              <span className="text-red-500 font-medium">₹5000 goal</span>
            </div>
          </div>

          {/* Campaign Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">CAMPAIGN DESCRIPTION</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Fermentum augue mi risus nisl cursus euismod tellus aliquet. Non eget pellentesque feugiat volutpat amet egestas 
              accumsan vitae cursus. Ligula consequat turpis pellentesque accumsan suspendisse non amet pulvinar. Tellus enim sagittis pellentesque dictumst cursus 
              pharetra et blandit risus. Elementum odio dui mattis adipiscing. Eget tincidunt sit sapien odio mauris sed donec integer adipiscing. Etiam eu ac euismod ut 
              odio risus leo id. Id habitant et in nulla arcu volutpat odio. Consequat et porttitor ultrices non purus tellus tempor et. Augue dapibus tempus malesuada 
              ultrices vestibulum tortor sollicitudin et mattis. Dui ullamcorper sit enim ultrices purus rhoncus ultrices suscipit. Tincidunt cursus sed consectetur 
              elementum etiam ut lobortis massa diam.
            </p>
          </div>
        </div>

        {/* Transaction List - Separate Section */}
        <div className="bg-white rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">TRANSACTION LIST</h3>
            <div className="flex items-center gap-4">
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
                className="border-[#B3B3B3] hover:border-[#B3B3B3] rounded-lg h-10 w-10 p-0"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#B3B3B3]" />
              </Button>
              <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-6 h-10">
                Export
              </Button>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Date</th>
                  <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Donor</th>
                  <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Amount</th>
                  <th className="text-left py-3 px-0 font-medium text-gray-500 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction, index) => (
                  <tr 
                    key={transaction.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                    }`}
                  >
                    <td className="py-4 px-0 text-gray-600 text-sm">{transaction.date}</td>
                    <td className="py-4 px-0 text-gray-900 text-sm">{transaction.donor}</td>
                    <td className="py-4 px-0 text-gray-900 text-sm font-medium">{transaction.amount}</td>
                    <td className="py-4 px-0">
                      {getStatusBadge(transaction.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
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
                1-4 of 13
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