export interface Campus {
  _id: string
  uid: string
  name: string
  district: string // this will store district _id
  status: 'listed' | 'unlisted' | 'deleted'
  createdAt: string
  updatedAt: string
}

export interface CreateCampusData {
  name: string
  district: string
  status?: 'listed' | 'unlisted' | 'deleted'
}

export interface UpdateCampusData extends Partial<CreateCampusData> {}

export interface CampusesQueryParams {
  page_no?: number
  limit?: number
  status?: 'listed' | 'unlisted' | 'deleted'
  search?: string
  district?: string
  start_date?: string
  end_date?: string
}

export interface CampusesResponse {
  success: boolean
  message: string
  data: Campus[]
  total_count: number
}

export interface CampusResponse {
  success: boolean
  message: string
  data: Campus
}
