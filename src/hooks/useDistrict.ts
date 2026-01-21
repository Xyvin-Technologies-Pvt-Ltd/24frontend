import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { districtService } from '@/services/districtService'
import type { CreateDistrictData, UpdateDistrictData, DistrictsQueryParams } from '@/types/district'

// Query keys
export const districtKeys = {
  all: ['districts'] as const,
  lists: () => [...districtKeys.all, 'list'] as const,
  list: (params: DistrictsQueryParams) => [...districtKeys.lists(), params] as const,
  details: () => [...districtKeys.all, 'detail'] as const,
  detail: (id: string) => [...districtKeys.details(), id] as const,
}

// Queries
export const useDistricts = (params: DistrictsQueryParams = {}) => {
  return useQuery({
    queryKey: districtKeys.list(params),
    queryFn: () => districtService.getDistricts(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const useDistrict = (id: string) => {
  return useQuery({
    queryKey: districtKeys.detail(id),
    queryFn: () => districtService.getDistrictById(id),
    enabled: !!id,
  })
}

// Mutations
export const useCreateDistrict = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDistrictData) => districtService.createDistrict(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: districtKeys.lists() }),
  })
}

export const useUpdateDistrict = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDistrictData }) => 
      districtService.updateDistrict(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() })
      queryClient.invalidateQueries({ queryKey: districtKeys.detail(variables.id) })
    },
  })
}

export const useDeleteDistrict = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => districtService.deleteDistrict(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: districtKeys.lists() }),
  })
}
