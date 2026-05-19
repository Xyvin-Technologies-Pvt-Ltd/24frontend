import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { jobProviderService } from "@/services/jobProviderService"
import type {
  CreateJobData,
  CreateJobProviderData,
  JobApplicationQueryParams,
  JobProviderQueryParams,
  ProviderJobQueryParams,
  UpdateJobData,
  UpdateJobProviderData,
} from "@/types/job-provider"

export const jobProviderKeys = {
  all: ["job-providers"] as const,
  lists: () => [...jobProviderKeys.all, "list"] as const,
  list: (params: JobProviderQueryParams) => [...jobProviderKeys.lists(), params] as const,
  details: () => [...jobProviderKeys.all, "detail"] as const,
  detail: (id: string) => [...jobProviderKeys.details(), id] as const,
  jobs: (providerId: string) => [...jobProviderKeys.detail(providerId), "jobs"] as const,
  jobList: (providerId: string, params: ProviderJobQueryParams) =>
    [...jobProviderKeys.jobs(providerId), params] as const,
  jobDetails: () => [...jobProviderKeys.all, "job-detail"] as const,
  jobDetail: (jobId: string) => [...jobProviderKeys.jobDetails(), jobId] as const,
  applications: (jobId: string) => [...jobProviderKeys.jobDetail(jobId), "applications"] as const,
  applicationList: (jobId: string, params: JobApplicationQueryParams) =>
    [...jobProviderKeys.applications(jobId), params] as const,
}

export const useJobProviders = (params: JobProviderQueryParams = {}) =>
  useQuery({
    queryKey: jobProviderKeys.list(params),
    queryFn: () => jobProviderService.getJobProviders(params),
    staleTime: 5 * 60 * 1000,
  })

export const useJobProvider = (id: string) =>
  useQuery({
    queryKey: jobProviderKeys.detail(id),
    queryFn: () => jobProviderService.getJobProviderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

export const useCreateJobProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (providerData: CreateJobProviderData) =>
      jobProviderService.createJobProvider(providerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobProviderKeys.lists() })
    },
  })
}

export const useUpdateJobProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      providerData,
    }: {
      id: string
      providerData: UpdateJobProviderData
    }) => jobProviderService.updateJobProvider(id, providerData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: jobProviderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobProviderKeys.detail(variables.id) })
    },
  })
}

export const useProviderJobs = (
  providerId: string,
  params: ProviderJobQueryParams = {}
) =>
  useQuery({
    queryKey: jobProviderKeys.jobList(providerId, params),
    queryFn: () => jobProviderService.getProviderJobs(providerId, params),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
  })

export const useCreateProviderJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      providerId,
      jobData,
    }: {
      providerId: string
      jobData: CreateJobData
    }) => jobProviderService.createProviderJob(providerId, jobData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: jobProviderKeys.jobs(variables.providerId) })
      queryClient.invalidateQueries({ queryKey: jobProviderKeys.detail(variables.providerId) })
      queryClient.invalidateQueries({ queryKey: jobProviderKeys.lists() })
    },
  })
}

export const useJob = (jobId: string) =>
  useQuery({
    queryKey: jobProviderKeys.jobDetail(jobId),
    queryFn: () => jobProviderService.getJobById(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
  })

export const useUpdateJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, jobData }: { jobId: string; jobData: UpdateJobData }) =>
      jobProviderService.updateJob(jobId, jobData),
    onSuccess: (response, variables) => {
      const providerId = response.data.provider
      queryClient.invalidateQueries({ queryKey: jobProviderKeys.jobDetail(variables.jobId) })
      queryClient.invalidateQueries({ queryKey: jobProviderKeys.jobs(providerId) })
      queryClient.invalidateQueries({ queryKey: jobProviderKeys.detail(providerId) })
      queryClient.invalidateQueries({ queryKey: jobProviderKeys.lists() })
    },
  })
}

export const useJobApplications = (
  jobId: string,
  params: JobApplicationQueryParams = {}
) =>
  useQuery({
    queryKey: jobProviderKeys.applicationList(jobId, params),
    queryFn: () => jobProviderService.getJobApplications(jobId, params),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
  })
