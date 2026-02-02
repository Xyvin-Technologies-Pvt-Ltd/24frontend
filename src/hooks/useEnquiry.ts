import { useMutation } from '@tanstack/react-query'
import { enquiryService } from '@/services/enquiryService'
import type { CreateEnquiryData } from '@/types/enquiry'

export const useCreateEnquiry = () => {
    return useMutation({
        mutationFn: (data: CreateEnquiryData) => enquiryService.createEnquiry(data)
    })
}
