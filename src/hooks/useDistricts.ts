import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { districtService } from '@/services/district.service'
import { campusService } from '@/services/campus.service'

// Query keys
export const districtKeys = {
    all: ['districts'] as const,
    lists: () => [...districtKeys.all, 'list'] as const,
    list: (params: any) => [...districtKeys.lists(), params] as const,
    details: () => [...districtKeys.all, 'detail'] as const,
    detail: (id: string) => [...districtKeys.details(), id] as const,
}

export const useDistricts = (params: { page_no?: number; limit?: number; search?: string; status?: string } = {}) => {
    return useQuery({
        queryKey: districtKeys.list(params),
        queryFn: async () => {
            const res = await districtService.getDistricts(params)

            // If we are just getting a list (not full_data for dropdowns), we might need to map extra data
            // logical check: if paginated response format is returned
            const districts = Array.isArray(res.data) ? res.data : []
            if (!districts.length) return res

            // Enrich with campus counts if needed (mimicking the logic from levels.tsx)
            const mappedDistricts = await Promise.all(districts.map(async (d: any) => {
                let campusCount = 0;
                try {
                    // Only fetch count if it's not already on the object (future proofing)
                    if (d.totalCampuses !== undefined) {
                        campusCount = d.totalCampuses
                    } else {
                        const campusRes = await campusService.getCampuses({
                            district: d._id,
                            limit: 1
                        });
                        campusCount = campusRes.total_count || 0;
                    }
                } catch (err) {
                    console.error(`Failed to fetch campus count for district ${d.name}`, err);
                }

                return {
                    ...d,
                    totalCampuses: campusCount,
                    totalMembers: d.totalMembers || d.memberCount || 0
                };
            }));

            return {
                ...res,
                data: mappedDistricts
            }
        },
        staleTime: 5 * 60 * 1000,
    })
}

export const useAllDistricts = () => {
    return useQuery({
        queryKey: districtKeys.list({ full_data: true, status: 'active' }),
        queryFn: () => districtService.getDistricts({ full_data: true, status: 'active' }),
        staleTime: 30 * 60 * 1000, // Keep this longer
        select: (data: any) => {
            // Return just the array of data, normalized if needed
            return (data.data || []).map((d: any) => ({
                id: d._id,
                name: d.name
            }))
        }
    })
}

export const useCreateDistrict = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: { name: string }) => districtService.createDistrict(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: districtKeys.lists() })
        }
    })
}

export const useDeleteDistrict = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => districtService.deleteDistrict(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: districtKeys.lists() })
        }
    })
}
