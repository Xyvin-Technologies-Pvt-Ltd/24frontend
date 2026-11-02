import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { initiativeService } from '@/services/initiativeService'
import type {
  CertificatePreviewData,
  InitiativeFormData,
  InitiativesQueryParams,
  ParticipantsQueryParams,
} from '@/types/initiative'

export const initiativeKeys = {
  all: ['initiatives'] as const,
  lists: () => [...initiativeKeys.all, 'list'] as const,
  list: (params: InitiativesQueryParams) => [...initiativeKeys.lists(), params] as const,
  details: () => [...initiativeKeys.all, 'detail'] as const,
  detail: (id: string) => [...initiativeKeys.details(), id] as const,
  participants: (id: string) => [...initiativeKeys.detail(id), 'participants'] as const,
  participantList: (id: string, params: ParticipantsQueryParams) =>
    [...initiativeKeys.participants(id), params] as const,
  analytics: (id: string) => [...initiativeKeys.detail(id), 'analytics'] as const,
  certificateDefaults: () => [...initiativeKeys.all, 'certificate-defaults'] as const,
}

export const useInitiatives = (params: InitiativesQueryParams = {}) =>
  useQuery({
    queryKey: initiativeKeys.list(params),
    queryFn: () => initiativeService.getInitiatives(params),
    staleTime: 60 * 1000,
  })

export const useInitiative = (id: string) =>
  useQuery({
    queryKey: initiativeKeys.detail(id),
    queryFn: () => initiativeService.getInitiativeById(id),
    enabled: !!id,
    retry: false,
  })

export const useCreateInitiative = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InitiativeFormData) => initiativeService.createInitiative(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: initiativeKeys.lists() })
    },
  })
}

export const useUpdateInitiative = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InitiativeFormData> }) =>
      initiativeService.updateInitiative(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: initiativeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: initiativeKeys.detail(variables.id) })
    },
  })
}

export const useUpdateInitiativeStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      initiativeService.updateInitiativeStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: initiativeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: initiativeKeys.detail(variables.id) })
    },
  })
}

export const useDeleteInitiative = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => initiativeService.deleteInitiative(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: initiativeKeys.lists() })
    },
  })
}

export const useInitiativeParticipants = (id: string, params: ParticipantsQueryParams = {}) =>
  useQuery({
    queryKey: initiativeKeys.participantList(id, params),
    queryFn: () => initiativeService.getParticipants(id, params),
    enabled: !!id,
  })

export const useInitiativeAnalytics = (id: string) =>
  useQuery({
    queryKey: initiativeKeys.analytics(id),
    queryFn: () => initiativeService.getAnalytics(id),
    enabled: !!id,
  })

export const useDownloadParticipants = () =>
  useMutation({
    mutationFn: ({ id, params = {} }: { id: string; params?: ParticipantsQueryParams; fileName?: string }) =>
      initiativeService.downloadParticipants(id, params),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${variables.fileName || 'participants'}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
  })

export const useCertificateDefaults = () =>
  useQuery({
    queryKey: initiativeKeys.certificateDefaults(),
    queryFn: () => initiativeService.getCertificateDefaults(),
    staleTime: Infinity,
  })

export const useCertificatePreview = () =>
  useMutation({
    mutationFn: (data: CertificatePreviewData) => initiativeService.previewCertificate(data),
  })
