import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TopBar } from '@/components/custom/top-bar'
import { ConfirmationModal } from '@/components/custom/confirmation-modal'
import { ViewPostModal } from '@/components/custom/approvals/view-post-modal'
import { usePosts, useApprovePost, useRejectPost } from '@/hooks/usePosts'
import type { Post } from '@/types/post'

import {
  Search,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react'

export function PostsApprovalPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [username, setUsername] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch posts (pending by default)
  const { data, isLoading } = usePosts({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm,
    username,
  })

  const approveMutation = useApprovePost()
  const rejectMutation = useRejectPost()

  const paginatedPosts = data?.data || []
  const totalCount = data?.total_count || 0
  const totalPages = Math.ceil(totalCount / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage

  const handleViewPost = (post: Post) => {
    setSelectedPost(post)
    setShowViewModal(true)
  }

  const handleApproveClick = (post: Post) => {
    setSelectedPost(post)
    setShowApproveModal(true)
  }

  const handleRejectClick = (post: Post) => {
    setSelectedPost(post)
    setShowRejectModal(true)
  }

  const handleConfirmApprove = async () => {
    if (selectedPost) {
      await approveMutation.mutateAsync(selectedPost._id)
      setShowApproveModal(false)
      setSelectedPost(null)
    }
  }

  const handleConfirmReject = async (reason?: string) => {
    if (selectedPost) {
      await rejectMutation.mutateAsync({ id: selectedPost._id, reason })
      setShowRejectModal(false)
      setSelectedPost(null)
    }
  }

  const handleCloseModals = () => {
    setShowApproveModal(false)
    setShowRejectModal(false)
    setShowViewModal(false)
    setSelectedPost(null)
  }

  const clearFilters = () => {
    setUsername('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-xs px-3 py-1 rounded-full">
            Pending
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-xs px-3 py-1 rounded-full">
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
            {status}
          </Badge>
        )
    }
  }

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
        <div className="bg-white rounded-2xl border border-gray-200 relative">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end gap-2">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search posts"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 border-[#B3B3B3] focus:border-[#B3B3B3] rounded-full"
                />
              </div>
              <Button
                variant="outline"
                className="border-[#B3B3B3] hover:border-[#B3B3B3] rounded-lg"
                onClick={() => setShowFilters((p) => !p)}
              >
                <SlidersHorizontal className="w-4 h-4 text-[#B3B3B3]" />
              </Button>
            </div>
          </div>

          {/* ✅ Filter Dropdown Panel */}
          {showFilters && (
            <div className="absolute right-6 top-20 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Filters</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Username Filter */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  User Name
                </label>
                <Input
                  placeholder="Type username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
                <Button size="sm" onClick={() => setShowFilters(false)}>
                  Apply
                </Button>
              </div>
            </div>
          )}

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
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : paginatedPosts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-gray-400"
                    >
                      No pending posts found
                    </td>
                  </tr>
                ) : (
                  paginatedPosts.map((post, index) => (
                    <tr
                      key={post._id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                      }`}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-900 text-sm font-medium">
                          {post.author.name}
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="text-gray-600 text-sm truncate">
                          {post.content}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {post.media && (
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img
                              src={post.media}
                              alt={post.mediaAlt || 'Media'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-8 w-8"
                              >
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                              </Button>
                            }
                          >
                            <DropdownMenuItem
                              className="flex items-center gap-2 px-3 py-2 text-sm"
                              onClick={() => handleApproveClick(post)}
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 px-3 py-2 text-sm"
                              onClick={() => handleRejectClick(post)}
                            >
                              Reject
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
                {startIndex + 1}-
                {Math.min(startIndex + rowsPerPage, totalCount)} of {totalCount}
              </span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-1 h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(totalPages, prev + 1)
                    )
                  }
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