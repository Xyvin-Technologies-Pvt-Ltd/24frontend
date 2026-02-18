import { api } from '@/lib/api'
import type {
    SettingsResponse,
    UpdateSettingsData
} from '@/types/settings'

export const settingsService = {
    getSettings: async (): Promise<SettingsResponse> => {
        const response = await api.get('/settings')
        return response.data
    },

    updateSettings: async (settingsData: UpdateSettingsData): Promise<SettingsResponse> => {
        const response = await api.put('/settings', settingsData)
        return response.data
    }
}
