import { api } from "@/lib/api"
import type {
  BackendResponse,
  CreateJobData,
  CreateJobProviderData,
  ItemResponse,
  Job,
  JobApplication,
  JobApplicationQueryParams,
  JobProvider,
  JobProviderQueryParams,
  PagedResponse,
  ProviderJobQueryParams,
  UpdateJobData,
  UpdateJobProviderData,
} from "@/types/job-provider"

const toPagedResponse = <T>(response: BackendResponse<T[]>): PagedResponse<T> => ({
  success: response.status >= 200 && response.status < 300,
  message: response.message,
  data: response.data,
  total_count: response.total_count || 0,
})

const toItemResponse = <T>(response: BackendResponse<T>): ItemResponse<T> => ({
  success: response.status >= 200 && response.status < 300,
  message: response.message,
  data: response.data,
})

const appendIfDefined = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return
  }

  if (value instanceof File) {
    formData.append(key, value)
    return
  }

  formData.append(key, String(value))
}

const buildProviderFormData = (
  providerData: CreateJobProviderData | UpdateJobProviderData
) => {
  const formData = new FormData()

  appendIfDefined(formData, "provider_name", providerData.provider_name)
  appendIfDefined(formData, "email", providerData.email)
  appendIfDefined(formData, "mobile_number", providerData.mobile_number)
  appendIfDefined(formData, "website_url", providerData.website_url)
  appendIfDefined(formData, "location", providerData.location)
  appendIfDefined(formData, "industry_type", providerData.industry_type)
  appendIfDefined(formData, "company_size", providerData.company_size)
  appendIfDefined(formData, "status", providerData.status)

  if (providerData.company_logo instanceof File) {
    formData.append("company_logo", providerData.company_logo)
  }

  return formData
}

export const jobProviderService = {
  getJobProviders: async (
    params: JobProviderQueryParams = {}
  ): Promise<PagedResponse<JobProvider>> => {
    const response = await api.get("/job-providers", { params })
    return toPagedResponse<JobProvider>(response.data)
  },

  getJobProviderById: async (id: string): Promise<ItemResponse<JobProvider>> => {
    const response = await api.get(`/job-providers/${id}`)
    return toItemResponse<JobProvider>(response.data)
  },

  createJobProvider: async (
    providerData: CreateJobProviderData
  ): Promise<ItemResponse<JobProvider>> => {
    const response = await api.post("/job-providers", buildProviderFormData(providerData), {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return toItemResponse<JobProvider>(response.data)
  },

  updateJobProvider: async (
    id: string,
    providerData: UpdateJobProviderData
  ): Promise<ItemResponse<JobProvider>> => {
    const response = await api.put(`/job-providers/${id}`, buildProviderFormData(providerData), {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return toItemResponse<JobProvider>(response.data)
  },

  deleteJobProvider: async (id: string): Promise<ItemResponse<JobProvider>> => {
    const response = await api.delete(`/job-providers/${id}`)
    return toItemResponse<JobProvider>(response.data)
  },

  getProviderJobs: async (
    providerId: string,
    params: ProviderJobQueryParams = {}
  ): Promise<PagedResponse<Job>> => {
    const response = await api.get(`/job-providers/${providerId}/jobs`, { params })
    return toPagedResponse<Job>(response.data)
  },

  createProviderJob: async (
    providerId: string,
    jobData: CreateJobData
  ): Promise<ItemResponse<Job>> => {
    const response = await api.post(`/job-providers/${providerId}/jobs`, jobData)
    return toItemResponse<Job>(response.data)
  },

  getJobById: async (jobId: string): Promise<ItemResponse<Job>> => {
    const response = await api.get(`/job-providers/jobs/${jobId}`)
    return toItemResponse<Job>(response.data)
  },

  updateJob: async (
    jobId: string,
    jobData: UpdateJobData
  ): Promise<ItemResponse<Job>> => {
    const response = await api.put(`/job-providers/jobs/${jobId}`, jobData)
    return toItemResponse<Job>(response.data)
  },

  deleteJob: async (jobId: string): Promise<ItemResponse<Job>> => {
    const response = await api.delete(`/job-providers/jobs/${jobId}`)
    return toItemResponse<Job>(response.data)
  },

  getJobApplications: async (
    jobId: string,
    params: JobApplicationQueryParams = {}
  ): Promise<PagedResponse<JobApplication>> => {
    const response = await api.get(`/job-providers/jobs/${jobId}/applications`, {
      params,
    })
    return toPagedResponse<JobApplication>(response.data)
  },
}
