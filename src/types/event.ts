// Multilingual field interface
export interface MultilingualField {
  en: string
  ml: string
}

export interface Event {
  _id: string
  event_name: MultilingualField
  description: MultilingualField
  type: 'Online' | 'Offline'
  organiser_name: MultilingualField
  banner_image: string
  attachments: string[]
  event_start_date: string
  event_end_date: string
  poster_visibility_start_date: string
  poster_visibility_end_date: string
  link?: string
  venue?: MultilingualField
  speakers: Speaker[]
  coordinators: Coordinator[]
  guests: Guest[]
  status: 'pending' | 'upcomming' | 'live' | 'completed' | 'cancelled' | 'review' | 'rejected' | 'postponed'
  rsvp: EventUser[]
  attendence: EventUser[]
  created_by: string
  reject_reason?: string
  is_assessment_included?: boolean
  assessment_id?: string
  createdAt: string
  updatedAt: string
}

export interface EventUser {
  _id?: string
  name: string
  email: string
  image?: string
  phone?: string
  member_id?: string
  proffession?: string
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

import type { AssessmentQuestion } from './assessment';

export interface CreateEventData {
  event_name: MultilingualField
  description: MultilingualField
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
  is_assessment_included?: boolean
  assessment?: {
    questions: AssessmentQuestion[];
    certificate_template: string;
    passing_score?: number;
    duration_minutes?: number;
  };
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