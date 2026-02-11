import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { campusService } from '@/services/campus.service'
import { useLevelStats } from './useLevelStats'

// Query keys
export const campusKeys = {
    all: ['campuses'] as const,
    lists: () => [...campusKeys.all, 'list'] as const,
    list: (params: any) => [...campusKeys.lists(), params] as const,
    details: () => [...campusKeys.all, 'detail'] as const,
    detail: (id: string) => [...campusKeys.details(), id] as const,
}

export const useCampuses = (params: { page_no?: number; limit?: number; search?: string; status?: string; district?: string } = {}) => {
    const { data: levelStats } = useLevelStats()

    return useQuery({
        queryKey: campusKeys.list(params),
        queryFn: async () => {
            const res = await campusService.getCampuses(params)

            const campuses = Array.isArray(res.data) ? res.data : []
            if (!campuses.length) return res

            const mappedCampuses = (campuses as any[]).map(c => ({
                ...c,
                totalMembers: levelStats?.campusCounts?.[c._id] || 0
            }))

            return {
                ...res,
                data: mappedCampuses
            }
        },
        staleTime: 5 * 60 * 1000,
    })
}

// Simple hook for dropdowns - no stats needed
export const useAllCampuses = (params: { status?: string; district?: string } = {}) => {
    return useQuery({
        queryKey: [...campusKeys.all, 'simple', params],
        queryFn: async () => {
            const queryParams: any = {
                limit: 1000,
                status: params.status || 'listed' // Changed from 'active' to 'listed' to match campus model
            }

            // Add district filter if provided
            if (params.district) {
                queryParams.district = params.district
            }

            const res = await campusService.getCampuses(queryParams)
            return res
        },
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
        enabled: true, // Always enabled, but will filter by district if provided
    })
}

export const useCreateCampus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: { name: string; district: string }) => campusService.createCampus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: campusKeys.lists() })
            // Also invalidate districts because district campus counts might change (though distinct service)
            // But technically district list has "totalCampuses", so we should invalidate districts too
            queryClient.invalidateQueries({ queryKey: ['districts'] })
        }
    })
}

export const useBulkCreateCampus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: { name: string; district_name: string }[]) => campusService.bulkCreateCampus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: campusKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ['districts'] })
        }
    })
}

export const useDeleteCampus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => campusService.deleteCampus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: campusKeys.lists() })
            // Invalidate districts to update counts
            queryClient.invalidateQueries({ queryKey: ['districts'] })
        }
    })
}

export const useUpdateCampus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name?: string; district?: string; status?: string } }) =>
            campusService.updateCampus(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: campusKeys.lists() })
            queryClient.invalidateQueries({ queryKey: campusKeys.details() })
            // Also invalidate districts because district campus counts might change if district is changed
            queryClient.invalidateQueries({ queryKey: ['districts'] })
        }
    })
}
