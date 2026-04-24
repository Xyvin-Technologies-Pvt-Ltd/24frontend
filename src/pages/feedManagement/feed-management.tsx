import { useDeferredValue, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"
import { ConfirmationModal } from "@/components/custom/confirmation-modal"
import { TopBar } from "@/components/custom/top-bar"
import { ViewPostModal } from "@/components/custom/approvals/view-post-modal"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  useDeletePost,
  usePostAnalyticsWithoutPending,
  usePostsWithoutPending,
} from "@/hooks/usePosts"
import type { Post } from "@/types/post"

export function FeedManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(false)
  const [createdDateFrom, setCreatedDateFrom] = useState("")
  const [createdDateTo, setCreatedDateTo] = useState("")
  const [tempCreatedDateFrom, setTempCreatedDateFrom] = useState("")
  const [tempCreatedDateTo, setTempCreatedDateTo] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  const deferredSearch = useDeferredValue(searchTerm)

  const { data, isLoading, isError } = usePostsWithoutPending({
    page_no: currentPage,
    limit: rowsPerPage,
    search: deferredSearch || undefined,
    created_date_from: createdDateFrom || undefined,
    created_date_to: createdDateTo || undefined,
  })
  const { data: analyticsData } = usePostAnalyticsWithoutPending()
  const deletePostMutation = useDeletePost()

  const feeds = data?.data ?? []
  const totalCount = data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const startIndex = (currentPage - 1) * rowsPerPage
  const totalPosts = analyticsData?.data?.total_posts

  const handleViewPost = (post: Post) => {
    setSelectedPost(post)
    setShowViewModal(true)
  }

  const handleCloseModal = () => {
    setSelectedPost(null)
    setShowViewModal(false)
  }

  const handleConfirmDelete = async () => {
    if (!postToDelete) {
      return
    }

    try {
      await deletePostMutation.mutateAsync(postToDelete._id)
      setPostToDelete(null)
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const applyFilters = () => {
    setCreatedDateFrom(tempCreatedDateFrom)
    setCreatedDateTo(tempCreatedDateTo)
    setCurrentPage(1)
    setShowFilters(false)
  }

  const resetFilters = () => {
    setTempCreatedDateFrom("")
    setTempCreatedDateTo("")
    setCreatedDateFrom("")
    setCreatedDateTo("")
    setCurrentPage(1)
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar />

      <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-[22px] font-medium text-[#161616]">Feed Management</h1>
        </div>

        <div className="mb-8 flex gap-6">
          <div className="min-w-[220px] rounded-[22px] bg-[#EDEEFC] px-5 py-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm text-[#494949]">Total Posts</p>
                <p className="text-[36px] leading-none text-[#161616]">
                  {totalPosts?.value ?? 0}
                </p>
              </div>
              {/* <div className="flex items-center gap-1 text-sm text-[#161616]">
                <span>{`${totalPosts?.growth && totalPosts.growth > 0 ? "+" : ""}${(
                  totalPosts?.growth ?? 0
                ).toFixed(2)}%`}</span>
                <span className="text-xs">↗</span>
              </div> */}
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#ECECEC] bg-white px-5 pb-4 pt-5 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
          <div className="mb-4 flex justify-end gap-3">
            <div className="relative w-full max-w-[250px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8B8B8]" />
              <Input
                placeholder="Search user or caption"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setCurrentPage(1)
                }}
                className="h-10 rounded-full border-none bg-[#F7F7F7] pl-10 text-sm shadow-none placeholder:text-[#B8B8B8] focus-visible:ring-0"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setTempCreatedDateFrom(createdDateFrom)
                setTempCreatedDateTo(createdDateTo)
                setShowFilters(true)
              }}
              className="h-10 w-10 rounded-xl border-[#E5E5E5] p-0 hover:border-[#E5E5E5] hover:bg-[#F7F7F7]"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#A7A7A7]" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">
                    User Name
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">
                    Caption
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">
                    Media
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="rounded-2xl bg-[#FAFAFA] px-3 py-8 text-center text-sm text-[#9C9C9C]"
                    >
                      Loading feeds...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="rounded-2xl bg-[#FAFAFA] px-3 py-8 text-center text-sm text-red-500"
                    >
                      Failed to load feeds.
                    </td>
                  </tr>
                ) : feeds.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="rounded-2xl bg-[#FAFAFA] px-3 py-8 text-center text-sm text-[#9C9C9C]"
                    >
                      No feeds found.
                    </td>
                  </tr>
                ) : (
                  feeds.map((post) => (
                    <tr key={post._id} className="bg-[#FAFAFA]">
                      <td className="rounded-l-2xl px-3 py-2 text-sm text-[#303030]">
                        {post.author?.name || "Unknown User"}
                      </td>
                      <td className="max-w-[360px] px-3 py-2 text-sm text-[#303030]">
                        <div className="truncate">{post.content || "-"}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-[#EDEDED]">
                          {post.media ? (
                            post.type === "video" ? (
                              <video src={post.media} className="h-full w-full object-cover" />
                            ) : (
                              <img
                                src={post.media}
                                alt={post.mediaAlt || "Feed media"}
                                className="h-full w-full object-cover"
                              />
                            )
                          ) : (
                            <span className="text-[10px] text-[#9C9C9C]">NA</span>
                          )}
                        </div>
                      </td>
                      <td className="rounded-r-2xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-transparent"
                            onClick={() => handleViewPost(post)}
                          >
                            <Eye className="h-4 w-4 text-[#A6A6A6]" />
                          </Button>

                          <DropdownMenu
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-transparent"
                              >
                                <MoreHorizontal className="h-4 w-4 text-[#161616]" />
                              </Button>
                            }
                          >
                            {/* <DropdownMenuItem
                              className="px-3 py-2 text-sm"
                              onClick={() => handleViewPost(post)}
                            >
                              View
                            </DropdownMenuItem> */}
                            <DropdownMenuItem
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600"
                              onClick={() => setPostToDelete(post)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
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

          <div className="mt-2 flex items-center justify-between border-t border-[#EEEEEE] px-2 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6E6E6E]">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(event) => {
                  setRowsPerPage(Number(event.target.value))
                  setCurrentPage(1)
                }}
                className="border-none bg-transparent text-xs text-[#303030] focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-[#6E6E6E]">
                {totalCount === 0
                  ? "0-0 of 0"
                  : `${startIndex + 1}-${Math.min(startIndex + rowsPerPage, totalCount)} of ${totalCount}`}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4 text-[#9C9C9C]" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4 text-[#9C9C9C]" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-80 flex-col rounded-l-2xl bg-white shadow-lg">
            <div className="flex-1 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Filter by</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="h-8 w-8 p-1"
                >
                  x
                </Button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Created Date From
                  </label>
                  <Input
                    type="date"
                    value={tempCreatedDateFrom}
                    onChange={(event) => setTempCreatedDateFrom(event.target.value)}
                    className="rounded-2xl"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Created Date To
                  </label>
                  <Input
                    type="date"
                    value={tempCreatedDateTo}
                    onChange={(event) => setTempCreatedDateTo(event.target.value)}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Reset
                </Button>
                <Button
                  onClick={applyFilters}
                  className="flex-1 rounded-full bg-black text-white hover:bg-gray-800"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ViewPostModal
        isOpen={showViewModal}
        onClose={handleCloseModal}
        post={selectedPost}
      />

      <ConfirmationModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Feed"
        message={`Are you sure you want to delete ${
          postToDelete?.author?.name ? `${postToDelete.author.name}'s` : "this"
        } feed?`}
        confirmText={deletePostMutation.isPending ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        disabled={deletePostMutation.isPending}
      />
    </div>
  )
}
