import { useDeferredValue, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { TopBar } from '@/components/custom/top-bar'
import { ConfirmationModal } from '@/components/custom/confirmation-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFeedbacks, useDeleteFeedback } from '@/hooks/useFeedback'
import type { Feedback } from '@/types/feedback'

export function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const deferredSearch = useDeferredValue(searchTerm)

  const { data, isLoading, isError } = useFeedbacks({
    page_no: currentPage,
    limit: rowsPerPage,
    search: deferredSearch || undefined,
  })
  const deleteFeedbackMutation = useDeleteFeedback()

  const feedbacks = data?.data ?? []
  const totalCount = data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))

  const handleDeleteClick = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
  }

  const handleConfirmDelete = async () => {
    if (!selectedFeedback) return
    try {
      await deleteFeedbackMutation.mutateAsync(selectedFeedback._id)
      setSelectedFeedback(null)
    } catch (error) {
      console.error('Failed to delete feedback', error)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-medium text-[#161616]">Feedback</h1>
            <p className="text-sm text-[#666666]">Mobile app feedback submissions</p>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#ECECEC] bg-white px-5 pb-4 pt-5 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-[320px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8B8B8]" />
              <Input
                placeholder="Search user or feedback"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setCurrentPage(1)
                }}
                className="h-10 rounded-full border-none bg-[#F7F7F7] pl-10 text-sm shadow-none placeholder:text-[#B8B8B8] focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">User</th>
                  <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">Message</th>
                  <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">Created At</th>
                  <th className="px-3 py-2 text-left text-sm font-normal text-[#9C9C9C]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="rounded-2xl bg-[#FAFAFA] px-3 py-8 text-center text-sm text-[#9C9C9C]">
                      Loading feedback...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={4} className="rounded-2xl bg-[#FAFAFA] px-3 py-8 text-center text-sm text-red-500">
                      Failed to load feedback.
                    </td>
                  </tr>
                ) : feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="rounded-2xl bg-[#FAFAFA] px-3 py-8 text-center text-sm text-[#9C9C9C]">
                      No feedback found.
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((feedback) => (
                    <tr key={feedback._id} className="bg-[#FAFAFA]">
                      <td className="rounded-l-2xl px-3 py-2 text-sm text-[#303030]">{feedback.user}</td>
                      <td className="max-w-[460px] px-3 py-2 text-sm text-[#303030]">
                        <div className="truncate">{feedback.message}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-[#303030]">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </td>
                      <td className="rounded-r-2xl px-3 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full border-[#E5E5E5] text-red-600 hover:bg-[#FFF0F0]"
                          onClick={() => handleDeleteClick(feedback)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#6B6B6B]">
              Showing {feedbacks.length} of {totalCount} feedback items
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#E5E5E5] px-3 py-2"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-[#6B6B6B]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#E5E5E5] px-3 py-2"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={Boolean(selectedFeedback)}
        onClose={() => setSelectedFeedback(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback entry? This action cannot be undone."
        confirmText={deleteFeedbackMutation.isLoading ? 'Deleting...' : 'Delete'}
        disabled={deleteFeedbackMutation.isLoading}
      />
    </div>
  )
}
