import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { financialProgrammeService } from "@/services/financialProgrammeService"
import type {
  CreateFinancialProgrammeDonationData,
  CreateFinancialProgrammeHousingProjectData,
  CreateFinancialProgrammeReferralData,
  CreateFinancialProgrammeRequestData,
  FinancialProgrammeEntryQueryParams,
  FinancialProgrammeFormData,
  FinancialProgrammeQueryParams,
  UpdateFinancialProgrammeDonationData,
  UpdateFinancialProgrammeHousingProjectData,
  UpdateFinancialProgrammeReferralData,
  UpdateFinancialProgrammeRequestData,
} from "@/types/financial-programme"

export const financialProgrammeKeys = {
  all: ["financial-programmes"] as const,
  lists: () => [...financialProgrammeKeys.all, "list"] as const,
  list: (params: FinancialProgrammeQueryParams) =>
    [...financialProgrammeKeys.lists(), params] as const,
  details: () => [...financialProgrammeKeys.all, "detail"] as const,
  detail: (id: string) => [...financialProgrammeKeys.details(), id] as const,
  requests: (programmeId: string, params: FinancialProgrammeEntryQueryParams) =>
    [...financialProgrammeKeys.detail(programmeId), "requests", params] as const,
  request: (requestId: string) =>
    [...financialProgrammeKeys.all, "request", requestId] as const,
  referrals: (programmeId: string, params: FinancialProgrammeEntryQueryParams) =>
    [...financialProgrammeKeys.detail(programmeId), "referrals", params] as const,
  referral: (referralId: string) =>
    [...financialProgrammeKeys.all, "referral", referralId] as const,
  donations: (programmeId: string, params: FinancialProgrammeEntryQueryParams) =>
    [...financialProgrammeKeys.detail(programmeId), "donations", params] as const,
  donation: (donationId: string) =>
    [...financialProgrammeKeys.all, "donation", donationId] as const,
  housingProjects: (
    programmeId: string,
    params: FinancialProgrammeEntryQueryParams
  ) => [...financialProgrammeKeys.detail(programmeId), "housing-projects", params] as const,
  housingProject: (housingProjectId: string) =>
    [...financialProgrammeKeys.all, "housing-project", housingProjectId] as const,
}

export const useFinancialProgrammes = (
  params: FinancialProgrammeQueryParams = {}
) =>
  useQuery({
    queryKey: financialProgrammeKeys.list(params),
    queryFn: () => financialProgrammeService.getFinancialProgrammes(params),
  })

export const useFinancialProgramme = (id: string) =>
  useQuery({
    queryKey: financialProgrammeKeys.detail(id),
    queryFn: () => financialProgrammeService.getFinancialProgrammeById(id),
    enabled: Boolean(id),
  })

export const useCreateFinancialProgramme = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FinancialProgrammeFormData) =>
      financialProgrammeService.createFinancialProgramme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.lists() })
    },
  })
}

export const useUpdateFinancialProgramme = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<FinancialProgrammeFormData>
    }) => financialProgrammeService.updateFinancialProgramme(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.detail(id) })
    },
  })
}

export const useDeleteFinancialProgramme = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financialProgrammeService.deleteFinancialProgramme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.lists() })
    },
  })
}

export const useFinancialProgrammeRequests = (
  programmeId: string,
  params: FinancialProgrammeEntryQueryParams = {}
) =>
  useQuery({
    queryKey: financialProgrammeKeys.requests(programmeId, params),
    queryFn: () => financialProgrammeService.getRequests(programmeId, params),
    enabled: Boolean(programmeId),
  })

export const useFinancialProgrammeRequest = (requestId: string) =>
  useQuery({
    queryKey: financialProgrammeKeys.request(requestId),
    queryFn: () => financialProgrammeService.getRequestById(requestId),
    enabled: Boolean(requestId),
  })

export const useCreateFinancialProgrammeRequest = (programmeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFinancialProgrammeRequestData) =>
      financialProgrammeService.createRequest(programmeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.detail(programmeId) })
      queryClient.invalidateQueries({
        queryKey: [...financialProgrammeKeys.detail(programmeId), "requests"],
      })
    },
  })
}

export const useUpdateFinancialProgrammeRequest = (programmeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string
      data: UpdateFinancialProgrammeRequestData
    }) => financialProgrammeService.updateRequest(requestId, data),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.detail(programmeId) })
      queryClient.invalidateQueries({
        queryKey: [...financialProgrammeKeys.detail(programmeId), "requests"],
      })
      queryClient.invalidateQueries({
        queryKey: financialProgrammeKeys.request(requestId),
      })
    },
  })
}

export const useFinancialProgrammeReferrals = (
  programmeId: string,
  params: FinancialProgrammeEntryQueryParams = {}
) =>
  useQuery({
    queryKey: financialProgrammeKeys.referrals(programmeId, params),
    queryFn: () => financialProgrammeService.getReferrals(programmeId, params),
    enabled: Boolean(programmeId),
  })

export const useFinancialProgrammeDonations = (
  programmeId: string,
  params: FinancialProgrammeEntryQueryParams = {}
) =>
  useQuery({
    queryKey: financialProgrammeKeys.donations(programmeId, params),
    queryFn: () => financialProgrammeService.getDonations(programmeId, params),
    enabled: Boolean(programmeId),
  })

export const useFinancialProgrammeHousingProjects = (
  programmeId: string,
  params: FinancialProgrammeEntryQueryParams = {}
) =>
  useQuery({
    queryKey: financialProgrammeKeys.housingProjects(programmeId, params),
    queryFn: () => financialProgrammeService.getHousingProjects(programmeId, params),
    enabled: Boolean(programmeId),
  })

export const useCreateFinancialProgrammeReferral = (programmeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFinancialProgrammeReferralData) =>
      financialProgrammeService.createReferral(programmeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.detail(programmeId) })
      queryClient.invalidateQueries({
        queryKey: [...financialProgrammeKeys.detail(programmeId), "referrals"],
      })
    },
  })
}

export const useUpdateFinancialProgrammeReferral = (programmeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      referralId,
      data,
    }: {
      referralId: string
      data: UpdateFinancialProgrammeReferralData
    }) => financialProgrammeService.updateReferral(referralId, data),
    onSuccess: (_, { referralId }) => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.detail(programmeId) })
      queryClient.invalidateQueries({
        queryKey: [...financialProgrammeKeys.detail(programmeId), "referrals"],
      })
      queryClient.invalidateQueries({
        queryKey: financialProgrammeKeys.referral(referralId),
      })
    },
  })
}

export const useCreateFinancialProgrammeDonation = (programmeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFinancialProgrammeDonationData) =>
      financialProgrammeService.createDonation(programmeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.detail(programmeId) })
      queryClient.invalidateQueries({
        queryKey: [...financialProgrammeKeys.detail(programmeId), "donations"],
      })
    },
  })
}

export const useUpdateFinancialProgrammeDonation = (programmeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      donationId,
      data,
    }: {
      donationId: string
      data: UpdateFinancialProgrammeDonationData
    }) => financialProgrammeService.updateDonation(donationId, data),
    onSuccess: (_, { donationId }) => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.detail(programmeId) })
      queryClient.invalidateQueries({
        queryKey: [...financialProgrammeKeys.detail(programmeId), "donations"],
      })
      queryClient.invalidateQueries({
        queryKey: financialProgrammeKeys.donation(donationId),
      })
    },
  })
}

export const useCreateFinancialProgrammeHousingProject = (programmeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFinancialProgrammeHousingProjectData) =>
      financialProgrammeService.createHousingProject(programmeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.detail(programmeId) })
      queryClient.invalidateQueries({
        queryKey: [...financialProgrammeKeys.detail(programmeId), "housing-projects"],
      })
    },
  })
}

export const useUpdateFinancialProgrammeHousingProject = (programmeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      housingProjectId,
      data,
    }: {
      housingProjectId: string
      data: UpdateFinancialProgrammeHousingProjectData
    }) => financialProgrammeService.updateHousingProject(housingProjectId, data),
    onSuccess: (_, { housingProjectId }) => {
      queryClient.invalidateQueries({ queryKey: financialProgrammeKeys.detail(programmeId) })
      queryClient.invalidateQueries({
        queryKey: [...financialProgrammeKeys.detail(programmeId), "housing-projects"],
      })
      queryClient.invalidateQueries({
        queryKey: financialProgrammeKeys.housingProject(housingProjectId),
      })
    },
  })
}
