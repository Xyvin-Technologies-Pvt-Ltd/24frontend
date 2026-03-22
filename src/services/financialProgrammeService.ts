import { api } from "@/lib/api"
import type {
  ApiItemResponse,
  ApiListResponse,
  CreateFinancialProgrammeDonationData,
  CreateFinancialProgrammeHousingProjectData,
  CreateFinancialProgrammeReferralData,
  CreateFinancialProgrammeRequestData,
  FinancialProgramme,
  FinancialProgrammeDetail,
  FinancialProgrammeDonation,
  FinancialProgrammeEntryQueryParams,
  FinancialProgrammeFormData,
  FinancialProgrammeHousingProject,
  FinancialProgrammeQueryParams,
  FinancialProgrammeReferral,
  FinancialProgrammeRequest,
  UpdateFinancialProgrammeDonationData,
  UpdateFinancialProgrammeHousingProjectData,
  UpdateFinancialProgrammeReferralData,
  UpdateFinancialProgrammeRequestData,
} from "@/types/financial-programme"

export const financialProgrammeService = {
  getFinancialProgrammes: async (
    params: FinancialProgrammeQueryParams = {}
  ): Promise<ApiListResponse<FinancialProgramme>> => {
    const response = await api.get("/financial-programme", { params })
    return response.data
  },

  getFinancialProgrammeById: async (
    id: string
  ): Promise<ApiItemResponse<FinancialProgrammeDetail>> => {
    const response = await api.get(`/financial-programme/${id}`)
    return response.data
  },

  createFinancialProgramme: async (
    data: FinancialProgrammeFormData
  ): Promise<ApiItemResponse<FinancialProgramme>> => {
    const response = await api.post("/financial-programme", data)
    return response.data
  },

  updateFinancialProgramme: async (
    id: string,
    data: Partial<FinancialProgrammeFormData>
  ): Promise<ApiItemResponse<FinancialProgramme>> => {
    const response = await api.put(`/financial-programme/${id}`, data)
    return response.data
  },

  deleteFinancialProgramme: async (
    id: string
  ): Promise<ApiItemResponse<FinancialProgramme>> => {
    const response = await api.delete(`/financial-programme/${id}`)
    return response.data
  },

  getRequests: async (
    programmeId: string,
    params: FinancialProgrammeEntryQueryParams = {}
  ): Promise<ApiListResponse<FinancialProgrammeRequest>> => {
    const response = await api.get(
      `/financial-programme/${programmeId}/requests`,
      { params }
    )
    return response.data
  },

  getRequestById: async (
    requestId: string
  ): Promise<ApiItemResponse<FinancialProgrammeRequest>> => {
    const response = await api.get(`/financial-programme/requests/${requestId}`)
    return response.data
  },

  createRequest: async (
    programmeId: string,
    data: CreateFinancialProgrammeRequestData
  ): Promise<ApiItemResponse<FinancialProgrammeRequest>> => {
    const response = await api.post(
      `/financial-programme/${programmeId}/requests`,
      data
    )
    return response.data
  },

  updateRequest: async (
    requestId: string,
    data: UpdateFinancialProgrammeRequestData
  ): Promise<ApiItemResponse<FinancialProgrammeRequest>> => {
    const response = await api.put(
      `/financial-programme/requests/${requestId}`,
      data
    )
    return response.data
  },

  getReferrals: async (
    programmeId: string,
    params: FinancialProgrammeEntryQueryParams = {}
  ): Promise<ApiListResponse<FinancialProgrammeReferral>> => {
    const response = await api.get(
      `/financial-programme/${programmeId}/referrals`,
      { params }
    )
    return response.data
  },

  getReferralById: async (
    referralId: string
  ): Promise<ApiItemResponse<FinancialProgrammeReferral>> => {
    const response = await api.get(
      `/financial-programme/referrals/${referralId}`
    )
    return response.data
  },

  createReferral: async (
    programmeId: string,
    data: CreateFinancialProgrammeReferralData
  ): Promise<ApiItemResponse<FinancialProgrammeReferral>> => {
    const response = await api.post(
      `/financial-programme/${programmeId}/referrals`,
      data
    )
    return response.data
  },

  updateReferral: async (
    referralId: string,
    data: UpdateFinancialProgrammeReferralData
  ): Promise<ApiItemResponse<FinancialProgrammeReferral>> => {
    const response = await api.put(
      `/financial-programme/referrals/${referralId}`,
      data
    )
    return response.data
  },

  getDonations: async (
    programmeId: string,
    params: FinancialProgrammeEntryQueryParams = {}
  ): Promise<ApiListResponse<FinancialProgrammeDonation>> => {
    const response = await api.get(
      `/financial-programme/${programmeId}/donations`,
      { params }
    )
    return response.data
  },

  getDonationById: async (
    donationId: string
  ): Promise<ApiItemResponse<FinancialProgrammeDonation>> => {
    const response = await api.get(
      `/financial-programme/donations/${donationId}`
    )
    return response.data
  },

  createDonation: async (
    programmeId: string,
    data: CreateFinancialProgrammeDonationData
  ): Promise<ApiItemResponse<FinancialProgrammeDonation>> => {
    const response = await api.post(
      `/financial-programme/${programmeId}/donations`,
      data
    )
    return response.data
  },

  updateDonation: async (
    donationId: string,
    data: UpdateFinancialProgrammeDonationData
  ): Promise<ApiItemResponse<FinancialProgrammeDonation>> => {
    const response = await api.put(
      `/financial-programme/donations/${donationId}`,
      data
    )
    return response.data
  },

  getHousingProjects: async (
    programmeId: string,
    params: FinancialProgrammeEntryQueryParams = {}
  ): Promise<ApiListResponse<FinancialProgrammeHousingProject>> => {
    const response = await api.get(
      `/financial-programme/${programmeId}/housing-projects`,
      { params }
    )
    return response.data
  },

  getHousingProjectById: async (
    housingProjectId: string
  ): Promise<ApiItemResponse<FinancialProgrammeHousingProject>> => {
    const response = await api.get(
      `/financial-programme/housing-projects/${housingProjectId}`
    )
    return response.data
  },

  createHousingProject: async (
    programmeId: string,
    data: CreateFinancialProgrammeHousingProjectData
  ): Promise<ApiItemResponse<FinancialProgrammeHousingProject>> => {
    const response = await api.post(
      `/financial-programme/${programmeId}/housing-projects`,
      data
    )
    return response.data
  },

  updateHousingProject: async (
    housingProjectId: string,
    data: UpdateFinancialProgrammeHousingProjectData
  ): Promise<ApiItemResponse<FinancialProgrammeHousingProject>> => {
    const response = await api.put(
      `/financial-programme/housing-projects/${housingProjectId}`,
      data
    )
    return response.data
  },
}
