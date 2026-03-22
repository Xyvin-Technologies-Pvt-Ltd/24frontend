export type FinancialProgrammeStatus =
  | "active"
  | "inactive"
  | "completed"
  | "deleted"

export type FinancialProgrammeType = "medical" | "housing"

export type FinancialProgrammeEntryType =
  | "request"
  | "referral"
  | "donation"
  | "housing_project"

export type FinancialProgrammeRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"

export type FinancialProgrammeReferralStatus =
  | "pending"
  | "contacted"
  | "converted"
  | "rejected"

export type FinancialProgrammeDonationStatus =
  | "pending"
  | "success"
  | "failed"
  | "cancelled"

export type FinancialProgrammeHousingProjectStatus =
  | "Fund Allocated"
  | "In Progress"
  | "Completed"

export interface ApiListResponse<T> {
  status: number
  message: string
  data: T[]
  total_count: number
}

export interface ApiItemResponse<T> {
  status: number
  message: string
  data: T
  total_count?: number
}

export interface FinancialProgramme {
  _id: string
  programme: string
  type: FinancialProgrammeType
  goal: string
  progress: number
  subtitle?: string
  banner?: string
  description?: string
  status: FinancialProgrammeStatus
  created_by?: string
  updated_by?: string
  deleted_by?: string
  createdAt: string
  updatedAt: string
}

export interface FinancialProgrammeDetail extends FinancialProgramme {
  requests: number
  referrals: number
  donations: number
  housing_projects: number
  total_donated_amount: number
}

export interface FinancialProgrammeQueryParams {
  page_no?: number
  limit?: number
  search?: string
  status?: Exclude<FinancialProgrammeStatus, "deleted">
}

export interface FinancialProgrammeFormData {
  programme: string
  type: FinancialProgrammeType
  goal: string
  progress?: number
  subtitle?: string
  banner?: string
  description?: string
  status?: Exclude<FinancialProgrammeStatus, "deleted">
}

export interface FinancialProgrammeRequest {
  _id: string
  financial_programme: string
  type: "request"
  name: string
  date_of_birth?: string
  gender?: "Male" | "Female" | "Other"
  current_district?: string
  current_address: string
  phone_number: string
  is_on_life_mission?: boolean
  family_members?: number
  current_shelter_situation?: string
  monthly_income?: string
  employment_status?: string
  details_of_situation: string
  supporting_photos?: string[]
  owns_land_for_house?: boolean
  land_area?: string
  privacy_policy_accepted?: boolean
  declaration_accepted?: boolean
  status?: FinancialProgrammeRequestStatus
  rejection_reason?: string
  submitted_by?: string
  reviewed_by?: string
  createdAt: string
  updatedAt: string
}

export interface CreateFinancialProgrammeRequestData {
  name: string
  date_of_birth?: string
  gender?: "Male" | "Female" | "Other"
  current_district?: string
  current_address: string
  phone_number: string
  is_on_life_mission?: boolean
  family_members?: number
  current_shelter_situation?: string
  monthly_income?: string
  employment_status?: string
  details_of_situation: string
  supporting_photos?: string[]
  owns_land_for_house?: boolean
  land_area?: string
  privacy_policy_accepted?: boolean
  declaration_accepted?: boolean
  status?: FinancialProgrammeRequestStatus
  rejection_reason?: string
}

export type UpdateFinancialProgrammeRequestData =
  Partial<CreateFinancialProgrammeRequestData>

export interface FinancialProgrammeReferral {
  _id: string
  financial_programme: string
  type: "referral"
  name: string
  phone: string
  location: string
  notes?: string
  status?: FinancialProgrammeReferralStatus
  referrer?: string
  referrer_name?: string
  referrer_phone?: string
  createdAt: string
  updatedAt: string
}

export interface CreateFinancialProgrammeReferralData {
  name: string
  phone: string
  location: string
}

export interface UpdateFinancialProgrammeReferralData {
  name?: string
  phone?: string
  location?: string
  notes?: string
  status?: FinancialProgrammeReferralStatus
  referrer_name?: string
  referrer_phone?: string
}

export interface FinancialProgrammeDonation {
  _id: string
  financial_programme: string
  type: "donation"
  name: string
  phone_number: string
  message?: string
  donated_amount?: number
  currency?: string
  status?: FinancialProgrammeDonationStatus
  user?: string
  createdAt: string
  updatedAt: string
}

export interface CreateFinancialProgrammeDonationData {
  name: string
  phone_number: string
  message?: string
}

export interface UpdateFinancialProgrammeDonationData {
  name?: string
  phone_number?: string
  message?: string
  donated_amount?: number
  currency?: string
  status?: FinancialProgrammeDonationStatus
}

export interface FinancialProgrammeHousingProject {
  _id: string
  financial_programme: string
  type: "housing_project"
  house_id: string
  beneficiary: string
  location: string
  status?: FinancialProgrammeHousingProjectStatus
  photos?: string[]
  description?: string
  created_by?: string
  updated_by?: string
  createdAt: string
  updatedAt: string
}

export interface CreateFinancialProgrammeHousingProjectData {
  house_id: string
  beneficiary: string
  location: string
  status?: FinancialProgrammeHousingProjectStatus
  photos?: string[]
  description?: string
}

export type UpdateFinancialProgrammeHousingProjectData =
  Partial<CreateFinancialProgrammeHousingProjectData>

export interface FinancialProgrammeEntryQueryParams {
  page_no?: number
  limit?: number
  search?: string
  status?: string
}
