import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessmentService';
import type { 
  CreateAssessmentData, 
  UpdateAssessmentData, 
  SubmitAssessmentData 
} from '@/types/assessment';

// Query keys
export const assessmentKeys = {
  all: ['assessments'] as const,
  details: () => [...assessmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assessmentKeys.details(), id] as const,
  byEvent: (eventId: string) => [...assessmentKeys.all, 'byEvent', eventId] as const,
  results: () => [...assessmentKeys.all, 'results'] as const,
  result: (eventId: string) => [...assessmentKeys.results(), eventId] as const,
};

// Get assessment by event ID
export const useAssessmentByEvent = (eventId: string) => {
  return useQuery({
    queryKey: assessmentKeys.byEvent(eventId),
    queryFn: () => assessmentService.getAssessmentByEvent(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get assessment result by event ID
export const useAssessmentResult = (eventId: string) => {
  return useQuery({
    queryKey: assessmentKeys.result(eventId),
    queryFn: () => assessmentService.getAssessmentResult(eventId),
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create assessment mutation
export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assessmentData: CreateAssessmentData) => 
      assessmentService.createAssessment(assessmentData),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: assessmentKeys.byEvent(data.data.event_id) 
      });
    },
  });
};

// Update assessment mutation
export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, assessmentData }: { id: string; assessmentData: UpdateAssessmentData }) => 
      assessmentService.updateAssessment(id, assessmentData),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: assessmentKeys.detail(variables.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assessmentKeys.byEvent(data.data.event_id) 
      });
    },
  });
};

// Submit assessment mutation
export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, submitData }: { id: string; submitData: SubmitAssessmentData }) => 
      assessmentService.submitAssessment(id, submitData),
    onSuccess: (_, variables) => {
      // Invalidate result and related queries
      queryClient.invalidateQueries({ 
        queryKey: assessmentKeys.result(variables.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assessmentKeys.byEvent(variables.id) 
      });
    },
  });
};