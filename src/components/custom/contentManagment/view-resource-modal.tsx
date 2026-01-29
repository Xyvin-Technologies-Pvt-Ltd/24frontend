import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink } from "lucide-react"
import type { Resource } from "@/types/resource"

interface ViewResourceModalProps {
  isOpen: boolean
  onClose: () => void
  resource: Resource | null
}

export function ViewResourceModal({
  isOpen,
  onClose,
  resource,
}: ViewResourceModalProps) {
  if (!isOpen || !resource) return null

  const isLink = resource.content.startsWith("http")

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            View Resource
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
        <div className="p-6 space-y-5">

          {/* Content Name */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32">Content Name</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm font-medium">
              {resource.content_name}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32">Category</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <Badge className="bg-gray-100 text-gray-700 text-xs rounded-full">
              {resource.category}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32">Content</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <div className="text-gray-900 text-sm break-all">
              {isLink ? (
                <a
                  href={resource.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline inline-flex items-center gap-1"
                >
                  {resource.content}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                resource.content
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
