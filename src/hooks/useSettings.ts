import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/settingsService'
import type { UpdateSettingsData } from '@/types/settings'

export const settingsKeys = {
    all: ['settings'] as const,
    details: () => [...settingsKeys.all, 'detail'] as const,
}

export const useSettings = () => {
    return useQuery({
        queryKey: settingsKeys.details(),
        queryFn: () => settingsService.getSettings(),
        staleTime: 5 * 60 * 1000,
    })
}

export const useUpdateSettings = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (settingsData: UpdateSettingsData) =>
            settingsService.updateSettings(settingsData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.details() })
        },
    })
}
