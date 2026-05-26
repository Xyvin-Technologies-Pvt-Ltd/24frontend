export type JobProviderStatus = "active" | "inactive" | "pending" | "deleted"
export type JobStatus = "active" | "closed" | "draft" | "deleted"
export type JobApplicationStatus =
  | "applied"
  | "shortlisted"
  | "rejected"
  | "hired"
  | "withdrawn"

export interface BackendResponse<T> {
  status: number
  message: string
  data: T
  total_count?: number
}

export interface JobProvider {
  _id: string
  id: string
  provider_name: string
  email: string
  mobile_number: string
  website_url?: string
  location: string
  industry_type?: string
  company_size?: string
  company_logo?: string
  status: JobProviderStatus
  active_jobs: number
  applicants: number
  jobs_count?: number
  joined_on: string
  createdAt: string
  updatedAt: string
}

export interface Job {
  _id: string
  id: string
  provider: string
  title: string
  email?: string
  job_type: string
  work_mode: string
  location: string
  salary_min?: number
  salary_max?: number
  salary_range?: string | null
  about_role?: string
  responsibilities?: string
  requirements?: string
  skills: string[]
  benefits?: string
  status: JobStatus
  applicants: number
  applied_on: string
  createdAt: string
  updatedAt: string
  provider_details?: JobProvider
}

export interface JobApplication {
  _id: string
  provider: string
  job: string
  name: string
  designation?: string
  phone: string
  email: string
  location?: string
  experience?: string
  notice_period?: string
  expected_salary?: string
  website?: string
  resume_url?: string
  status: JobApplicationStatus
  createdAt: string
  updatedAt: string
}

export interface PagedResponse<T> {
  success: boolean
  message: string
  data: T[]
  total_count: number
}

export interface ItemResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface JobProviderQueryParams {
  page_no?: number
  limit?: number
  search?: string
  status?: Exclude<JobProviderStatus, "deleted">
}

export interface ProviderJobQueryParams {
  page_no?: number
  limit?: number
  search?: string
  status?: Exclude<JobStatus, "deleted">
  job_type?: "full-time" | "part-time" | "contract" | "internship" | "temporary"
  salary_range?: string
  applied_on_from?: string
  applied_on_to?: string
}

export interface JobApplicationQueryParams {
  page_no?: number
  limit?: number
  search?: string
  status?: JobApplicationStatus
  experience?: string
  applied_on_from?: string
  applied_on_to?: string
}

export interface CreateJobProviderData {
  provider_name: string
  email: string
  mobile_number: string
  website_url?: string
  location: string
  industry_type?: string
  company_size?: string
  company_logo?: File | string
  status?: Exclude<JobProviderStatus, "deleted">
}

export interface UpdateJobProviderData {
  provider_name?: string
  email?: string
  mobile_number?: string
  website_url?: string
  location?: string
  industry_type?: string
  company_size?: string
  company_logo?: File | string
  status?: JobProviderStatus
}

export interface CreateJobData {
  title: string
  email?: string
  job_type: "full-time" | "part-time" | "contract" | "internship" | "temporary"
  work_mode: "remote" | "onsite" | "hybrid"
  location: string
  salary_min?: number
  salary_max?: number
  about_role?: string
  responsibilities?: string
  requirements?: string
  skills?: string[]
  benefits?: string
  status?: Exclude<JobStatus, "deleted">
}

export interface UpdateJobData {
  title?: string
  email?: string
  job_type?: "full-time" | "part-time" | "contract" | "internship" | "temporary"
  work_mode?: "remote" | "onsite" | "hybrid"
  location?: string
  salary_min?: number
  salary_max?: number
  about_role?: string
  responsibilities?: string
  requirements?: string
  skills?: string[]
  benefits?: string
  status?: JobStatus
}
