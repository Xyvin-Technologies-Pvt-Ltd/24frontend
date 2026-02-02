import { api } from '@/lib/api'
import type { CreateEnquiryData, EnquiryResponse } from '@/types/enquiry'

export const enquiryService = {
    createEnquiry: async (data: CreateEnquiryData): Promise<EnquiryResponse> => {
        const response = await api.post('/enquiry', data)
        return response.data
    }
}
