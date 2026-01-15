import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Promotion } from "@/types/promotion"

interface ViewPromotionModalProps {
  isOpen: boolean
  onClose: () => void
  promotion: Promotion | null
}

export function ViewPromotionModal({
  isOpen,
  onClose,
  promotion,
}: ViewPromotionModalProps) {
  if (!isOpen || !promotion) return null

  const getStatusBadge = (status: Promotion["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-sm px-3 py-1 rounded-full">
            Published
          </Badge>
        )
      case "unpublished":
        return (
          <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 text-sm px-3 py-1 rounded-full">
            Unpublished
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-600 hover:bg-red-200 text-sm px-3 py-1 rounded-full">
            Expired
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
            {status}
          </Badge>
        )
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB")

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            View Promotion
          </h2>
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

          <div>
            <img
              src={promotion.media}
              alt="Promotion Banner"
              className="w-full h-64 object-cover rounded-lg bg-gray-100"
            />
          </div>

          {/* Type */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">
              Promotion Type
            </span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm capitalize">
              {promotion.type}
            </span>
          </div>

          {/* Start Date */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">
              Start Date
            </span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">
              {formatDate(promotion.start_date)}
            </span>
          </div>

          {/* End Date */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">
              End Date
            </span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm">
              {formatDate(promotion.end_date)}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32 flex-shrink-0 mt-1">
              Status
            </span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <div>{getStatusBadge(promotion.status)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
