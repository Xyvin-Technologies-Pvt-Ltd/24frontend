export interface AssessmentQuestion {
  question: { en: string; ml: string };
  options: { text: { en: string; ml: string } }[];
  correct_index: number;
}

export interface Assessment {
  _id: string;
  event_id: string;
  passing_score: number;
  duration_minutes: number;
  questions: AssessmentQuestion[];
  certificate_template: string;
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAttempt {
  _id: string;
  user_id: string;
  event_id: string;
  assessment_id: string;
  answers: {
    question_index: number;
    selected_index: number;
  }[];
  score: number;
  passed: boolean;
  certificate_url: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentData {
  event_id: string;
  questions: AssessmentQuestion[];
  certificate_template: string;
  passing_score?: number;
  duration_minutes?: number;
}

export interface UpdateAssessmentData {
  questions?: AssessmentQuestion[];
  certificate_template?: string;
}

export interface SubmitAssessmentData {
  answers: {
    question_index: number;
    selected_index: number;
  }[];
}

export interface SubmitAssessmentResponse {
  success: boolean;
  message: string;
  data: {
    score: number;
    total: number;
    passed: boolean;
    certificate_url: string;
  };
}

export interface AssessmentResponse {
  success: boolean;
  message: string;
  data: Assessment;
}

export interface AssessmentAttemptResponse {
  success: boolean;
  message: string;
  data: AssessmentAttempt;
}

export interface AssessmentByEventResponse {
  success: boolean;
  message: string;
  data: Omit<Assessment, 'questions'> & {
    questions: {
      question: { en: string; ml: string };
      options: { text: { en: string; ml: string } }[];
    }[];
  };
}