import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, FileText } from "lucide-react"
import type { Campaign } from "@/types/campaign"

interface ViewCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: Campaign | null
}

export function ViewCampaignModal({ isOpen, onClose, campaign }: ViewCampaignModalProps) {
  if (!isOpen || !campaign) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-sm px-3 py-1 rounded-full">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-sm px-3 py-1 rounded-full">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-sm px-3 py-1 rounded-full">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const getEnglishText = (text: any) => {
    if (typeof text === 'string') return text;
    return text?.en || "";
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB') + " | " +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">View Campaign</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8 hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Campaign Name */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Campaign Name</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm font-medium">{getEnglishText(campaign.title)}</span>
          </div>

          {/* Description */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Description</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">{getEnglishText(campaign.description)}</span>
          </div>

          {/* Organized by */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Organized by</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">{campaign.organized_by || "Unknown"}</span>
          </div>

          {/* Start Date */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Start Date</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">{formatDate(campaign.start_date)}</span>
          </div>

          {/* Target Date */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Target Date</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">{formatDate(campaign.target_date)}</span>
          </div>

          {/* Campaign Type */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Campaign Type</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">{campaign.tag || "General"}</span>
          </div>

          {/* Target Amount */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Target Amount</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm font-medium">₹{campaign.target_amount.toLocaleString('en-IN')}</span>
          </div>

          {/* Collected Amount */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Collected Amount</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm font-medium">₹{campaign.collected_amount.toLocaleString('en-IN')}</span>
          </div>

          {/* Total Donors */}
          {campaign.total_donor_count !== undefined && (
            <div className="flex items-start">
              <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Total Donors</span>
              <span className="text-gray-500 text-sm mr-4">:</span>
              <span className="text-gray-900 text-sm">{campaign.total_donor_count}</span>
            </div>
          )}

          {/* Status */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Approval Status</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <div>{getStatusBadge(campaign.approval_status)}</div>
          </div>

          {/* Campaign Status */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Campaign Status</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm capitalize">{campaign.status}</span>
          </div>

          {/* Cover Image */}
          {campaign.cover_image && (
            <div className="flex items-start">
              <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Cover Image</span>
              <span className="text-gray-500 text-sm mr-4">:</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-900 text-sm">Campaign Image</span>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {campaign.approval_status === 'rejected' && campaign.reason && (
            <div className="flex items-start">
              <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Rejection Reason</span>
              <span className="text-gray-500 text-sm mr-4">:</span>
              <span className="text-red-600 text-sm">{campaign.reason}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}