import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/userService'

export const levelStatsKeys = {
    all: ['level-stats'] as const,
}

export const useLevelStats = () => {
    return useQuery({
        queryKey: levelStatsKeys.all,
        queryFn: async () => {
            // Fetch a large batch of users to calculate stats
            // Ideally this would be a specialized stats endpoint
            const res = await userService.getUsers({ limit: 5000 })
            const users = res.data || []

            const districtCounts: Record<string, number> = {}
            const campusCounts: Record<string, number> = {}

            users.forEach(user => {
                if (user.campus) {
                    const campusId = user.campus._id
                    campusCounts[campusId] = (campusCounts[campusId] || 0) + 1

                    if (user.campus.district) {
                        const districtId = user.campus.district._id
                        districtCounts[districtId] = (districtCounts[districtId] || 0) + 1
                    }
                }
            })

            return {
                districtCounts,
                campusCounts
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
