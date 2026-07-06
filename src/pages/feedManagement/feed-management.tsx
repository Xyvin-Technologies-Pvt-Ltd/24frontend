import { useDeferredValue, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Trash2,
  Trophy,
  Heart,
  MessageSquare,
  Award,
  TrendingUp,
  User,
  Loader2,
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
  useFeedLeaderboard,
} from "@/hooks/usePosts"
import type { Post } from "@/types/post"

export function FeedManagementPage() {
  const [activeTab, setActiveTab] = useState<"all" | "leaderboard">("all")
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
  const { data: leaderboardData, isLoading: isLoadingLeaderboard, isError: isErrorLeaderboard } = useFeedLeaderboard()
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
        <div className="mb-6 pl-5 md:pl-0">
          <h1 className="text-[22px] font-medium text-[#161616] mb-4">Feed Management</h1>
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-8 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                activeTab === "all" ? "text-red-500 border-red-500" : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              All Feeds
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                activeTab === "leaderboard" ? "text-red-500 border-red-500" : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Leaderboard & Stats
            </button>
          </div>
        </div>

        {activeTab === "all" && (
          <div className="animate-in fade-in duration-200 pl-5 md:pl-0">
            <div className="mb-8 flex gap-6">
              <div className="min-w-[220px] rounded-[22px] bg-[#EDEEFC] px-5 py-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 text-sm text-[#494949]">Total Posts</p>
                    <p className="text-[36px] leading-none text-[#161616]">
                      {totalPosts?.value ?? 0}
                    </p>
                  </div>
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
        )}

        {activeTab === "leaderboard" && (
          <div className="space-y-8 animate-in fade-in duration-200 pl-5 md:pl-0">
            {isLoadingLeaderboard ? (
              <div className="flex items-center justify-center py-20 bg-white rounded-[22px] border border-[#ECECEC]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            ) : isErrorLeaderboard || !leaderboardData?.data ? (
              <div className="p-12 text-center text-red-500 bg-white rounded-[22px] border border-[#ECECEC]">
                Failed to load leaderboard data. Please try again.
              </div>
            ) : (
              <>
                {/* Summary Metrics Row */}
                {(() => {
                  const data = leaderboardData.data;
                  const totalLikes = data.top_liked_posts.reduce((sum, p) => sum + (p.like_count || 0), 0);
                  const totalComments = data.top_liked_posts.reduce((sum, p) => sum + (p.comment_count || 0), 0);
                  const topCreator = data.top_creators[0];
                  const topPost = data.top_liked_posts[0];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="rounded-[22px] bg-[#EDEEFC] p-5 border border-gray-100 flex justify-between items-center shadow-sm">
                        <div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">Top Post Likes</p>
                          <p className="text-[28px] font-semibold text-gray-900">
                            {topPost ? (topPost.like_count || 0).toLocaleString() : 0}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[150px]">
                            by {topPost?.author?.name || "Unknown"}
                          </p>
                        </div>
                        <div className="p-3 bg-white/60 rounded-xl">
                          <Trophy className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>

                      <div className="rounded-[22px] bg-[#E8F5E9] p-5 border border-gray-100 flex justify-between items-center shadow-sm">
                        <div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">Top Creator Likes</p>
                          <p className="text-[28px] font-semibold text-gray-900">
                            {topCreator ? (topCreator.total_likes || 0).toLocaleString() : 0}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[150px]">
                            by {topCreator?.user?.name || "Unknown"}
                          </p>
                        </div>
                        <div className="p-3 bg-white/60 rounded-xl">
                          <Award className="w-6 h-6 text-green-700" />
                        </div>
                      </div>

                      <div className="rounded-[22px] bg-[#FFF3E0] p-5 border border-gray-100 flex justify-between items-center shadow-sm">
                        <div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">Leaderboard Likes</p>
                          <p className="text-[28px] font-semibold text-gray-900">
                            {totalLikes.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1">across top 10 posts</p>
                        </div>
                        <div className="p-3 bg-white/60 rounded-xl">
                          <Heart className="w-6 h-6 text-orange-600" fill="currentColor" />
                        </div>
                      </div>

                      <div className="rounded-[22px] bg-[#F3E5F5] p-5 border border-gray-100 flex justify-between items-center shadow-sm">
                        <div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">Leaderboard Comments</p>
                          <p className="text-[28px] font-semibold text-gray-900">
                            {totalComments.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1">across top 10 posts</p>
                        </div>
                        <div className="p-3 bg-white/60 rounded-xl">
                          <MessageSquare className="w-6 h-6 text-purple-700" />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Grid Layout for Creators & Posts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Top Creators */}
                  <div className="bg-white border border-[#ECECEC] rounded-[22px] p-6 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-base font-semibold text-[#161616]">Top Creators</h2>
                    </div>

                    <div className="space-y-4">
                      {leaderboardData.data.top_creators.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                          No active creators found.
                        </div>
                      ) : (
                        leaderboardData.data.top_creators.map((creator, index) => (
                          <div
                            key={creator.user?._id || index}
                            className="flex items-center justify-between p-3.5 bg-[#FAFAFA] rounded-2xl hover:bg-[#F3F4FD] transition-all"
                          >
                            <div className="flex items-center gap-3.5">
                              <span
                                className={`inline-flex w-7 h-7 rounded-full items-center justify-center font-bold text-xs ${
                                  index === 0
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : index === 1
                                    ? "bg-slate-100 text-slate-700 border border-slate-200"
                                    : index === 2
                                    ? "bg-orange-100 text-orange-700 border border-orange-200"
                                    : "bg-gray-50 text-gray-500"
                                }`}
                              >
                                {index + 1}
                              </span>

                              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ECECEC] bg-white flex items-center justify-center">
                                {creator.user?.image ? (
                                  <img
                                    src={creator.user.image}
                                    alt={creator.user.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-gray-400" />
                                )}
                              </div>

                              <div>
                                <h3 className="font-medium text-sm text-[#161616]">
                                  {creator.user?.name || "Deleted User"}
                                </h3>
                                <p className="text-xs text-gray-400">
                                  {creator.user?.district || "No District"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#EDEEFC] text-indigo-700">
                                {creator.post_count} {creator.post_count === 1 ? 'post' : 'posts'}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                                <Heart className="w-3 h-3 mr-1 text-rose-500" fill="currentColor" />
                                {creator.total_likes}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Top Liked Feeds */}
                  <div className="bg-white border border-[#ECECEC] rounded-[22px] p-6 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-2 mb-6">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <h2 className="text-base font-semibold text-[#161616]">Most Liked Feeds</h2>
                    </div>

                    <div className="space-y-4">
                      {leaderboardData.data.top_liked_posts.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                          No liked feeds found.
                        </div>
                      ) : (
                        leaderboardData.data.top_liked_posts.map((post, index) => (
                          <div
                            key={post._id}
                            className="flex items-center justify-between p-3.5 bg-[#FAFAFA] rounded-2xl hover:bg-[#F3F4FD] transition-all"
                          >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              <span className="text-sm font-semibold text-gray-400 w-4">
                                {index + 1}
                              </span>

                              <div className="w-10 h-10 rounded-md overflow-hidden bg-[#EDEDED] flex-shrink-0 flex items-center justify-center border border-[#ECECEC]">
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
                                  <span className="text-[10px] text-[#9C9C9C] font-medium">TEXT</span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-sm text-[#161616] truncate">
                                  {post.author?.name || "Unknown User"}
                                </h3>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {post.content || "No caption"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                              <div className="flex items-center gap-2.5 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3.5 h-3.5 text-rose-500" fill="currentColor" />
                                  {post.like_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                  {post.comment_count}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-white rounded-full border border-transparent hover:border-gray-200"
                                  onClick={() => handleViewPost(post)}
                                >
                                  <Eye className="h-4 w-4 text-[#A6A6A6]" />
                                </Button>

                                <DropdownMenu
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-white rounded-full border border-transparent hover:border-gray-200"
                                    >
                                      <MoreHorizontal className="h-4 w-4 text-[#161616]" />
                                    </Button>
                                  }
                                >
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600"
                                    onClick={() => setPostToDelete(post)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
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

