import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  disabled?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  disabled = false
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const isLoading = confirmText.includes("...") || disabled

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={disabled}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={disabled}
            className="flex-1 bg-black hover:bg-gray-800 text-white rounded-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}