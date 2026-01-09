export interface Event {
  _id: string
  event_name: string
  description: string
  type: 'Online' | 'Offline'
  organiser_name: string
  banner_image: string
  attachments: string[]
  event_start_date: string
  event_end_date: string
  poster_visibility_start_date: string
  poster_visibility_end_date: string
  link?: string
  venue?: string
  speakers: Speaker[]
  coordinators: Coordinator[]
  guests: Guest[]
  status: 'pending' | 'upcomming' | 'live' | 'completed' | 'cancelled' | 'review' | 'rejected' | 'postponed'
  rsvp: string[]
  attendence: string[]
  created_by: string
  reject_reason?: string
  createdAt: string
  updatedAt: string
}

export interface Speaker {
  name: string
  designation: string
  image?: string
}

export interface Coordinator {
  name: string
  designation: string
  image?: string
}

export interface Guest {
  name: string
  designation: string
  image?: string
  role: string
}

export interface CreateEventData {
  event_name: string
  description: string
  type: 'Online' | 'Offline'
  organiser_name: string
  banner_image: string
  attachments?: string[]
  event_start_date: string
  event_end_date: string
  poster_visibility_start_date: string
  poster_visibility_end_date: string
  link?: string
  venue?: string
  speakers?: Speaker[]
  coordinators?: Coordinator[]
  guests?: Guest[]
  status?: 'pending' | 'upcomming' | 'live' | 'completed' | 'cancelled' | 'review' | 'rejected' | 'postponed'
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface EventsResponse {
  success: boolean
  message: string
  data: Event[]
  total_count: number
}

export interface EventResponse {
  success: boolean
  message: string
  data: Event
}

export interface EventsQueryParams {
  page_no?: number
  limit?: number
  status?: string
  search?: string
  self_event?: boolean
}

export interface ApproveEventData {
  status: 'pending' | 'rejected'
  reject_reason?: string
}

export interface AttendanceData {
  user_id: string
}

export interface RSVPData {
  user_id: string
}