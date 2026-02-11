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
      if (q.options) {
        transformedQ.options = q.options.map((opt) => {
          if (typeof opt === 'string') {
            return { en: opt, ml: opt }
          }
          return opt
        })
      }

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

  // Get survey by ID (using mobile endpoint since admin endpoint doesn't exist)
  getSurveyById: async (id: string): Promise<SurveyResponseType> => {
    const response = await api.get(`/survey/mobile/${id}`)
    return {
      ...response.data,
      data: transformFromBackend(response.data.data)
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

  // Delete survey (not available in backend, will throw error)
  deleteSurvey: async (_id: string): Promise<SurveyResponseType> => {
    throw new Error('Delete survey endpoint is not available in the backend API')
  },

  // Submit survey response
  submitResponse: async (id: string, responseData: SubmitResponseData): Promise<SurveyResponseType> => {
    const response = await api.post(`/survey/mobile/submit/${id}`, responseData)
    return response.data
  },

  // Get survey responses (using responders endpoint)
  getSurveyResponses: async (id: string, params: SurveysQueryParams = {}): Promise<any> => {
    const response = await api.get(`/survey/responders/${id}`, { params })
    return response.data
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
