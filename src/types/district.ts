export interface District {
  _id: string
  uid: string
  name: string
  status: 'active' | 'deleted'
  createdAt: string
  updatedAt: string
}

export interface CreateDistrictData {
  name: string
  status?: 'active' | 'deleted'
}

export interface UpdateDistrictData extends Partial<CreateDistrictData> {}

export interface DistrictsQueryParams {
  page_no?: number
  limit?: number
  status?: 'active' | 'deleted'
  search?: string
  full_data?: boolean
}

export interface DistrictsResponse {
  success: boolean
  message: string
  data: District[]
  total_count: number
}

export interface DistrictResponse {
  success: boolean
  message: string
  data: District
}
