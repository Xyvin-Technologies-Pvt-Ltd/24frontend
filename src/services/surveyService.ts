import axios from 'axios'
import { api } from '@/lib/api'
import type { 
  CreateSurveyData, 
  UpdateSurveyData, 
  SurveysResponse, 
  SurveyResponse as SurveyResponseType,
  SurveysQueryParams,
  SubmitResponseData,
  Survey,
  SurveyQuestion
} from '@/types/survey'

// Transform frontend data to backend format
const transformToBackend = (data: CreateSurveyData | UpdateSurveyData): any => {
  const transformed: any = {}

  // Transform survey_name to title (backend expects title with en/ml)
  if ('survey_name' in data && data.survey_name) {
    if (typeof data.survey_name === 'string') {
      transformed.title = { en: data.survey_name, ml: data.survey_name }
    } else {
      transformed.title = data.survey_name
    }
  }

  // Transform description (backend expects en/ml)
  if (data.description) {
    if (typeof data.description === 'string') {
      transformed.description = { en: data.description, ml: data.description }
    } else {
      transformed.description = data.description
    }
  }

  // Transform banner_image to banner
  if ('banner_image' in data) {
    transformed.banner = data.banner_image
  }

  // Transform status (backend only supports active/closed)
  if (data.status) {
    transformed.status = data.status
  }

  // Transform questions
  if ('questions' in data && data.questions) {
    transformed.questions = data.questions.map((q: SurveyQuestion) => {
      const transformedQ: any = {}

      // Transform question_text to label (backend expects label with en/ml)
      if (q.question_text) {
        if (typeof q.question_text === 'string') {
          transformedQ.label = { en: q.question_text, ml: q.question_text }
        } else {
          transformedQ.label = q.question_text
        }
      }

      // Transform answer_type to type
      if (q.answer_type) {
        transformedQ.type = q.answer_type
      }

      // Transform options (backend expects en/ml for each option)
      // ONLY include options for multiple_choice type - exclude for text/textarea
      if (q.answer_type === 'multiple_choice') {
        if (q.options && q.options.length > 0) {
          transformedQ.options = q.options.map((opt) => {
            if (typeof opt === 'string') {
              return { en: opt, ml: opt }
            }
            return opt
          })
        } else {
          // For multiple_choice with no options, initialize with empty array
          transformedQ.options = []
        }
      }
      // Do NOT include options property for text/textarea types

      // Transform is_required to required
      if (q.is_required !== undefined) {
        transformedQ.required = q.is_required
      }

      if (q.order !== undefined) {
        transformedQ.order = q.order
      }

      return transformedQ
    })
  }

  return transformed
}

// Transform backend data to frontend format
const transformFromBackend = (data: any): Survey => {
  return {
    _id: data._id,
    survey_name: data.title || { en: '', ml: '' },
    description: data.description || { en: '', ml: '' },
    banner_image: data.banner || '',
    start_date: data.start_date || '',
    end_date: data.end_date || '',
    status: data.status || 'active',
    questions: (data.questions || []).map((q: any) => ({
      _id: q._id,
      question_text: q.label || { en: '', ml: '' },
      answer_type: q.type || 'text',
      options: q.options || [],
      is_required: q.required || false,
      order: q.order || 0,
    })),
    created_by: data.created_by || { _id: '', name: '', email: '' },
    responses_count: data.responses_count || 0,
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
  }
}

export const surveyService = {
  // Get all surveys with pagination and filters
  getSurveys: async (params: SurveysQueryParams = {}): Promise<SurveysResponse> => {
    const response = await api.get('/survey', { params })
    return {
      ...response.data,
      data: response.data.data.map(transformFromBackend)
    }
  },

  // Get survey by ID
  // Currently only authenticated endpoint exists: GET /survey/mobile/:id
  // For public access, the backend needs to add: GET /public/survey/:id
  getSurveyById: async (id: string): Promise<SurveyResponseType> => {
    // Try authenticated endpoint first
    try {
      const response = await api.get(`/survey/mobile/${id}`)
      return {
        ...response.data,
        data: transformFromBackend(response.data.data)
      }
    } catch (error: any) {
      // If 401 (unauthorized), try without auth headers for public access
      if (error.response?.status === 401) {
        // Use direct axios call without auth interceptor
        const response = await axios.get(
          `${api.defaults.baseURL}/survey/mobile/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': api.defaults.headers['x-api-key'],
            }
          }
        )
        return {
          ...response.data,
          data: transformFromBackend(response.data.data)
        }
      }
      throw error
    }
  },

  // Create new survey
  createSurvey: async (surveyData: CreateSurveyData): Promise<SurveyResponseType> => {
    const backendData = transformToBackend(surveyData)
    const response = await api.post('/survey', backendData)
    return {
      ...response.data,
      data: transformFromBackend(response.data.data)
    }
  },

  // Update survey
  updateSurvey: async (id: string, surveyData: UpdateSurveyData): Promise<SurveyResponseType> => {
    const backendData = transformToBackend(surveyData)
    const response = await api.put(`/survey/${id}`, backendData)
    return {
      ...response.data,
      data: transformFromBackend(response.data.data)
    }
  },

  // Delete survey (soft delete)
  deleteSurvey: async (id: string): Promise<SurveyResponseType> => {
    const response = await api.delete(`/survey/${id}`)
    return response.data
  },

  // Submit survey response (for authenticated users)
  // Uses: POST /survey/mobile/submit/:id
  // Requires: x-api-key header + Authorization Bearer token
  // Includes user_id in the response record (extracted from JWT token)
  submitResponse: async (id: string, responseData: SubmitResponseData): Promise<SurveyResponseType> => {
    // Token is automatically added by api interceptor
    const response = await api.post(`/survey/mobile/submit/${id}`, responseData)
    return response.data
  },

  // Submit public survey response (for non-authenticated users)
  // Uses: POST /public/survey/submit/:id
  // Requires: Only x-api-key header (no Authorization token)
  // Sets user_id to null in the response record
  submitPublicResponse: async (id: string, responseData: SubmitResponseData): Promise<SurveyResponseType> => {
    // Create a separate axios instance without auth interceptor for public endpoint
    const response = await axios.post(
      `${api.defaults.baseURL}/public/survey/submit/${id}`,
      responseData,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': api.defaults.headers['x-api-key'],
        }
      }
    )
    return response.data
  },

  // Get survey responses (using responders endpoint)
  getSurveyResponses: async (id: string, params: SurveysQueryParams = {}): Promise<any> => {
    const response = await api.get(`/survey/responders/${id}`, { params })
    return response.data
  },

  // Get single response details
  getSingleResponse: async (responseId: string): Promise<any> => {
    const response = await api.get(`/survey/response/${responseId}`)
    return response.data
  },

  // Get all responses with full details for a survey
  getAllResponsesWithDetails: async (id: string): Promise<any> => {
    // First get the list of responders
    const respondersResponse = await api.get(`/survey/responders/${id}`)
    const responders = respondersResponse.data.data || []
    
    // Then fetch full details for each response
    const detailedResponses = await Promise.all(
      responders.map(async (responder: any) => {
        try {
          const detailResponse = await api.get(`/survey/response/${responder.response_id}`)
          return {
            ...responder,
            fullDetails: detailResponse.data.data
          }
        } catch (error) {
          console.error(`Failed to fetch details for response ${responder.response_id}:`, error)
          return responder
        }
      })
    )
    
    return { data: detailedResponses }
  },

  // Download surveys CSV (using export endpoint - requires survey ID)
  downloadSurveys: async (_params: SurveysQueryParams = {}): Promise<Blob> => {
    throw new Error('Bulk download is not available. Use export for individual surveys.')
  },

  // Export single survey
  exportSurvey: async (id: string): Promise<Blob> => {
    const response = await api.get(`/survey/export/${id}`, { 
      responseType: 'blob'
    })
    return response.data
  }
}
