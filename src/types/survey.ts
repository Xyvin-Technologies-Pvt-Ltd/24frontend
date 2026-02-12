// Multilingual field interface
export interface MultilingualField {
  en: string
  ml: string
}

export interface SurveyQuestion {
  _id?: string
  question_text: MultilingualField | string
  answer_type: 'text' | 'textarea' | 'multiple_choice' | 'checkbox' | 'rating' | 'date' | 'file'
  options?: (MultilingualField | string)[]
  is_required?: boolean
  order?: number
}

export interface Survey {
  _id: string
  survey_name: MultilingualField | string
  description: MultilingualField | string
  banner_image: string
  questions: SurveyQuestion[]
  status: 'active' | 'closed' // Backend only supports active/closed
  start_date?: string // Optional, not in backend model
  end_date?: string // Optional, not in backend model
  created_by: {
    _id: string
    name: string
    email?: string
  }
  responses_count: number
  createdAt: string
  updatedAt: string
}

export interface SurveyAnswer {
  question_id: string
  answer: any
}

export interface SurveyResponse {
  _id: string
  survey_id: string
  user_id: {
    _id: string
    name: string
    email: string
    member_id?: string
  }
  answers: SurveyAnswer[]
  submitted_at: string
  createdAt: string
  updatedAt: string
}

export interface CreateSurveyData {
  survey_name: MultilingualField | string
  description: MultilingualField | string
  banner_image: string
  questions: SurveyQuestion[]
  status?: 'active' | 'closed' // Backend only supports active/closed, no draft
  start_date?: string // Optional, not in backend model
  end_date?: string // Optional, not in backend model
}

export interface UpdateSurveyData extends Partial<CreateSurveyData> {}

export interface SurveysResponse {
  success: boolean
  message: string
  data: Survey[]
  total_count: number
}

export interface SurveyResponse {
  success: boolean
  message: string
  data: Survey
}

export interface SurveysQueryParams {
  page_no?: number
  limit?: number
  status?: string
  search?: string
}

export interface SubmitResponseData {
  answers: SurveyAnswer[]
}
