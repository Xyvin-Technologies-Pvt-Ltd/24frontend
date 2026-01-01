import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { TopBar } from "@/components/custom/top-bar"
import { ConfirmationModal } from "@/components/custom/confirmation-modal"
import { ViewPostModal } from "@/components/custom/approvals/view-post-modal"
import { 
  Search, 
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react"

interface Post {
  id: string
  userName: string
  caption: string
  mediaUrl: string
  mediaAlt: string
  status: "Pending" | "Approved" | "Rejected"
}

const mockPosts: Post[] = [
  {
    id: "1",
    userName: "Fathima Al Zaabi",
    caption: "Excited to share that I've earned the 24 Connect Certification",
    mediaUrl: "/Ellipse 3226.png",
    mediaAlt: "Certification post",
    status: "Pending"
  },
  {
    id: "2",
    userName: "Manaf",
    caption: "Honored to receive the 'Best Young Reporter Award 2025'. Sto...",
    mediaUrl: "/sk.png",
    mediaAlt: "Award post",
    status: "Rejected"
  },
  {
    id: "3",
    userName: "Kiran Ram",
    caption: "Spent the day exploring the stories behind the local market. Ev...",
    mediaUrl: "/logo.png",
    mediaAlt: "Market exploration post",
    status: "Pending"
  },
  {
    id: "4",
    userName: "Rajeev Patric",
    caption: "Honored to receive the 'Best Young Reporter Award 2025'. Sto...",
    mediaUrl: "/sk.png",
    mediaAlt: "Award post",
    status: "Rejected"
  },
  {
    id: "5",
    userName: "Stephy Sajan",
    caption: "Spent the day exploring the stories behind the local market. Ev...",
    mediaUrl: "/logo.png",
    mediaAlt: "Market exploration post",
    status: "Approved"
  }
]

export function PostsApprovalPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [posts, setPosts] = useState(mockPosts)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const handleViewPost = (post: Post) => {
    setSelectedPost(post)
    setShowViewModal(true)
  }

  const handleApproveClick = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setSelectedPost(post)
      setShowApproveModal(true)
    }
  }

  const handleRejectClick = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setSelectedPost(post)
      setShowRejectModal(true)
    }
  }

  const handleConfirmApprove = () => {
    if (selectedPost) {
      setPosts(prev => prev.map(post => 
        post.id === selectedPost.id ? { ...post, status: "Approved" as const } : post
      ))
    }
    setShowApproveModal(false)
    setSelectedPost(null)
  }

  const handleConfirmReject = () => {
    if (selectedPost) {
      setPosts(prev => prev.map(post => 
        post.id === selectedPost.id ? { ...post, status: "Rejected" as const } : post
      ))
    }
    setShowRejectModal(false)
    setSelectedPost(null)
  }

  const handleCloseModals = () => {
    setShowApproveModal(false)
    setShowRejectModal(false)
    setShowViewModal(false)
    setSelectedPost(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "Approved":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.caption.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredPosts.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + rowsPerPage)

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <span>Approvals</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Posts</span>
        </div>
        
        {/* Main Table Card */}
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

          {/* Posts Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">User Name</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Caption</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Media</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPosts.map((post, index) => (
                  <tr 
                    key={post.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                    }`}
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-gray-900 text-sm font-medium">{post.userName}</div>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="text-gray-600 text-sm truncate">{post.caption}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img 
                          src={post.mediaUrl} 
                          alt={post.mediaAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1 h-8 w-8"
                          onClick={() => handleViewPost(post)}
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
                            onClick={() => handleApproveClick(post.id)}
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
                            onClick={() => handleRejectClick(post.id)}
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredPosts.length)} of {filteredPosts.length}
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

      {/* Modals */}
      <ViewPostModal
        isOpen={showViewModal}
        onClose={handleCloseModals}
        post={selectedPost}
      />

      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={handleCloseModals}
        onConfirm={handleConfirmApprove}
        title="Approve Post"
        message="Are you sure you want to approve this post?"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={handleCloseModals}
        onConfirm={handleConfirmReject}
        title="Reject Post"
        message="Are you sure you want to reject this post?"
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  )
}