import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TopBar } from '@/components/custom/top-bar'
import { ViewJobRequestModal } from '@/components/custom/approvals/view-job-request-modal'
import {
  useJobRequests,
  useJobRequestAnalytics,
  useApproveJobRequest,
  useRejectJobRequest,
  useJobProviders,
} from '@/hooks/useJobProviders'
import type { JobRequest, JobRequestStatus } from '@/types/job-provider'

import {
  Search,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react'

const getErrorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback

export function JobsApprovalPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [status, setStatus] = useState<JobRequestStatus>('pending')
  const [tempStatus, setTempStatus] = useState<JobRequestStatus>('pending')
  const [showFilters, setShowFilters] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(null)
  const [selectedProviderId, setSelectedProviderId] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [actionError, setActionError] = useState('')

  const { data, isLoading } = useJobRequests({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    status,
  })
  const { data: analyticsData } = useJobRequestAnalytics()
  // Providers are only needed when approving a request that has no provider attached
  const { data: providersData } = useJobProviders({ limit: 100, status: 'active' })

  const approveMutation = useApproveJobRequest()
  const rejectMutation = useRejectJobRequest()

  const jobRequests = data?.data || []
  const totalCount = data?.total_count || 0
  const analytics = analyticsData?.data
  const providers = providersData?.data || []
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const startIndex = (currentPage - 1) * rowsPerPage

  const getCompanyName = (request: JobRequest) =>
    request.provider?.provider_name || request.company_details?.provider_name || 'N/A'

  const handleViewRequest = (request: JobRequest) => {
    setSelectedRequest(request)
    setShowViewModal(true)
  }

  const handleApproveClick = (request: JobRequest) => {
    setSelectedRequest(request)
    setSelectedProviderId('')
    setActionError('')
    setShowApproveModal(true)
  }

  const handleRejectClick = (request: JobRequest) => {
    setSelectedRequest(request)
    setActionError('')
    setShowRejectModal(true)
  }

  const handleConfirmApprove = async () => {
    if (!selectedRequest) return
    try {
      await approveMutation.mutateAsync({
        jobId: selectedRequest._id,
        providerId: selectedProviderId || undefined,
      })
      handleCloseModals()
    } catch (error) {
      setActionError(getErrorMessage(error, 'Failed to approve job request'))
    }
  }

  const handleConfirmReject = async () => {
    if (!selectedRequest) return
    try {
      await rejectMutation.mutateAsync({ jobId: selectedRequest._id, reason: rejectReason })
      handleCloseModals()
    } catch (error) {
      setActionError(getErrorMessage(error, 'Failed to reject job request'))
    }
  }

  const handleCloseModals = () => {
    setShowApproveModal(false)
    setShowRejectModal(false)
    setShowViewModal(false)
    setSelectedRequest(null)
    setSelectedProviderId('')
    setRejectReason('')
    setActionError('')
  }

  const clearFilters = () => {
    setTempStatus('pending')
    setStatus('pending')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const applyFilters = () => {
    setStatus(tempStatus)
    setCurrentPage(1)
    setShowFilters(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-xs px-3 py-1 rounded-full">
            Pending
          </Badge>
        )
      case 'active':
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
          <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full capitalize">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] pr-8 pb-8 pl-0 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Job Approval</h1>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-6 mb-8">
          <div className="bg-[#EDEEFC] rounded-2xl p-6 border border-gray-200 min-w-[240px]">
            <p className="text-sm text-gray-600 mb-1">Total Requests</p>
            <p className="text-3xl font-semibold text-gray-900">{analytics?.total_requests ?? 0}</p>
          </div>

          <div className="bg-[#E6F1FD] rounded-2xl p-6 border border-gray-200 min-w-[240px]">
            <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
            <p className="text-3xl font-semibold text-gray-900">{analytics?.pending_requests ?? 0}</p>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl border border-gray-200 relative">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search job title, company or location"
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
                className="ml-4 border-[#B3B3B3] hover:border-[#B3B3B3] rounded-lg"
                onClick={() => {
                  setTempStatus(status)
                  setShowFilters(true)
                }}
              >
                <SlidersHorizontal className="w-4 h-4 text-[#B3B3B3]" />
              </Button>
            </div>
          </div>

          {/* Filter Sidebar overlay */}
          {showFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
              <div className="bg-white w-80 h-full shadow-lg rounded-l-2xl flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Filter by</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="p-1 h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <Select
                        value={tempStatus}
                        onChange={(e) => setTempStatus(e.target.value as JobRequestStatus)}
                        className="rounded-2xl"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Approved</option>
                        <option value="rejected">Rejected</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
                    >
                      Reset
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

          {/* Job Requests Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Requested By</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Job Title</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Company</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Type</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Location</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : jobRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No job requests found
                    </td>
                  </tr>
                ) : (
                  jobRequests.map((request, index) => (
                    <tr
                      key={request._id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                        }`}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-900 text-sm font-medium">
                          {request.requested_by?.name || 'Unknown User'}
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="text-gray-600 text-sm truncate">{request.title}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-600 text-sm">{getCompanyName(request)}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-600 text-sm capitalize">
                          {request.job_type} · {request.work_mode}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-600 text-sm">{request.location}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-8 w-8"
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </Button>
                          {request.status === 'pending' && (
                            <DropdownMenu
                              trigger={
                                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </Button>
                              }
                            >
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm"
                                onClick={() => handleApproveClick(request)}
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 px-3 py-2 text-sm"
                                onClick={() => handleRejectClick(request)}
                              >
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenu>
                          )}
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
                {totalCount === 0 ? 0 : startIndex + 1}-
                {Math.min(startIndex + rowsPerPage, totalCount)} of {totalCount}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
      <ViewJobRequestModal
        isOpen={showViewModal}
        onClose={handleCloseModals}
        jobRequest={selectedRequest}
      />

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Approve Job</h2>
            <p className="text-gray-600 mb-4">
              Approving publishes "{selectedRequest.title}" in the jobs section of the app.
            </p>

            {selectedRequest.provider ? (
              <p className="text-sm text-gray-600 mb-6">
                Job provider: <span className="font-medium text-gray-900">{selectedRequest.provider.provider_name}</span>
              </p>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Provider
                </label>
                <Select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="rounded-2xl"
                >
                  <option value="">
                    Create new provider ({selectedRequest.company_details?.provider_name || 'from request'})
                  </option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider._id}>
                      {provider.provider_name}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  If a provider with the same email already exists, the job is linked to it.
                </p>
              </div>
            )}

            {actionError && <p className="text-sm text-red-600 mb-4">{actionError}</p>}

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleCloseModals}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmApprove}
                disabled={approveMutation.isPending}
                className="flex-1 bg-black hover:bg-gray-800 text-white rounded-full py-3 flex items-center justify-center"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${showRejectModal ? '' : 'hidden'}`}>
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reject Job</h2>
          <p className="text-gray-600 mb-4">Are you sure you want to reject this job request? You can optionally provide a reason.</p>
          <Input
            placeholder="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="mb-4 rounded-2xl"
          />

          {actionError && <p className="text-sm text-red-600 mb-4">{actionError}</p>}

          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              onClick={handleCloseModals}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full py-3"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              disabled={rejectMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full py-3 flex items-center justify-center"
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
