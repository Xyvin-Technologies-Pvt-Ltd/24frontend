import { api } from '@/lib/api'
import type { 
  CreateEventData, 
  UpdateEventData, 
  EventsResponse, 
  EventResponse,
  EventsQueryParams,
  ApproveEventData,
  AttendanceData,
  RSVPData
} from '@/types/event'

export const eventService = {
  // Get all events with pagination and filters
  getEvents: async (params: EventsQueryParams = {}): Promise<EventsResponse> => {
    const response = await api.get('/events', { params })
    return response.data
  },

  // Get event by ID
  getEventById: async (id: string): Promise<EventResponse> => {
    const response = await api.get(`/events/${id}`)
    return response.data
  },

  // Create new event
  createEvent: async (eventData: CreateEventData): Promise<EventResponse> => {
    const response = await api.post('/events', eventData)
    return response.data
  },

  // Update event
  updateEvent: async (id: string, eventData: UpdateEventData): Promise<EventResponse> => {
    const response = await api.put(`/events/${id}`, eventData)
    return response.data
  },

  // Delete event
  deleteEvent: async (id: string): Promise<EventResponse> => {
    const response = await api.delete(`/events/${id}`)
    return response.data
  },

  // Get registered events for current user
  getRegisteredEvents: async (params: EventsQueryParams = {}): Promise<EventsResponse> => {
    const response = await api.get('/events/registered-events', { params })
    return response.data
  },

  // Add RSVP to event
  addRSVP: async (id: string, rsvpData: RSVPData): Promise<EventResponse> => {
    const response = await api.patch(`/events/${id}`, rsvpData)
    return response.data
  },

  // Mark attendance for event
  markAttendance: async (id: string, attendanceData: AttendanceData): Promise<EventResponse> => {
    const response = await api.post(`/events/attend/${id}`, attendanceData)
    return response.data
  },

  // Get event attendees
  getAttendees: async (id: string): Promise<EventResponse> => {
    const response = await api.get(`/events/attend/${id}`)
    return response.data
  },

  // Approve/reject event (admin only)
  approveEvent: async (id: string, approvalData: ApproveEventData): Promise<EventResponse> => {
    const response = await api.patch(`/events/approve/${id}`, approvalData)
    return response.data
  },

  // Download events CSV
  downloadEvents: async (params: EventsQueryParams = {}): Promise<Blob> => {
    const response = await api.get('/events/download-events', { 
      params,
      responseType: 'blob'
    })
    return response.data
  }
}