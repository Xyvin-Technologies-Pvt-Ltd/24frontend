import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Bell, Smartphone, Loader2 } from "lucide-react"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"
import { useNotification, useSendNotification } from "@/hooks/useNotifications"
import { useToast } from "@/hooks/useToast"

interface NotificationViewDialogProps {
  open: boolean
  onClose: () => void
  notificationId: string
}

export function NotificationViewDialog({ open, onClose, notificationId }: NotificationViewDialogProps) {
  const { success, error: showError } = useToast()
  const { data: notificationResponse, isLoading, refetch } = useNotification(notificationId)
  const sendNotificationMutation = useSendNotification()

  const notification = notificationResponse?.data

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'in-app':
        return <Smartphone className="w-4 h-4 text-gray-500" />
      case 'whatsapp':
        return <WhatsAppIcon className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const getChannelName = (type: string) => {
    switch (type) {
      case 'in-app':
        return 'App'
      case 'whatsapp':
        return 'WhatsApp'
      default:
        return type
    }
  }

  const handleSend = async () => {
    try {
      await sendNotificationMutation.mutateAsync(notificationId)
      success('Success', 'Notification sent successfully')
      refetch()
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error('Failed to send notification:', err)
      const errorMessage = err?.response?.data?.message || 'Failed to send notification. Please try again.'
      showError('Error', errorMessage)
    }
  }

  const shouldShowSendButton = notification && 
    notification.status !== 'sended' && 
    notification.status !== 'Published'

  return (
    <Modal 
      isOpen={open} 
      onClose={onClose} 
      title="View Notification"
      className="max-w-[500px]"
    >
      {isLoading ? (
        <div className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : notification ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {notification.subject}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {notification.content}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-500" />
            <span>Recipients: {notification.is_all ? 'All Users' : 'Selected Members'}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Bell className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="flex items-center gap-2 flex-wrap">
              <span>Channels:</span>
              {notification.type.map((type) => (
                <div key={type} className="flex items-center gap-1">
                  {getChannelIcon(type)}
                  <span>{getChannelName(type)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge 
              className={`${
                notification.status === 'Published' || notification.status === 'sended'
                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              } text-xs px-3 py-1 rounded-full`}
            >
              {notification.status === 'sended' ? 'Published' : notification.status}
            </Badge>
          </div>

          {shouldShowSendButton && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={handleSend}
                disabled={sendNotificationMutation.isPending}
                className="w-full bg-black hover:bg-gray-800 text-white rounded-full"
              >
                {sendNotificationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Notification'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          Notification not found
        </div>
      )}
    </Modal>
  )
}
