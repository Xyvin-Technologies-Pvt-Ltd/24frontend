import { api } from '@/lib/api';
import type { 
  CreateAssessmentData, 
  UpdateAssessmentData, 
  SubmitAssessmentData, 
  SubmitAssessmentResponse,
  AssessmentResponse,
  AssessmentByEventResponse,
  AssessmentAttemptResponse
} from '@/types/assessment';

export const assessmentService = {
  // Create assessment
  createAssessment: async (assessmentData: CreateAssessmentData): Promise<AssessmentResponse> => {
    const response = await api.post('/assessment', assessmentData);
    return response.data;
  },

  // Update assessment
  updateAssessment: async (id: string, assessmentData: UpdateAssessmentData): Promise<AssessmentResponse> => {
    const response = await api.put(`/assessment/${id}`, assessmentData);
    return response.data;
  },

  // Get assessment by event ID
  getAssessmentByEvent: async (eventId: string): Promise<AssessmentByEventResponse> => {
    const response = await api.get(`/assessment/by-event/${eventId}`);
    return response.data;
  },

  // Submit assessment
  submitAssessment: async (id: string, submitData: SubmitAssessmentData): Promise<SubmitAssessmentResponse> => {
    const response = await api.post(`/assessment/${id}/submit`, submitData);
    return response.data;
  },

  // Get assessment result by event ID
  getAssessmentResult: async (eventId: string): Promise<AssessmentAttemptResponse> => {
    const response = await api.get(`/assessment/result/${eventId}`);
    return response.data;
  }
};