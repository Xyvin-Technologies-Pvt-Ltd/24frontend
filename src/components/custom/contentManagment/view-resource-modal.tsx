import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink, FileText } from "lucide-react"
import type { Resource } from "@/types/resource"
import { getLocalizedText } from "@/utils/multilingual"

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl w-full shadow-xl max-h-[85vh] flex flex-col ${resource.category === "Guidelines" ? "max-w-3xl" : "max-w-lg"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">View Resource</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8 hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">

          {/* Content Name */}
          <div className="flex items-start">
            <span className="text-gray-500 text-sm w-32">Content Name</span>
            <span className="text-gray-500 text-sm mr-4">:</span>
            <span className="text-gray-900 text-sm font-medium">
              {getLocalizedText(resource.content_name)}
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
            <span className="text-gray-900 text-sm break-words whitespace-pre-wrap">
              {getLocalizedText(resource.content) || "-"}
            </span>
          </div>

          {/* Documents */}
          {resource.category === "Documents" &&
            Array.isArray((resource as any)?.attachments) &&
            (resource as any).attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Documents</h4>
                {(resource as any).attachments.map((url: string, i: number) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm max-w-full break-all"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{url.split("/").pop()}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ))}
              </div>
            )}

          {/* Videos */}
          {resource.category === "Video" &&
            Array.isArray((resource as any)?.video_links) &&
            (resource as any).video_links.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Video Links</h4>
                {(resource as any).video_links.map((link: string, i: number) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm max-w-full break-all truncate block"
                  >
                    {link}
                  </a>
                ))}
              </div>
            )}

          {/* Guidelines */}
          {resource.category === "Guidelines" && (
            <div className="space-y-6">
              {(resource as any)?.guideline_description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Description
                  </h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {getLocalizedText((resource as any).guideline_description)}
                  </p>
                </div>
              )}

              {Array.isArray((resource as any)?.guideline_images) &&
                (resource as any).guideline_images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Images
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(resource as any).guideline_images.map((img: string, i: number) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={img}
                            alt="Guideline"
                            className="w-full h-40 object-cover rounded-xl border hover:shadow-md transition"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
