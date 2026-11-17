import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { associationService } from "@/services/associationService"
import type {
  AssociationFormData,
  AssociationQueryParams,
  AssociationStatus,
} from "@/types/association"

export const associationKeys = {
  all: ["associations"] as const,
  lists: () => [...associationKeys.all, "list"] as const,
  list: (params: AssociationQueryParams) =>
    [...associationKeys.lists(), params] as const,
  details: () => [...associationKeys.all, "detail"] as const,
  detail: (id: string) => [...associationKeys.details(), id] as const,
  stats: () => [...associationKeys.all, "stats"] as const,
}

export const useAssociations = (params: AssociationQueryParams = {}) =>
  useQuery({
    queryKey: associationKeys.list(params),
    queryFn: () => associationService.getAssociations(params),
  })

export const useAssociation = (id: string) =>
  useQuery({
    queryKey: associationKeys.detail(id),
    queryFn: () => associationService.getAssociationById(id),
    enabled: Boolean(id),
  })

export const useAssociationStats = () =>
  useQuery({
    queryKey: associationKeys.stats(),
    queryFn: () => associationService.getAssociationStats(),
  })

export const useCreateAssociation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AssociationFormData) =>
      associationService.createAssociation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: associationKeys.all })
    },
  })
}

export const useUpdateAssociation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<AssociationFormData>
    }) => associationService.updateAssociation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: associationKeys.all })
      queryClient.invalidateQueries({
        queryKey: associationKeys.detail(variables.id),
      })
    },
  })
}

export const useUpdateAssociationStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: {
        status: AssociationStatus
        is_verified?: boolean
        rejection_reason?: string
      }
    }) => associationService.updateAssociationStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: associationKeys.all })
      queryClient.invalidateQueries({
        queryKey: associationKeys.detail(variables.id),
      })
    },
  })
}

export const useDeleteAssociation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => associationService.deleteAssociation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: associationKeys.all })
    },
  })
}
