import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { useUpdateEvent } from "@/hooks/useEvents"
import type { Event, UpdateEventData } from "@/types/event"
import { Loader2 } from "lucide-react"

interface EditEventFormProps {
  event: Event
  onBack: () => void
  onSave: () => void
}

export function EditEventForm({ event, onBack, onSave }: EditEventFormProps) {
  const [formData, setFormData] = useState({
    eventType: event.type || "",
    eventName: event.event_name || "",
    organisedBy: event.organiser_name || "",
    description: event.description || "",
    startDate: event.event_start_date ? event.event_start_date.split('T')[0] : "",
    endDate: event.event_end_date ? event.event_end_date.split('T')[0] : "",
    displayFrom: event.poster_visibility_start_date ? event.poster_visibility_start_date.split('T')[0] : "",
    displayUntil: event.poster_visibility_end_date ? event.poster_visibility_end_date.split('T')[0] : "",
    locationLink: event.link || event.venue || "",
    status: event.status || "review"
  })

  const updateEventMutation = useUpdateEvent()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      const eventData: UpdateEventData = {
        event_name: formData.eventName,
        description: formData.description,
        type: formData.eventType as 'Online' | 'Offline',
        organiser_name: formData.organisedBy,
        event_start_date: formData.startDate,
        event_end_date: formData.endDate,
        poster_visibility_start_date: formData.displayFrom,
        poster_visibility_end_date: formData.displayUntil,
        link: formData.eventType === 'Online' ? formData.locationLink : undefined,
        venue: formData.eventType === 'Offline' ? formData.locationLink : undefined,
        status: formData.status as any
      }

      await updateEventMutation.mutateAsync({
        id: event._id,
        eventData
      })
      onSave()
    } catch (error) {
      console.error('Failed to update event:', error)
    }
  }

  const handleCancel = () => {
    onBack()
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-8">
          <button 
            onClick={onBack}
            className="hover:text-gray-900"
          >
            Content Management
          </button>
          <span className="mx-2">›</span>
          <span>Events</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Edit Event</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 width-full">
          <div className="space-y-6">
            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <Select
                value={formData.eventType}
                onChange={(e) => handleInputChange("eventType", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
              >
                <option value="">Select Event Type</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </Select>
            </div>

            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name
              </label>
              <Input
                placeholder="Enter event name"
                value={formData.eventName}
                onChange={(e) => handleInputChange("eventName", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
              />
            </div>

            {/* Organised By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organised By
              </label>
              <Input
                placeholder="Enter organiser name"
                value={formData.organisedBy}
                onChange={(e) => handleInputChange("organisedBy", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter event description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full border-gray-300 rounded-lg p-3 h-32 resize-none"
              />
            </div>

            {/* Start and End Date Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Display From and Until Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display From
                </label>
                <Input
                  type="date"
                  value={formData.displayFrom}
                  onChange={(e) => handleInputChange("displayFrom", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Until
                </label>
                <Input
                  type="date"
                  value={formData.displayUntil}
                  onChange={(e) => handleInputChange("displayUntil", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Location/Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.eventType === 'Online' ? 'Meeting Link' : 'Venue'}
              </label>
              <Input
                placeholder={formData.eventType === 'Online' ? 'Enter meeting link' : 'Enter venue address'}
                value={formData.locationLink}
                onChange={(e) => handleInputChange("locationLink", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
              >
                <option value="review">Review</option>
                <option value="pending">Pending</option>
                <option value="upcomming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="postponed">Postponed</option>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateEventMutation.isPending}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateEventMutation.isPending}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full"
              >
                {updateEventMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Event'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}