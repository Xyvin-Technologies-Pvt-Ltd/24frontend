import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { surveyService } from '@/services/surveyService'
import type { 
  CreateSurveyData, 
  UpdateSurveyData, 
  SurveysQueryParams,
  SubmitResponseData
} from '@/types/survey'

// Query keys
export const surveyKeys = {
  all: ['surveys'] as const,
  lists: () => [...surveyKeys.all, 'list'] as const,
  list: (params: SurveysQueryParams) => [...surveyKeys.lists(), params] as const,
  details: () => [...surveyKeys.all, 'detail'] as const,
  detail: (id: string) => [...surveyKeys.details(), id] as const,
  responses: (id: string) => [...surveyKeys.all, 'responses', id] as const,
}

// Get surveys with pagination and filters
export const useSurveys = (params: SurveysQueryParams = {}) => {
  return useQuery({
    queryKey: surveyKeys.list(params),
    queryFn: () => surveyService.getSurveys(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single survey by ID
export const useSurvey = (id: string) => {
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: () => surveyService.getSurveyById(id),
    enabled: !!id,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

// Get survey responses
export const useSurveyResponses = (id: string, params: SurveysQueryParams = {}) => {
  return useQuery({
    queryKey: surveyKeys.responses(id),
    queryFn: () => surveyService.getSurveyResponses(id, params),
    enabled: !!id,
  })
}

// Get all responses with full details
export const useAllResponsesWithDetails = (id: string) => {
  return useQuery({
    queryKey: [...surveyKeys.all, 'all-details', id] as const,
    queryFn: () => surveyService.getAllResponsesWithDetails(id),
    enabled: !!id,
  })
}

// Create survey mutation
export const useCreateSurvey = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (surveyData: CreateSurveyData) => surveyService.createSurvey(surveyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() })
    },
  })
}

// Update survey mutation
export const useUpdateSurvey = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, surveyData }: { id: string; surveyData: UpdateSurveyData }) => 
      surveyService.updateSurvey(id, surveyData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.id) })
    },
  })
}

// Delete survey mutation
export const useDeleteSurvey = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => surveyService.deleteSurvey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() })
    },
  })
}

// Get single response details
export const useSingleResponse = (responseId: string) => {
  return useQuery({
    queryKey: [...surveyKeys.all, 'single-response', responseId] as const,
    queryFn: () => surveyService.getSingleResponse(responseId),
    enabled: !!responseId,
  })
}

// Submit response mutation
export const useSubmitResponse = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, responseData }: { id: string; responseData: SubmitResponseData }) => 
      surveyService.submitResponse(id, responseData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: surveyKeys.responses(variables.id) })
    },
  })
}

// Download surveys mutation
export const useDownloadSurveys = () => {
  return useMutation({
    mutationFn: (params: SurveysQueryParams) =>
      surveyService.downloadSurveys(params),
  })
}
