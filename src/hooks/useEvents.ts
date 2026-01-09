import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventService } from '@/services/eventService'
import type { 
  CreateEventData, 
  UpdateEventData, 
  EventsQueryParams,
  ApproveEventData,
  AttendanceData,
  RSVPData
} from '@/types/event'

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params: EventsQueryParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  registered: () => [...eventKeys.all, 'registered'] as const,
  attendees: (id: string) => [...eventKeys.all, 'attendees', id] as const,
}

// Get events with pagination and filters
export const useEvents = (params: EventsQueryParams = {}) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventService.getEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single event by ID
export const useEvent = (id: string) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getEventById(id),
    enabled: !!id,
  })
}

// Get registered events for current user
export const useRegisteredEvents = (params: EventsQueryParams = {}) => {
  return useQuery({
    queryKey: eventKeys.registered(),
    queryFn: () => eventService.getRegisteredEvents(params),
    staleTime: 5 * 60 * 1000,
  })
}

// Get event attendees
export const useEventAttendees = (id: string) => {
  return useQuery({
    queryKey: eventKeys.attendees(id),
    queryFn: () => eventService.getAttendees(id),
    enabled: !!id,
  })
}

// Create event mutation
export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (eventData: CreateEventData) => eventService.createEvent(eventData),
    onSuccess: () => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

// Update event mutation
export const useUpdateEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, eventData }: { id: string; eventData: UpdateEventData }) => 
      eventService.updateEvent(id, eventData),
    onSuccess: (_, variables) => {
      // Invalidate events list and specific event detail
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) })
    },
  })
}

// Delete event mutation
export const useDeleteEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

// Add RSVP mutation
export const useAddRSVP = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, rsvpData }: { id: string; rsvpData: RSVPData }) => 
      eventService.addRSVP(id, rsvpData),
    onSuccess: (_, variables) => {
      // Invalidate event detail and registered events
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.registered() })
      queryClient.invalidateQueries({ queryKey: eventKeys.attendees(variables.id) })
    },
  })
}

// Mark attendance mutation
export const useMarkAttendance = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, attendanceData }: { id: string; attendanceData: AttendanceData }) => 
      eventService.markAttendance(id, attendanceData),
    onSuccess: (_, variables) => {
      // Invalidate event detail and attendees
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.attendees(variables.id) })
    },
  })
}

// Approve event mutation (admin only)
export const useApproveEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, approvalData }: { id: string; approvalData: ApproveEventData }) => 
      eventService.approveEvent(id, approvalData),
    onSuccess: (_, variables) => {
      // Invalidate events list and specific event detail
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) })
    },
  })
}