export interface CreateEnquiryData {
    name: string;
    email: string;
    phone?: string;
    message: string;
    receiver: string;
}

export interface EnquiryResponse {
    status: boolean;
    message: string;
    data: any;
}
