import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Post } from "@/types/post"

interface ViewPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: Post | null
}

export function ViewPostModal({ isOpen, onClose, post }: ViewPostModalProps) {
  if (!isOpen || !post) return null

  const formatDateTime = (value?: string) => {
    if (!value) return "N/A"

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "N/A"

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">View Post</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8 hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <div className="p-6">
          {post.media && (
            <div className="mb-6">
              {post.type === 'video' ? (
                <video
                  src={post.media}
                  controls
                  className="w-full h-80 object-cover rounded-lg bg-gray-100"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={post.media}
                  alt="Post media"
                  className="w-full h-80 object-cover rounded-lg bg-gray-100"
                />
              )}
            </div>
          )}

          <div className="text-gray-900 text-base leading-relaxed">
            {post.content}
          </div>

          <div className="mt-4 grid gap-2 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-800">Created On:</span>{" "}
              {formatDateTime(post.createdAt)}
            </div>
            <div>
              <span className="font-medium text-gray-800">Approved On:</span>{" "}
              {post.status === "approved"
                ? formatDateTime(post.approved_at || post.updatedAt)
                : "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
