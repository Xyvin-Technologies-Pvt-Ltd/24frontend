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
              <img
                src={post.media}
                alt="Post media"
                className="w-full h-80 object-cover rounded-lg bg-gray-100"
              />
            </div>
          )}

          <div className="text-gray-900 text-base leading-relaxed">
            {post.content}
          </div>

          <div className="mt-4 text-gray-500 text-sm">
            Posted by: {post.author?.name || 'Unknown User'}
          </div>

          <div className="mt-2 text-gray-700 text-sm capitalize">
            Status: {post.status}
          </div>
        </div>
      </div>
    </div>
  )
}