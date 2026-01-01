import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, FileText } from "lucide-react"

interface Campaign {
  id: string
  campaignName: string
  createdBy: string
  startDate: string
  endDate: string
  campaignType: string
  targetAmount: string
  status: "Pending" | "Approved" | "Rejected"
}

interface ViewCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: Campaign | null
}

export function ViewCampaignModal({ isOpen, onClose, campaign }: ViewCampaignModalProps) {
  if (!isOpen || !campaign) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-sm px-3 py-1 rounded-full">{status}</Badge>
      case "Approved":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-sm px-3 py-1 rounded-full">{status}</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-sm px-3 py-1 rounded-full">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Campaign Name */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Campaign Name</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm font-medium">{campaign.campaignName}</span>
          </div>

          {/* Created by */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Created by</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">{campaign.createdBy}</span>
          </div>

          {/* Start Date */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Start Date</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">{campaign.startDate}</span>
          </div>

          {/* Target Date (End Date) */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Target Date</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">{campaign.endDate}</span>
          </div>

          {/* Campaign Type */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Campaign Type</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">{campaign.campaignType}</span>
          </div>

          {/* Target Amount */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Target Amount</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm font-medium">{campaign.targetAmount}</span>
          </div>

          {/* Status */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Status</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <div>{getStatusBadge(campaign.status)}</div>
          </div>

          {/* Media */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">Media</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-900 text-sm">Guidebook.pdf</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}