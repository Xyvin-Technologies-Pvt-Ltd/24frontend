import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { campusService } from '@/services/campusService'
import type { CreateCampusData, UpdateCampusData, CampusesQueryParams } from '@/types/campus'

// Query keys
export const campusKeys = {
    all: ['campuses'] as const,
    lists: () => [...campusKeys.all, 'list'] as const,
    list: (params: CampusesQueryParams) => [...campusKeys.lists(), params] as const,
    details: () => [...campusKeys.all, 'detail'] as const,
    detail: (id: string) => [...campusKeys.details(), id] as const,
}

// Queries
export const useCampuses = (params: CampusesQueryParams = {}) => {
    return useQuery({
        queryKey: campusKeys.list(params),
        queryFn: () => campusService.getCampuses(params),
        staleTime: 5 * 60 * 1000,
    })
}

export const useCampus = (id: string) => {
    return useQuery({
        queryKey: campusKeys.detail(id),
        queryFn: () => campusService.getCampusById(id),
        enabled: !!id,
    })
}

// Mutations
export const useCreateCampus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateCampusData) => campusService.createCampus(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: campusKeys.lists() }),
    })
}

export const useUpdateCampus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCampusData }) =>
            campusService.updateCampus(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: campusKeys.lists() })
            queryClient.invalidateQueries({ queryKey: campusKeys.detail(variables.id) })
        },
    })
}

export const useDeleteCampus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => campusService.deleteCampus(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: campusKeys.lists() }),
    })
}
