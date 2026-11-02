import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ToastContainer } from "@/components/ui/toast"
import { Users, Bell, Smartphone, Mail, Link as LinkIcon, Loader2 } from "lucide-react"
import { useNotification, useSendNotification } from "@/hooks/useNotifications"
import { useToast } from "@/hooks/useToast"
import { getApiErrorMessage } from "@/lib/utils"

interface NotificationViewDialogProps {
  open: boolean
  onClose: () => void
  notificationId: string
}

const EMAIL_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Queued", className: "bg-blue-100 text-blue-600" },
  sending: { label: "Sending", className: "bg-blue-100 text-blue-600" },
  sent: { label: "Sent", className: "bg-green-100 text-green-600" },
  partially_sent: { label: "Partially Sent", className: "bg-orange-100 text-orange-600" },
  failed: { label: "Failed", className: "bg-red-100 text-red-600" },
}

export function NotificationViewDialog({ open, onClose, notificationId }: NotificationViewDialogProps) {
  const { toasts, removeToast, success, error: showError } = useToast()
  const { data: notificationResponse, isLoading, refetch } = useNotification(notificationId)
  const sendNotificationMutation = useSendNotification()

  const notification = notificationResponse?.data

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'in-app':
        return <Smartphone className="w-4 h-4 text-gray-500" />
      case 'email':
        return <Mail className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const getChannelName = (type: string) => {
    switch (type) {
      case 'in-app':
        return 'App'
      case 'email':
        return 'Email'
      default:
        return type
    }
  }

  const getRecipientsLabel = () => {
    if (!notification) return ""
    if (notification.is_all) return "All Users"
    if (notification.target_profession) return `Profession: ${notification.target_profession}`
    return `${notification.users?.length || 0} selected user${notification.users?.length === 1 ? "" : "s"}`
  }

  const handleSend = async () => {
    try {
      await sendNotificationMutation.mutateAsync(notificationId)
      success('Success', 'Notification sent successfully')
      refetch()
    } catch (err) {
      console.error('Failed to send notification:', err)
      showError('Error', getApiErrorMessage(err, 'Failed to send notification. Please try again.'))
    }
  }

  const isSent = notification?.status === 'sended' || notification?.status === 'Published'
  const shouldShowSendButton = notification && !isSent
  const emailStatus = notification?.email?.status ? EMAIL_STATUS_LABELS[notification.email.status] : null

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="View Notification"
      className="max-w-[500px]"
    >
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {isLoading ? (
        <div className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : notification ? (
        <div className="space-y-4">
          {notification.image && (
            <img src={notification.image} alt="" className="w-full max-h-48 object-cover rounded-lg bg-gray-100" />
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {notification.subject}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {notification.content}
            </p>
          </div>

          {notification.link && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LinkIcon className="w-4 h-4 text-gray-500" />
              <a href={notification.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                {notification.link}
              </a>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-500" />
            <span>Recipients: {getRecipientsLabel()}</span>
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
                isSent
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              } text-xs px-3 py-1 rounded-full`}
            >
              {notification.status === 'sended' ? 'Published' : notification.status === 'drafted' ? 'Unpublished' : notification.status}
            </Badge>
          </div>

          {/* Delivery results */}
          {isSent && (notification.type.includes('in-app') || notification.type.includes('email')) && (
            <div className="rounded-lg border border-gray-200 p-3 space-y-2 text-sm text-gray-600">
              {notification.type.includes('in-app') && notification.push && (
                <div className="flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span>
                    Sent to {notification.push.sent} phone{notification.push.sent === 1 ? '' : 's'}
                    {notification.push.failed > 0 && <span className="text-red-600"> · {notification.push.failed} failed</span>}
                    {notification.push.no_device > 0 && ` · ${notification.push.no_device} without the app installed / logged in`}
                  </span>
                </div>
              )}
              {notification.type.includes('email') && notification.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span>Email: {notification.email.sent} / {notification.email.total} sent</span>
                      {emailStatus && (
                        <Badge className={`${emailStatus.className} text-xs px-2 py-0.5 rounded-full`}>{emailStatus.label}</Badge>
                      )}
                    </div>
                    {notification.email.failed > 0 && <p className="text-red-600">{notification.email.failed} failed</p>}
                    {notification.email.no_email > 0 && <p>{notification.email.no_email} users have no email address</p>}
                    {notification.email.error && <p className="text-xs text-red-600">Last error: {notification.email.error}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

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
