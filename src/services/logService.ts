import { api } from '@/lib/api'
import type {
    LogsResponse,
    LogsQueryParams
} from '@/types/log'

export const logService = {
    // Get logs with pagination and filters
    getLogs: async (params: LogsQueryParams = {}): Promise<LogsResponse> => {
        const response = await api.get('/logs', { params })
        return response.data
    },

    // Get log by ID
    getLogById: async (id: string): Promise<any> => {
        const response = await api.get(`/logs/${id}`)
        return response.data
    }
}
